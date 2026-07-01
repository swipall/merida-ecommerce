'use client';

import { useSelectedLayoutSegment } from 'next/navigation';
import { ComponentProps } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export function NavbarLink({ href, children, ...rest }: ComponentProps<typeof Link>) {
    const selectedLayoutSegment = useSelectedLayoutSegment();
    const pathname = selectedLayoutSegment ? `/${selectedLayoutSegment}` : '/';
    const isActive = pathname === href;

    return (
        <Link
            aria-current={isActive ? 'page' : undefined}
            href={href}
            prefetch={false}
            className={cn(
                'relative px-3 py-2 font-jost text-sm font-semibold uppercase tracking-[1.5px] transition-colors',
                isActive ? 'text-black' : 'text-black/70 hover:text-[#FF637E]'
            )}
            {...rest}
        >
            {children}
            {isActive && (
                <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-[#FF637E] rounded-full" />
            )}
        </Link>
    );
}
