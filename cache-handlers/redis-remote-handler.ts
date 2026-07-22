/**
 * cacheHandlers.remote implementation backed by Redis (Upstash), shared across
 * all Cloud Run instances. Without this, Next's default cache is in-memory per
 * process, so it never hits between instances/deploys — see REDIS_URL in .env.
 *
 * Referenced by path from next.config.ts (cacheHandlers.remote), so this file
 * must default-export the handler and stay resolvable outside the src/ alias.
 */
import { createClient, type RedisClientType } from 'redis';

interface CacheEntry {
    value: ReadableStream<Uint8Array>;
    tags: string[];
    stale: number;
    timestamp: number;
    expire: number;
    revalidate: number;
}

const REDIS_URL = process.env.REDIS_URL;
const KEY_PREFIX = 'nextcache:entry:';
const TAG_PREFIX = 'nextcache:tag:';

let client: RedisClientType | null = null;
let connecting: Promise<RedisClientType> | null = null;

async function getClient(): Promise<RedisClientType | null> {
    if (!REDIS_URL) return null;
    if (client?.isReady) return client;
    if (!connecting) {
        connecting = (async () => {
            const c = createClient({ url: REDIS_URL }) as RedisClientType;
            c.on('error', (err) => console.error('[redis-remote-handler] connection error', err));
            await c.connect();
            client = c;
            return c;
        })();
    }
    return connecting;
}

async function streamToBase64(stream: ReadableStream<Uint8Array>): Promise<string> {
    const reader = stream.getReader();
    const chunks: Uint8Array[] = [];
    try {
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            chunks.push(value);
        }
    } finally {
        reader.releaseLock();
    }
    return Buffer.concat(chunks).toString('base64');
}

function base64ToStream(base64: string): ReadableStream<Uint8Array> {
    const buffer = Buffer.from(base64, 'base64');
    return new ReadableStream({
        start(controller) {
            controller.enqueue(new Uint8Array(buffer));
            controller.close();
        },
    });
}

// Local mirror of tag invalidation timestamps synced from Redis via refreshTags().
const localTagTimestamps = new Map<string, number>();

const handler = {
    async get(cacheKey: string, softTags: string[]): Promise<CacheEntry | undefined> {
        try {
            const redis = await getClient();
            if (!redis) return undefined;

            const raw = await redis.get(KEY_PREFIX + cacheKey);
            if (!raw) return undefined;

            const parsed = JSON.parse(raw) as Omit<CacheEntry, 'value'> & { value: string };

            const allTags = [...parsed.tags, ...softTags];
            const mostRecentInvalidation = await handler.getExpiration(allTags);
            if (mostRecentInvalidation > parsed.timestamp) {
                return undefined;
            }

            return {
                ...parsed,
                value: base64ToStream(parsed.value),
            };
        } catch (err) {
            console.error('[redis-remote-handler] get failed', err);
            return undefined;
        }
    },

    async set(cacheKey: string, pendingEntry: Promise<CacheEntry>): Promise<void> {
        try {
            const entry = await pendingEntry;
            const redis = await getClient();
            if (!redis) return;

            const serialized = JSON.stringify({
                ...entry,
                value: await streamToBase64(entry.value),
            });

            if (entry.expire > 0 && Number.isFinite(entry.expire)) {
                await redis.set(KEY_PREFIX + cacheKey, serialized, { EX: entry.expire });
            } else {
                await redis.set(KEY_PREFIX + cacheKey, serialized);
            }
        } catch (err) {
            console.error('[redis-remote-handler] set failed', err);
        }
    },

    async getExpiration(tags: string[]): Promise<number> {
        if (tags.length === 0) return 0;
        await handler.refreshTags();
        let max = 0;
        for (const tag of tags) {
            const ts = localTagTimestamps.get(tag);
            if (ts && ts > max) max = ts;
        }
        return max;
    },

    async updateTags(tags: string[], durations?: { expire?: number }): Promise<void> {
        try {
            const redis = await getClient();
            if (!redis) return;

            const now = Date.now();
            await Promise.all(
                tags.map(async (tag) => {
                    localTagTimestamps.set(tag, now);
                    const key = TAG_PREFIX + tag;
                    if (durations?.expire && Number.isFinite(durations.expire)) {
                        await redis.set(key, String(now), { EX: durations.expire });
                    } else {
                        await redis.set(key, String(now));
                    }
                })
            );
        } catch (err) {
            console.error('[redis-remote-handler] updateTags failed', err);
        }
    },

    async refreshTags(): Promise<void> {
        try {
            const redis = await getClient();
            if (!redis) return;

            const keys = await redis.keys(TAG_PREFIX + '*');
            if (keys.length === 0) return;

            const values = await redis.mGet(keys);
            keys.forEach((key, i) => {
                const value = values[i];
                if (value) {
                    localTagTimestamps.set(key.slice(TAG_PREFIX.length), Number(value));
                }
            });
        } catch (err) {
            console.error('[redis-remote-handler] refreshTags failed', err);
        }
    },
};

export default handler;
