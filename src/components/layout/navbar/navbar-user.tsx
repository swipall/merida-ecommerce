'use client';

import { User } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from "next/link";
import { LoginButton } from "@/components/layout/navbar/login-button";
import { useAuthUser } from '@/hooks/use-auth-user';
import { NavbarUserSkeleton } from '@/components/shared/skeletons/navbar-user-skeleton';

export function NavbarUser() {
    const { user, isLoading } = useAuthUser();

    if (isLoading) {
        return <NavbarUserSkeleton />;
    }

    if (!user) {
        return (
            <Link
                href="/account/login"
                className="p-2 text-black hover:text-[#FF637E] transition-colors hidden sm:flex"
                aria-label="Iniciar sesión"
            >
                <User size={20} />
            </Link>
        );
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    className="p-2 text-black hover:text-[#FF637E] transition-colors hidden sm:flex"
                    aria-label={`Perfil de ${user.first_name || 'Usuario'}`}
                >
                    <User size={20} />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="font-inter">
                <DropdownMenuItem asChild>
                    <Link href="/account/profile">Perfil</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href="/account/orders">Pedidos</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <LoginButton isLoggedIn={true} />
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
