import type {Metadata} from "next";
import { HomePageComponent } from "@/components/layout/home/home-page-component";
import {SITE_URL, buildCanonicalUrl} from "@/lib/metadata";
import {getSiteDescription, getSiteName} from "@/lib/swipall/site-assets";

export async function generateMetadata(): Promise<Metadata> {
    const [siteName, siteDescription] = await Promise.all([
        getSiteName(),
        getSiteDescription(),
    ]);
    const description = siteDescription ?? undefined;
    return {
        title: {
            absolute: `${siteName} - Venta de ropa a mayoreo`,
        },
        description,
        alternates: {
            canonical: buildCanonicalUrl("/"),
        },
        openGraph: {
            title: `${siteName} - Venta de ropa a mayoreo`,
            description,
            type: "website",
            url: SITE_URL,
        },
    };
}

export default async function Home(_props: PageProps<'/'>) {
    return (
        <HomePageComponent />
    );
}
