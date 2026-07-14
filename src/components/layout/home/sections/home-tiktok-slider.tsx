import { getPosts } from "@/lib/swipall/rest-adapter";
import { CmsPost } from "@/lib/swipall/types/types";
import { cacheLife } from "next/cache";
import { HomeTikTokSliderSection } from "./home-tiktok-slider-section";

export async function HomeTikTokSliderSectionWrapper({ post, items }: { post: CmsPost; items?: CmsPost[] }) {
    "use cache";
    cacheLife("hours");

    if (items && items.length > 0) {
        return <HomeTikTokSliderSection post={post} items={items} />;
    }
    try {
        const childrenResponse = await getPosts({ parent__slug: post.slug, ordering: "ordering" });
        const sortedItems = (childrenResponse.results ?? [])
            .sort((a, b) => (a.ordering ?? 0) - (b.ordering ?? 0));
        return <HomeTikTokSliderSection post={post} items={sortedItems} />;
    } catch (error) {
        return null;
    }
}
