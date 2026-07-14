import type { CmsPost } from "@/lib/swipall/types/types";

interface HomeHtmlSectionProps {
    post: CmsPost;
}

export function HomeHtmlSection({ post }: HomeHtmlSectionProps) {
    if (!post.body) {
        return null;
    }

    return (
        <section>
            <div
                className="container mx-auto prose prose-neutral max-w-none"
                dangerouslySetInnerHTML={{ __html: post.body }}
            />
        </section>
    );
}
