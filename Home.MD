# Estructura de Página de Inicio (Home)

## 📋 Descripción General

La página de inicio está compuesta por bloques modulares (posts CMS) que se pueden agregar, reordenar y personalizar. Cada bloque tiene una categoría específica que define su tipo y comportamiento.

---

## 🏠 Post Raíz: Página de Inicio

```json
{
  "slug": "ecommerce-home",
  "title": "Inicio",
  "categories": [
    { "name": "Page", "slug": "page" },
    { "name": "Home", "slug": "home" }
  ],
  "parent": null
}
```

**Propósito:** Contenedor principal de la página. Este post actúa como referencia para todos los bloques secundarios.

---

## 🎨 Tipos de Bloques Disponibles

| Tipo | Slug | Descripción | Uso |
|------|------|-------------|-----|
| **Banner** | `home-banner` | Imagen grande con título y enlace | Promociones destacadas |
| **Banner Slider** | `home-banner-slider` | Carrusel de banners (completos o simples) | Múltiples promociones |
| **Categorías** | `home-categories` | Grilla de categorías con imágenes | Navegación visual |
| **Productos** | `home-products-by-category` | Lista de productos de una categoría | Mostrar stock destacado |
| **HTML Libre** | `home-html` | HTML personalizado | Anuncios, promos, dividers |
| **Sección TikTok** | `tik-tok-section` | Carrusel/grid de videos de TikTok embebidos | Prueba social, contenido de redes |

---

## 🔧 Estructura de Cada Bloque

### 1️⃣ Banner

**Slug:** `home-banner` | **Ordering:** 1, 2, 3... (orden de aparición)

```json
{
  "slug": "ecommerce-home-banner-1",
  "title": "Nueva colección",
  "excerpt": null,
  "body": "{\"subtitle\": \"Temporada 2026\", \"autoplay\": true}",
  "categories": [
    { "name": "Home", "slug": "home-block" },
    { "name": "Banner", "slug": "home-banner" }
  ],
  "link": "/coleccion/nueva",
  "featured_image": "/img/banner1.jpg",
  "ordering": 1,
  "parent": {
    "slug": "ecommerce-home",
    "title": "Inicio"
  }
}
```

**Campos importantes:**
- `body`: JSON con `subtitle` (texto secundario) y `autoplay` (rotación automática)
- `featured_image`: Imagen principal (recomendado: 1920x600px)
- `link`: Destino al hacer click
- `title`: Título principal

---

### 2️⃣ Categorías Destacadas

**Slug:** `home-categories` | **Típicamente:** Ordering 2

```json
{
  "slug": "ecommerce-home-categories",
  "title": "Categorías",
  "excerpt": null,
  "body": "{\"items\": [{\"slug\": \"maquillaje\", \"image\": \"/img/maq.jpg\"}, {\"slug\": \"perfumes\", \"image\": \"/img/perf.jpg\"}]}",
  "categories": [
    { "name": "Home", "slug": "home-block" },
    { "name": "Categorías", "slug": "home-categories" }
  ],
  "link": "/search",
  "ordering": 2,
  "parent": {
    "slug": "ecommerce-home",
    "title": "Inicio"
  }
}
```

**Campos importantes:**
- `body`: JSON con array `items`:
  - `slug`: Slug de la categoría (navegación)
  - `image`: Imagen de la categoría (recomendado: 300x300px)
- `link`: URL del botón "Ver todas" (opcional). Si no se define, cae a `/search`.

---

### 3️⃣ Productos por Categoría

**Slug:** `home-products-by-category` | **Típicamente:** Ordering 3+

```json
{
  "slug": "ecommerce-home-products-maquillaje",
  "title": "Maquillaje destacado",
  "excerpt": null,
  "body": "{\"category_slug\": \"maquillaje\", \"limit\": 8, \"order\": \"popular\"}",
  "categories": [
    { "name": "Home", "slug": "home-block" },
    { "name": "Productos", "slug": "home-products-by-category" }
  ],
  "ordering": 3,
  "parent": {
    "slug": "ecommerce-home",
    "title": "Inicio"
  }
}
```

**Campos importantes:**
- `body`: JSON con:
  - `category_slug`: Slug de la categoría a filtrar
  - `limit`: Cantidad de productos (4-12 recomendado)
  - `order`: Orden (`popular`, `new`, `price_asc`, `price_desc`)

---

### 4️⃣ Banner Slider (Contenedor)

**Slug:** `home-banner-slider` | **Típicamente:** Ordering 2-3

Este es un bloque **contenedor** que agrupa múltiples items tipo banner que se renderizan en un carrusel.

```json
{
  "slug": "ecommerce-home-banner-slider-main",
  "title": "Slider Principal",
  "excerpt": null,
  "body": "{\"autoplay\": true, \"duration\": 5000}",
  "categories": [
    { "name": "Home", "slug": "home-block" },
    { "name": "Banner Slider", "slug": "home-banner-slider" }
  ],
  "ordering": 2,
  "parent": {
    "slug": "ecommerce-home",
    "title": "Inicio"
  }
}
```

**Campos importantes:**
- `body`: JSON con configuración del slider:
  - `autoplay` (boolean): Rotación automática
  - `duration` (number): Tiempo en ms entre cambios (default 5000)

---

### 4.1 Items del Slider - Banner Completo

**Slug:** Personalizado | **Parent:** `ecommerce-home-banner-slider-main` | **Ordering:** 1, 2, 3...

Reutiliza la estructura de `home-banner` pero como child del slider:

```json
{
  "slug": "ecommerce-home-banner-slider-item-1",
  "title": "Colección Verano",
  "excerpt": "Descubre lo último en moda",
  "body": "{\"subtitle\": \"Temporada 2026\"}",
  "categories": [
    { "name": "Home", "slug": "home-block" },
    { "name": "Banner", "slug": "home-banner" }
  ],
  "link": "/coleccion/verano",
  "featured_image": "/img/banner-summer.jpg",
  "ordering": 1,
  "parent": {
    "slug": "ecommerce-home-banner-slider-main",
    "title": "Slider Principal"
  }
}
```

**Campos importantes:**
- `title`: Título principal (visible en el banner)
- `excerpt`: Subtítulo o descripción (visible en el banner)
- `body`: JSON con `subtitle` (texto secundario adicional)
- `featured_image`: Imagen principal (1920x600px)
- `link`: Destino al hacer click
- `categories`: Debe incluir `home-banner` para identificar como banner completo

---

### 4.2 Items del Slider - Imagen Simple

**Slug:** Personalizado | **Parent:** `ecommerce-home-banner-slider-main` | **Ordering:** 1, 2, 3...

Solo imagen, opcionalmente con link (sin botón visible):

```json
{
  "slug": "ecommerce-home-banner-slider-item-promo",
  "title": null,
  "excerpt": null,
  "body": null,
  "categories": [
    { "name": "Home", "slug": "home-block" },
    { "name": "Banner Slider Item", "slug": "home-banner-slider-item-image" }
  ],
  "link": "/shop",
  "featured_image": "/img/promo-banner.jpg",
  "ordering": 2,
  "parent": {
    "slug": "ecommerce-home-banner-slider-main",
    "title": "Slider Principal"
  }
}
```

**Campos importantes:**
- `featured_image`: Imagen principal (1920x600px)
- `link`: URL destino (opcional, si está presente toda la imagen es clickeable)
- `title`, `excerpt`, `body`: Todos null/vacíos
- `categories`: Debe incluir `home-banner-slider-item-image` para identificar como imagen simple

---

### 5️⃣ HTML Personalizado

**Slug:** `home-html` | **Típicamente:** Ordering final

```json
{
  "slug": "ecommerce-home-html-promo",
  "title": null,
  "excerpt": null,
  "body": "<div class=\"promo\">Envíos gratis desde $999</div>",
  "categories": [
    { "name": "Home", "slug": "home-block" },
    { "name": "HTML", "slug": "home-html" }
  ],
  "ordering": 4,
  "parent": {
    "slug": "ecommerce-home",
    "title": "Inicio"
  }
}
```

**Campos importantes:**
- `body`: HTML puro (sin escapar)
- `title`: Opcional (puede ser null)
- Uso: Dividers, banners, texto libre, widgets personalizados

---

### 5️⃣ Barra de anuncio con html Personalizado

**Slug:** `barra-de-anuncio` | **Típicamente:** Arriba del navbar

```json
{
  "slug": "barra-de-anuncio",
  "title": null,
  "excerpt": null,
  "body": "<div class=\"promo\">Envíos gratis desde $999</div>",
  "categories": [
    { "name": "Home", "slug": "home-block" },
    { "name": "HTML", "slug": "home-html" }
  ]
}
```

### 6 Banner para promociones

**Para activarlo en el CMS, crea un post hijo de ecommerce-home con:**

**Categoría:** home-promo-banner
**Título:** el texto a mostrar
**Link:** URL de destino
**Body (JSON opcional):** {"subtitle": "texto pequeño arriba", "buttonText": "Ver oferta"}
**Ordering:** el número que define su posición en la home


``` json
{
  "slug": "promocion-primavera-verano",
  "title": "Promocion primavera verano",
  "excerpt": null,
  "body": "{"subtitle": "texto pequeño arriba", "buttonText": "Ver oferta"}",
  "categories": [
    { "name": "Home", "slug": "home-block" },
    { "name": "HTML", "slug": "home-promo-banner" }
  ]
}
```
---

### 7️⃣ Sección TikTok (Contenedor)

**Slug de categoría:** `tik-tok-section` | **Típicamente:** Ordering final

Este es un bloque **contenedor**, igual que `home-banner-slider`: agrupa múltiples videos de TikTok (items hijos) que se muestran como carrusel o grid según el ancho de pantalla y la cantidad de videos.

```json
{
  "slug": "ecommerce-home-tiktok",
  "title": "Síguenos en TikTok",
  "excerpt": "@meridamayoreo",
  "body": null,
  "categories": [
    { "name": "Home", "slug": "home-block" },
    { "name": "TikTok", "slug": "tik-tok-section" }
  ],
  "ordering": 7,
  "parent": {
    "slug": "ecommerce-home",
    "title": "Inicio"
  }
}
```

**Campos importantes:**
- `title` / `excerpt`: Encabezado opcional de la sección (título grande + texto pequeño arriba)
- `body`: No se usa en el contenedor (puede ir `null`)
- `slug` del post contenedor: puede ser cualquiera — los items se enlazan por `parent`, no hace falta que el slug sea literalmente `tik-tok-section` (eso es solo la categoría que identifica el tipo de bloque)

**Comportamiento responsive:**
- Menos de 780px de ancho: **siempre carrusel**, sin importar cuántos videos haya
- 780px o más: **grid** si hay 3 videos o menos, **carrusel** si hay más de 3

---

### 7.1 Items de la sección - Video de TikTok

**Slug:** Personalizado | **Parent:** slug del post contenedor (ej. `ecommerce-home-tiktok`) | **Ordering:** 1, 2, 3...

El `body` de cada item es **HTML personalizado, no hardcodeado**: se pega tal cual el snippet que entrega TikTok al usar su opción "Embed" en un video (Compartir → Insertar).

```json
{
  "slug": "ecommerce-home-tiktok-video-1",
  "title": null,
  "excerpt": null,
  "body": "<blockquote class=\"tiktok-embed\" cite=\"https://www.tiktok.com/@meridamayoreo/video/7660555753924644104\" data-video-id=\"7660555753924644104\"><section></section></blockquote>",
  "categories": [
    { "name": "Home", "slug": "home-block" }
  ],
  "ordering": 1,
  "parent": {
    "slug": "ecommerce-home-tiktok",
    "title": "Síguenos en TikTok"
  }
}
```

**Campos importantes:**
- `body`: HTML crudo del embed de TikTok (o cualquier otro embed/HTML personalizado) — se renderiza tal cual, sin sanitizar
- `title`, `excerpt`: No se usan para los items, pueden ir `null`
- No es necesario pegar el `<script>` de TikTok en cada item: el sitio ya carga `tiktok.com/embed.js` una sola vez por sección

---


## 📐 Orden Recomendado

```
ordering: 1 → Banner (Hero) - único
ordering: 2 → Banner Slider (contenedor con items)
            ├─ Item 1: Banner completo o imagen simple
            ├─ Item 2: Banner completo o imagen simple
            └─ Item N: ...
ordering: 3 → Categorías destacadas
ordering: 4 → Productos - Categoría 1
ordering: 5 → HTML - Promo
ordering: 6 → Productos - Categoría 2
ordering: 7+ → Más bloques según necesites
```

---

## ✅ Checklist de Validación

**Bloque contenedor `home-banner-slider`:**
- [ ] Tiene `parent: { slug: "ecommerce-home", title: "Inicio" }`
- [ ] El `body` solo contiene configuración (`autoplay`, `duration`)
- [ ] Las `categories` contienen `home-block` + `home-banner-slider`

**Items del slider (children):**
- [ ] Cada item tiene `parent: { slug: "ecommerce-home-banner-slider-main", ... }`
- [ ] Los items están ordenados por `ordering` secuencial
- [ ] Items tipo `home-banner`: incluyen `title`, `featured_image`, `link` y category `home-banner`
- [ ] Items tipo `home-banner-slider-item-image`: solo `featured_image` + opcionalmente `link`, category `home-banner-slider-item-image`
- [ ] Todas las imágenes existen y tienen peso adecuado (1920x600px)

---

## 📝 Notas

- Los bloques se renderizan por `ordering` de menor a mayor
- Los items dentro de un slider se renderizan por `ordering` dentro de su contenedor
- Puedes agregar múltiples bloques del mismo tipo
- Las imágenes van en CDN externo
- El HTML personalizado no se sanitiza (cuidado con inyecciones)
- **Arquitectura parent-child**: El slider puede contener items de diferentes tipos (banners completos e imágenes simples)
