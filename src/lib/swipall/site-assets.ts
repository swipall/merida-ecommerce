import { getSiteConfig } from '@/lib/swipall/rest-adapter';
import { unstable_cache } from 'next/cache';
import { SITE_NAME } from '@/lib/metadata';
import type { SiteConfig } from '@/lib/swipall/types/types';

const getCachedSiteConfig = unstable_cache(
    async (): Promise<SiteConfig | null> => getSiteConfig(),
    ['site-config'],
    { revalidate: 86400 } // 24 horas
);

export async function getSiteLogoUrl(): Promise<string | null> {
    const config = await getCachedSiteConfig();
    return config?.logo ?? null;
}

export async function getSiteFaviconUrl(): Promise<string | null> {
    const config = await getCachedSiteConfig();
    if (!config?.favicon) return null;
    if (typeof config.favicon === 'object') return config.favicon.favicon ?? null;
    return config.favicon;
}

export async function getSiteName(): Promise<string> {
    const config = await getCachedSiteConfig();
    return config?.title || SITE_NAME;
}

export async function getSiteDescription(): Promise<string | null> {
    const config = await getCachedSiteConfig();
    return config?.excerpt ?? null;
}
