import Image from "next/image";
import Link from "next/link";
import { NavbarCollections } from '@/components/layout/navbar/navbar-collections';
import { NavbarCart } from '@/components/layout/navbar/navbar-cart';
import { NavbarUser } from '@/components/layout/navbar/navbar-user';
import { NavbarMobileHeader } from '@/components/layout/navbar/navbar-mobile-header';
import { PromoBar } from '@/components/layout/navbar/promo-bar';
import { Suspense } from "react";
import { SearchInput } from '@/components/layout/search-input';
import { SearchInputSkeleton } from '@/components/shared/skeletons/search-input-skeleton';
import { getSiteLogoUrl, getSiteName } from '@/lib/swipall/site-assets';

const FALLBACK_LOGO =
    "https://mmcb.b-cdn.net/media/attachments/f/e/1/a/7db82f8034376f8cfe56fc1a9c4df7e439e587efbbf1b8a462560b93d778/logo-q.png";

export async function Navbar() {
    const [logoUrl, siteName] = await Promise.all([
        getSiteLogoUrl(),
        getSiteName(),
    ]);
    const logo = logoUrl ?? FALLBACK_LOGO;

    const cartSlot = (
        <Suspense fallback={<div className="w-8 h-8" />}>
            <NavbarCart />
        </Suspense>
    );

    return (
        <header className="sticky top-0 z-50 bg-white border-b border-border shadow-sm">
            {/* Promo bar — contenido dinámico desde slug: barra-de-anuncio */}
            <Suspense>
                <PromoBar/>
            </Suspense>

            {/* Mobile header (< md) */}
            <NavbarMobileHeader logoUrl={logo} siteName={siteName} cart={cartSlot} />

            {/* Desktop header (≥ md) */}
            <div className="hidden md:block container mx-auto px-4 lg:px-8">
                <div className="flex items-center gap-4 h-16">
                    {/* Logo */}
                    <Link href="/" className="flex-shrink-0">
                        <Image
                            src={logo}
                            alt={siteName}
                            width={120}
                            height={32}
                            className="h-10 w-auto object-contain"
                            priority
                        />
                    </Link>

                    {/* Nav con dropdowns — lg+ */}
                    <nav className="hidden lg:flex items-center flex-1 justify-center">
                        <Suspense>
                            <NavbarCollections />
                        </Suspense>
                    </nav>

                    {/* Search pill */}
                    <div className="flex flex-1 lg:flex-none lg:w-64">
                        <Suspense fallback={<SearchInputSkeleton />}>
                            <SearchInput />
                        </Suspense>
                    </div>

                    {/* User + Cart */}
                    <div className="flex items-center gap-1 shrink-0">
                        <NavbarUser />
                        {cartSlot}
                    </div>
                </div>
            </div>
        </header>
    );
}
