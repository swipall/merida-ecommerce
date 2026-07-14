'use client';

import { ShoppingCart } from 'lucide-react';
import Link from 'next/link';

interface CartIconProps {
    cartItemCount: number;
}

export function CartIcon({ cartItemCount }: CartIconProps) {
    return (
        <Link
            href="/cart"
            className="relative p-2 text-black hover:text-[#FF637E] transition-colors"
            aria-label="Carrito de compras"
        >
            <ShoppingCart size={20} />
            {cartItemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-[#FF637E] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {cartItemCount}
                </span>
            )}
        </Link>
    );
}
