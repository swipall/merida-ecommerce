import { getActiveOrder } from '@/lib/swipall/rest-adapter';
import { SwipallAPIError } from '@/lib/swipall/api';
import { cacheLife, cacheTag } from 'next/cache';

async function getCartItemCount(): Promise<number> {
    'use cache: private';
    cacheLife('minutes');
    cacheTag('cart');
    cacheTag('active-order');

    const order = await getActiveOrder({ useAuthToken: true });
    return order?.lines.filter((line) => !line.item.name.toUpperCase().includes('ENVIO')).length ?? 0;
}

interface NavbarCartResult {
    cartItemCount: number;
    staleCartId: boolean;
}

/**
 * Resuelto una sola vez por Navbar y reutilizado en los slots mobile/desktop
 * para que un cart-id inválido dispare un único NavbarCartCleaner en vez de
 * dos instancias concurrentes (una por slot), que competían entre sí.
 */
export async function getNavbarCartResult(): Promise<NavbarCartResult> {
    try {
        const cartItemCount = await getCartItemCount();
        return { cartItemCount, staleCartId: false };
    } catch (error) {
        if (error instanceof SwipallAPIError && error.status === 404) {
            return { cartItemCount: 0, staleCartId: true };
        }
        return { cartItemCount: 0, staleCartId: false };
    }
}
