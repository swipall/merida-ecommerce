"use client";

import Script from "next/script";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import type { CmsPost } from "@/lib/swipall/types/types";

interface HomeTikTokSliderSectionProps {
    post: CmsPost;
    items: CmsPost[];
}

// Below this width the section is always a carousel, regardless of item count.
const MOBILE_ONLY = "min-[780px]:hidden";
const DESKTOP_ONLY = "hidden min-[780px]:block";

// Desktop/tablet only becomes a carousel once there are more items than fit in a row.
const DESKTOP_CAROUSEL_THRESHOLD = 3;

function TikTokEmbedItem({ item }: { item: CmsPost }) {
    if (!item.body?.trim()) return null;

    // item.body is arbitrary HTML entered by the admin in the CMS (e.g. a TikTok
    // "Embed" snippet) — rendered as-is, nothing here is hardcoded per video.
    // TikTok's own snippet sets an inline `min-width: 325px` on the blockquote,
    // which otherwise wins over our width classes and makes it overflow narrow
    // slides — override it (and the inline max-width) with !important.
    return (
        <div
            className="w-full max-w-[325px] mx-auto [&_blockquote]:w-full! [&_blockquote]:min-w-0! [&_blockquote]:max-w-full! [&_blockquote]:mx-auto"
            dangerouslySetInnerHTML={{ __html: item.body }}
        />
    );
}

export function HomeTikTokSliderSection({ post, items }: HomeTikTokSliderSectionProps) {
    const videos = items.filter((item) => item.body?.trim());
    if (videos.length === 0) return null;

    const useDesktopCarousel = videos.length > DESKTOP_CAROUSEL_THRESHOLD;

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

            {/* Mobile (<780px): always a carousel */}
            <div className={MOBILE_ONLY}>
                <Carousel opts={{ align: "center", loop: videos.length > 1 }} className="w-full">
                    <CarouselContent className="gap-4">
                        {videos.map((item) => (
                            <CarouselItem key={item.slug} className="basis-[72%] py-1">
                                <TikTokEmbedItem item={item} />
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    {videos.length > 1 && (
                        <div className="flex justify-center items-center gap-3 mt-4">
                            <CarouselPrevious className="static translate-y-0" />
                            <CarouselNext className="static translate-y-0" />
                        </div>
                    )}
                </Carousel>
            </div>

            {/* Desktop/tablet (>=780px): carousel when more than 3 items, static grid otherwise */}
            <div className={DESKTOP_ONLY}>
                {useDesktopCarousel ? (
                    <Carousel opts={{ align: "start", loop: true }} className="w-full">
                        <CarouselContent className="gap-2">
                            {videos.map((item) => (
                                <CarouselItem key={item.slug} className="basis-1/2 lg:basis-1/3">
                                    <TikTokEmbedItem item={item} />
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        <CarouselPrevious className="left-2" />
                        <CarouselNext className="right-2" />
                    </Carousel>
                ) : (
                    <div
                        className="grid gap-6 justify-items-center"
                        style={{ gridTemplateColumns: `repeat(${videos.length}, minmax(0, 1fr))` }}
                    >
                        {videos.map((item) => (
                            <TikTokEmbedItem key={item.slug} item={item} />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
