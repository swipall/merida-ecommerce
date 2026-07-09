'use client';

import { Home, Grid, ShoppingCart, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
    { id: 'inicio',     label: 'INICIO',      icon: Home,          href: '/' },
    { id: 'categorias', label: 'CATEGORÍAS',   icon: Grid,          href: '/categorias' },
    { id: 'carrito',    label: 'CARRITO',      icon: ShoppingCart,  href: '/cart' },
    { id: 'perfil',     label: 'MI PERFIL',    icon: User,          href: '/account/profile' },
];

export function MobileBottomNav() {
    const pathname = usePathname();

    return (
        <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-border z-50 lg:hidden safe-area-pb">
            <div className="flex">
                {TABS.map(({ id, label, icon: Icon, href }) => {
                    const isActive =
                        href === '/' ? pathname === '/' : pathname.startsWith(href);
                    return (
                        <Link
                            key={id}
                            href={href}
                            className={`flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 transition-colors ${
                                isActive ? 'text-[#FF637E]' : 'text-muted-foreground'
                            }`}
                        >
                            <Icon
                                size={20}
                                strokeWidth={isActive ? 2.5 : 1.8}
                            />
                            <span className="text-[9px] font-semibold font-jost tracking-[0.8px]">
                                {label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
