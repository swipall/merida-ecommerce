import { getPosts } from "@/lib/swipall/rest-adapter";
import { HomeSectionRenderer } from "./home-section-renderer";
import { getHomeBlockType } from "./home-section-types";
import type { CmsPost } from "@/lib/swipall/types/types";
import { Suspense } from "react";

const HOME_PARENT_SLUG = "ecommerce-home";

// Caching disabled until the CMS revalidation webhook lands (see
// docs/features/cms-revalidation-webhook.md) — CMS edits must show up immediately.
async function getHomeBlocks(): Promise<CmsPost[]> {
    const postsResponse = await getPosts({ parent__slug: HOME_PARENT_SLUG });
    return (postsResponse.results ?? [])
        .filter((post) => getHomeBlockType(post))
        .sort((a, b) => (a.ordering ?? 0) - (b.ordering ?? 0));
}

export async function HomePageComponent() {
    const blocks = await getHomeBlocks();

    if (blocks.length === 0) {
        return null;
    }

    return (
        <div className="min-h-screen">
            {blocks.map((post) => (
                <Suspense key={post.slug} fallback={null}>
                    <HomeSectionRenderer post={post} />
                </Suspense>
            ))}
        </div>
    );
}