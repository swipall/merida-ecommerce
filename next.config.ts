import {NextConfig} from 'next';
import path from 'path';

const nextConfig: NextConfig = {
    output: 'standalone',

    cacheComponents: true,

    // Shared Redis-backed cache for 'use cache: remote' so cache entries survive
    // across Cloud Run instances/deploys. Falls back to Next's in-memory default
    // handler for plain 'use cache' when REDIS_URL isn't set (e.g. local dev).
    cacheHandlers: {
        remote: require.resolve('./cache-handlers/redis-remote-handler.ts'),
    },

    turbopack: {
        root: path.join(__dirname),
    },

    images: {
        // This is necessary to display images from your Swipall instance
        dangerouslyAllowLocalIP: true,
        remotePatterns: [
            {
                hostname: 'localhost'
            },
            {
                hostname: 'mmcbv4.b-cdn.net'
            },
            {
                hostname: 'mmcb.b-cdn.net'
            },
            {
                hostname: 'swip-catalogs-443115567646.us-central1.run.app'
            }
        ],
    },
    experimental: {
        rootParams: true
    }
};

export default nextConfig;