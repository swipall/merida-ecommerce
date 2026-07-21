"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { CmsPost } from "@/lib/swipall/types/types";

interface HomeTikTokSliderSectionProps {
    post: CmsPost;
    items: CmsPost[];
}

function TikTokEmbedItem({ item }: { item: CmsPost }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        const container = containerRef.current;
        if (!item.body?.trim() || !container) return;

        // TikTok's embed.js swaps the blockquote for an <iframe> once the video is ready —
        // watch for that instead of guessing a fixed load time.
        const observer = new MutationObserver(() => {
            if (container.querySelector("iframe")) {
                setLoaded(true);
                observer.disconnect();
            }
        });
        observer.observe(container, { childList: true, subtree: true });

        // Don't hide the video behind the skeleton forever if embed.js is blocked or slow.
        const timeout = setTimeout(() => setLoaded(true), 8000);

        return () => {
            observer.disconnect();
            clearTimeout(timeout);
        };
    }, [item.body]);

    if (!item.body?.trim()) return null;

    // item.body is arbitrary HTML entered by the admin in the CMS (e.g. a TikTok
    // "Embed" snippet) — rendered as-is, nothing here is hardcoded per video.
    // TikTok's own snippet sets an inline `min-width: 325px` on the blockquote,
    // which otherwise wins over our width classes and makes it overflow narrow
    // slides — override it (and the inline max-width) with !important.
    return (
        <div className="w-full max-w-[325px] mx-auto">
            {!loaded && <Skeleton className="aspect-[9/16] w-full rounded-lg" />}
            <div
                ref={containerRef}
                className={cn(
                    "w-full [&_blockquote]:w-full! [&_blockquote]:min-w-0! [&_blockquote]:max-w-full! [&_blockquote]:mx-auto",
                    !loaded && "hidden"
                )}
                dangerouslySetInnerHTML={{ __html: item.body }}
            />
        </div>
    );
}

export function HomeTikTokSliderSection({ post, items }: HomeTikTokSliderSectionProps) {
    const videos = items.filter((item) => item.body?.trim());
    if (videos.length === 0) return null;

    return (
        <section className="container mx-auto px-4 py-8 md:py-12">
            {/* Renders any .tiktok-embed blockquotes present in the admin-entered HTML into iframes. */}
            <Script src="https://www.tiktok.com/embed.js" strategy="lazyOnload" />

            {(post.title || post.excerpt) && (
                <div className="text-left mb-8">
                    {post.excerpt && (
                        <h4 className="text-accent font-bold font-jost uppercase tracking-widest text-sm">
                            {post.excerpt}
                        </h4>
                    )}
                    {post.title && (
                        <h2 className="text-2xl md:text-3xl font-bold font-jost uppercase mt-1">
                            {post.title}
                        </h2>
                    )}
                </div>
            )}

            {/* Single carousel for all breakpoints: 2 videos per view on mobile, 3 on
                desktop/tablet (>=780px) — avoids mounting (and embedding) every video twice. */}
            <Carousel opts={{ align: "start" }} className="w-full">
                <CarouselContent className="gap-2 min-[780px]:gap-4">
                    {videos.map((item) => (
                        <CarouselItem key={item.slug} className="basis-1/2 min-[780px]:basis-1/3">
                            <TikTokEmbedItem item={item} />
                        </CarouselItem>
                    ))}
                </CarouselContent>
                {videos.length > 1 && (
                    <>
                        <CarouselPrevious className="left-2" />
                        <CarouselNext className="right-2" />
                    </>
                )}
            </Carousel>
        </section>
    );
}
