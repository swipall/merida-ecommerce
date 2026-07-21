'use server';

import { clearCartId, setCartId } from '@/lib/cart';
import { getCartItems, getCurrentCart, getOrderDetail } from '@/lib/swipall/rest-adapter';
import { OrderDetailInterface } from '@/lib/swipall/users/user.types';
import { updateTag } from 'next/cache';

export async function saveCartIdAction(cartId: string) {
    try {
        await setCartId(cartId);
    } catch (error) {
        console.error('Error saving cart ID:', error);
        throw error;
    }
}

export async function clearCartIdAction() {
    try {
        await clearCartId();
        updateTag('cart');
        updateTag('active-order');
    } catch (error) {
        throw error;
    }
}

export async function fetchOrder(id: string): Promise<OrderDetailInterface | null> {
    try {
        const result = await getOrderDetail(id, { useAuthToken: true });
        return result;
    } catch (error) {        
        return fetchCart(id);
    }
}

export async function fetchCart(id: string): Promise<OrderDetailInterface | null> {
    try {
        const cartResult: any = await getCurrentCart({ useAuthToken: true, cartId: id });
        if (!cartResult) {
            throw new Error('Failed to fetch cart');
        }
        const cartItems = await getCartItems({ useAuthToken: true, cartId: id });
        cartResult.items = {
            results: cartItems,
            pagination: {
                total: cartItems.length,
                count: cartItems.length,
                per_page: cartItems.length,
                current_page: 1,
                total_pages: 1,
            },
        };
        // Convert cart to OrderDetailInterface format
        return cartResult as unknown as OrderDetailInterface;
    } catch (error) {
        throw error;
    }
}

export async function fetchOrderDetail(id: string, mpStatus: 'success' | 'failure' | 'pending'): Promise<OrderDetailInterface | null> {
    try {
        if(mpStatus === 'success') {
            const orderResult = await fetchOrder(id);
            return orderResult;
        } else {
            return fetchCart(id);
        }
    } catch (error) {
        throw error;
    }    

}