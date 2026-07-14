'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Search, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface NavbarMobileHeaderProps {
    logoUrl: string;
    siteName: string;
    cart: React.ReactNode;
}

export function NavbarMobileHeader({ logoUrl, siteName, cart }: NavbarMobileHeaderProps) {
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const router = useRouter();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchValue.trim()) return;
        router.push(`/search?q=${encodeURIComponent(searchValue.trim())}`);
        setSearchOpen(false);
        setSearchValue('');
    };

    return (
        <div className="md:hidden">
            <div className="flex items-center justify-between px-4 h-14">
                <Link href="/" className="flex-shrink-0">
                    <Image
                        src={logoUrl}
                        alt={siteName}
                        width={100}
                        height={27}
                        className="h-9 w-auto object-contain"
                        priority
                    />
                </Link>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setSearchOpen(!searchOpen)}
                        className="text-black hover:text-[#FF637E] transition-colors"
                        aria-label="Buscar"
                    >
                        {searchOpen ? <X size={20} /> : <Search size={20} />}
                    </button>
                    {cart}
                </div>
            </div>

            {searchOpen && (
                <div className="px-4 pb-3">
                    <form
                        onSubmit={handleSubmit}
                        className="flex items-center bg-[#F1F5F9] rounded-full px-4 py-2.5 gap-2"
                    >
                        <Search size={16} className="text-muted-foreground shrink-0" />
                        <input
                            autoFocus
                            type="search"
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            className="bg-transparent text-sm outline-none w-full placeholder:text-muted-foreground font-inter"
                            placeholder="Buscar productos..."
                        />
                    </form>
                </div>
            )}
        </div>
    );
}
