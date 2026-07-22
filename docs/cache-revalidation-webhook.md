# Cache revalidation webhook — spec

## Contexto

El frontend cachea datos "casi estáticos" del CMS (menú de navegación, footer,
árbol de categorías/taxonomías, config del sitio) usando Next.js `'use cache: remote'`
con `cacheLife('hours')` y `cacheTag(...)` (ver `src/lib/swipall/cached.ts`,
`src/components/layout/navbar/navbar-collections.tsx`, `src/components/layout/footer.tsx`,
`src/lib/swipall/site-assets.ts`).

Con TTLs de horas, un cambio publicado en el CMS puede tardar hasta 1 hora en
reflejarse en el sitio si dependemos solo de la expiración por tiempo. Este documento
especifica un webhook HTTP que el backend Django debe llamar **inmediatamente después
de guardar/publicar** un cambio relevante, para forzar la invalidación sin esperar el TTL.

**No es un WebSocket.** Es un endpoint HTTP simple (`POST`) que Django llama de forma
síncrona o vía tarea en background justo después de un `save()`/`post_save` en el
modelo correspondiente. No requiere conexión persistente ni infraestructura adicional
más allá de una petición HTTP saliente desde Django.

## Endpoint (a implementar en Next.js)

```
POST /api/revalidate
```

### Autenticación

Header `Authorization: Bearer <REVALIDATE_WEBHOOK_SECRET>`.

- El secreto se compara con `timingSafeEqual` (mismo patrón ya usado en
  `src/app/api/preview/render-block/route.tsx`), nunca con `===`.
- El secreto vive en `REVALIDATE_WEBHOOK_SECRET` (variable de entorno nueva,
  agregar a `.env.example`), y debe configurarse también del lado de Django
  como el valor a enviar en el header.
- Petición sin header, con secreto vacío, o que no haga match exacto → `401`.

### Body

```json
{
  "tags": ["navbar-collections", "taxonomy-category-tree"]
}
```

- `tags`: array de strings. Cada string debe corresponder **exactamente** a uno de
  los `cacheTag(...)` usados en el código (ver tabla de mapeo abajo). Tags desconocidas
  se ignoran silenciosamente (no es error, para tolerar despliegues donde el código
  del frontend cambia los nombres de tags antes/después que Django).
- Alternativa más simple si Django no quiere mantener el mapeo de tags exacto:
  aceptar también `{"scope": "menu"}` con un `scope` fijo predefinido
  (`menu` | `footer` | `taxonomy` | `site-config` | `all`) que el endpoint traduce
  internamente a la lista de tags correspondiente. Recomendado para simplicidad del
  lado de Django — no tiene que conocer los nombres de tags internos del frontend,
  solo la categoría de contenido que cambió.

### Respuesta

- `200 { "revalidated": ["navbar-collections", "taxonomy-category-tree"] }` en éxito.
- `400` si el body no es JSON válido o falta `tags`/`scope`.
- `401` si falla la autenticación.
- `500` solo si `revalidateTag()` lanza (no debería pasar en operación normal).

### Implementación (referencia, no implementado aún)

```ts
// src/app/api/revalidate/route.ts
import { revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import { timingSafeEqual } from 'crypto';

const SCOPE_TAGS: Record<string, string[]> = {
  menu: ['navbar-collections'],
  footer: [], // Footer no usa cacheTag hoy; si se agrega, listar aquí.
  taxonomy: ['taxonomy-category-tree'], // + tags dinámicas taxonomy-{slug}, taxonomy-children-{id} no cubiertas por scope
  'site-config': [],
  all: ['navbar-collections', 'taxonomy-category-tree'],
};

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export async function POST(req: NextRequest) {
  const secret = process.env.REVALIDATE_WEBHOOK_SECRET;
  const auth = req.headers.get('authorization');
  const token = auth?.startsWith('Bearer ') ? auth.slice(7) : null;

  if (!secret || !token || !safeEqual(token, secret)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body || (!Array.isArray(body.tags) && typeof body.scope !== 'string')) {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  const tags: string[] = Array.isArray(body.tags)
    ? body.tags
    : SCOPE_TAGS[body.scope] ?? [];

  tags.forEach((tag) => revalidateTag(tag));

  return NextResponse.json({ revalidated: tags });
}
```

**Nota importante sobre tags dinámicas:** `getTaxonomyBySlugCached(slug)` y
`getTaxonomyChildrenCached(parentId)` usan tags con interpolación
(`taxonomy-${slug}`, `taxonomy-children-${parentId}`). El webhook no puede invalidar
"todas las taxonomías" sin conocer cada slug/id individual. Opciones:
1. Django envía el/los slugs específicos que cambiaron
   (`{"tags": ["taxonomy-bottoms", "taxonomy-children-<uuid>"]}`), o
2. se acepta invalidar solo `taxonomy-category-tree` (el árbol completo cacheado en
   `getAllCategoryGroups`) como aproximación razonable — cubre el caso de "se
   agregó/quitó/renombró una categoría", que es el cambio más común.

Se recomienda la opción 2 para el `scope: "taxonomy"` inicial, y añadir tags
específicas después si se necesita más granularidad.

## Instrucciones para el backend (Django)

### Qué disparar y cuándo

Usar `post_save` / `post_delete` signals (o el hook equivalente que ya use el
CMS para notificar cambios) en los modelos que alimentan estos endpoints:

| Modelo Django (aproximado, ajustar a nombres reales) | Endpoint REST que consume el frontend | `scope` a enviar |
|---|---|---|
| Modelo de menú / `CmsPost` con `parent__slug=menu-principal` | `/api/v1/cms/posts?parent__slug=...` | `menu` |
| Modelo de páginas del footer (`informacion`, `ayuda`, `datos-de-contacto`) | `/api/v1/cms/pages`, `/api/v1/cms/posts` | `footer` (agregar tag real cuando exista) |
| Modelo de Taxonomy (categorías) | `/api/v1/shop/taxonomies` | `taxonomy` |
| Config del sitio (logo, nombre, descripción) | `/api/v1/shop/site` | `site-config` |

### Cómo llamar al webhook

```python
# ejemplo, adaptar a la app real
import requests
from django.conf import settings

def notify_frontend_revalidation(scope: str):
    try:
        requests.post(
            f"{settings.FRONTEND_BASE_URL}/api/revalidate",
            json={"scope": scope},
            headers={"Authorization": f"Bearer {settings.REVALIDATE_WEBHOOK_SECRET}"},
            timeout=5,
        )
    except requests.RequestException:
        # No debe romper el flujo de guardado del CMS si el frontend está caído.
        # Loggear y continuar; el TTL de 1 hora sigue siendo el fallback.
        logger.warning("Failed to notify frontend cache revalidation", exc_info=True)
```

Llamar esto:
- En un `post_save` signal del modelo de menú/categoría/config relevante, **después**
  de que la transacción de guardado haya confirmado (usar `transaction.on_commit(...)`
  para evitar notificar antes de que el cambio sea visible vía la API REST).
- Idealmente en una tarea async (Celery/RQ/lo que ya use el proyecto) para no bloquear
  la respuesta del admin/API mientras se espera el webhook — el timeout de red no debe
  demorar el guardado del usuario en el CMS.
- Es **fire-and-forget**: si el webhook falla o el frontend no responde, el CMS debe
  seguir funcionando normalmente. El peor caso es que el frontend tarde hasta 1 hora
  (el TTL) en reflejar el cambio, que es el comportamiento actual sin este webhook.

### Variables de entorno a coordinar

- Backend (Django): `FRONTEND_BASE_URL` (URL del servicio Next.js en Cloud Run),
  `REVALIDATE_WEBHOOK_SECRET` (mismo valor que en el frontend).
- Frontend (Next.js): `REVALIDATE_WEBHOOK_SECRET` (agregar a `.env.example` y a
  la config de Cloud Run / Secret Manager).

El secreto debe generarse como un string aleatorio largo (ej. `openssl rand -hex 32`),
no reutilizar `PREVIEW_ACCESS_SECRET` (son propósitos distintos: uno gatea el iframe
de preview, el otro autentica un webhook server-to-server).

## Fuera de alcance de este documento

- La implementación real del endpoint `/api/revalidate` en Next.js (el código de
  referencia arriba es el punto de partida, falta implementarlo).
- Los signals/hooks específicos en Django (nombres de modelos reales, no se conocen
  desde el repo del frontend).
- Rate limiting del endpoint (recomendado si el CMS pudiera llamar el webhook en
  ráfagas grandes, ej. importación masiva de productos/categorías).
