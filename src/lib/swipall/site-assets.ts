import { getPosts } from '@/lib/swipall/rest-adapter';
import { cacheLife } from 'next/cache';

async function getAssetUrl(slug: string): Promise<string | null> {
    'use cache';
    cacheLife('days');
    const result = await getPosts({ slug });
    return result?.results?.[0]?.featured_image ?? null;
}

export function getSiteLogoUrl(): Promise<string | null> {
    return getAssetUrl('logo-web');
}

export function getSiteFaviconUrl(): Promise<string | null> {
    return getAssetUrl('favicon-web');
}
