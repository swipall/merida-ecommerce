'use client';

import Link from 'next/link';
import { useState, useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SubmenuItem {
    slug: string;
    title: string;
    link: string | null;
    excerpt: string | null;
}

interface NavbarDropdownItemProps {
    title: string;
    href: string;
    items: SubmenuItem[];
}

export function NavbarDropdownItem({ title, href, items }: NavbarDropdownItemProps) {
    const [open, setOpen] = useState(false);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleMouseEnter = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setOpen(true);
    };

    const handleMouseLeave = () => {
        timeoutRef.current = setTimeout(() => setOpen(false), 120);
    };

    return (
        <div
            className="relative"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <button
                className={cn(
                    'flex items-center gap-1 px-2 py-2 font-jost text-xs font-semibold uppercase tracking-[1.5px] transition-colors',
                    open ? 'text-[#FF637E]' : 'text-black/70 hover:text-[#FF637E]'
                )}
            >
                {title}
                <ChevronDown
                    size={11}
                    className={cn('transition-transform duration-200', open && 'rotate-180')}
                />
            </button>

            {open && (
                <div className="absolute top-full left-0 pt-1 z-50">
                    <ul className="bg-white border border-border rounded-xl shadow-xl py-2 min-w-44">
                        <li>
                            <Link
                                href={href}
                                prefetch={false}
                                className="flex px-4 py-2 font-inter text-[14px] text-black font-semibold hover:text-[#FF637E] hover:bg-[#F1F5F9] transition-colors"
                                onClick={() => setOpen(false)}
                            >
                                Ver todos
                            </Link>
                        </li>
                        <li className="my-1 h-px bg-border mx-2" />
                        {items.map((item) => (
                            <li key={item.slug}>
                                <Link
                                    href={item.link || `/collection/${item.slug}`}
                                    prefetch={false}
                                    className="flex px-4 py-2 font-inter text-[14px] text-muted-foreground hover:text-[#FF637E] hover:bg-[#F1F5F9] transition-colors"
                                    onClick={() => setOpen(false)}
                                >
                                    {item.title}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
