'use client';

import { useEffect, useRef } from 'react';
import { clearCartIdAction } from '@/app/shop/mp/order/actions';

/**
 * clearCartIdAction ya invalida los tags 'cart' y 'active-order' via updateTag,
 * lo que revalida el RSC tree por sí solo. No llamar a router.refresh() aquí:
 * al ser un Server Component que se remonta en cada refresh, un refresh extra
 * desde el cliente puede competir con el propio revalidate del server action
 * y producir un loop de refreshes en home tras un cart-id inválido (ej. logout).
 */
export function NavbarCartCleaner() {
    const ranRef = useRef(false);

    useEffect(() => {
        if (ranRef.current) return;
        ranRef.current = true;

        clearCartIdAction().catch((error) => {
            console.error('Failed to clear stale cart ID:', error);
        });
    }, []);

    return null;
}
