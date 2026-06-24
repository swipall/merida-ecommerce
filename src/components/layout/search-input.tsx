'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';

export function SearchInput() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();
    const [searchValue, setSearchValue] = useState(searchParams.get('q') || '');

    useEffect(() => {
        setSearchValue(searchParams.get('q') || '');
    }, [searchParams]);

    return (
        <form onSubmit={(e) => {
            e.preventDefault();
            if (!searchValue.trim()) return;
            startTransition(() => {
                router.push(`/search?q=${encodeURIComponent(searchValue.trim())}`);
            });
        }} className="flex items-center w-full bg-[#F1F5F9] rounded-full px-4 py-2 gap-2">
            <Search size={16} className="text-muted-foreground shrink-0" />
            <input
                type="search"
                placeholder="Buscar productos..."
                className="bg-transparent text-sm outline-none w-full placeholder:text-muted-foreground font-inter disabled:opacity-50"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                disabled={isPending}
            />
        </form>
    );
}
