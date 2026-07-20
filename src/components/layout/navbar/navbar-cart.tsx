import { getActiveOrder } from '@/lib/swipall/rest-adapter';
import { SwipallAPIError } from '@/lib/swipall/api';
import { cacheLife, cacheTag } from 'next/cache';
import { CartIcon } from './cart-icon';
import { NavbarCartCleaner } from './navbar-cart-cleaner';

async function getCartItemCount(): Promise<number> {
    'use cache: private';
    cacheLife('minutes');
    cacheTag('cart');
    cacheTag('active-order');

    const order = await getActiveOrder({ useAuthToken: true });
    return order?.lines.filter((line) => !line.item.name.toUpperCase().includes('ENVIO')).length ?? 0;
}

export async function NavbarCart() {
    try {
        const cartItemCount = await getCartItemCount();
        return <CartIcon cartItemCount={cartItemCount} />;
    } catch (error) {
        if (error instanceof SwipallAPIError && error.status === 404) {
            return (
                <>
                    <NavbarCartCleaner />
                    <CartIcon cartItemCount={0} />
                </>
            );
        }
        return <CartIcon cartItemCount={0} />;
    }
}
