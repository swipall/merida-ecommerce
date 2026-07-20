'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { clearCartIdAction } from '@/app/shop/mp/order/actions';

export function NavbarCartCleaner() {
    const router = useRouter();
    const ranRef = useRef(false);

    useEffect(() => {
        if (ranRef.current) return;
        ranRef.current = true;

        clearCartIdAction()
            .then(() => router.refresh())
            .catch((error) => {
                console.error('Failed to clear stale cart ID:', error);
            });
    }, [router]);

    return null;
}
