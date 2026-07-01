import type {Metadata, Viewport} from "next";
import {Geist, Geist_Mono, Jost, Inter} from "next/font/google";
import "./globals.css";
import {Toaster} from "@/components/ui/sonner";
import {Navbar} from "@/components/layout/navbar";
import {Footer} from "@/components/layout/footer";
import {MobileBottomNav} from "@/components/layout/mobile-bottom-nav";
import {ThemeProvider} from "@/components/providers/theme-provider";
import {PriceListProvider} from "@/components/providers/price-list-provider";
import {SITE_URL} from "@/lib/metadata";
import {getSiteFaviconUrl, getSiteName, getSiteDescription} from "@/lib/swipall/site-assets";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

const jost = Jost({
    variable: "--font-jost",
    subsets: ["latin"],
    weight: ["400", "600", "700", "800"],
    display: "swap",
});

const inter = Inter({
    variable: "--font-inter",
    subsets: ["latin"],
    weight: ["300", "400", "500"],
    display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
    const [faviconUrl, siteName, siteDescription] = await Promise.all([
        getSiteFaviconUrl(),
        getSiteName(),
        getSiteDescription(),
    ]);

    return {
        metadataBase: new URL(SITE_URL),
        title: {
            default: siteName,
            template: `%s | ${siteName}`,
        },
        description: siteDescription ?? undefined,
        icons: faviconUrl
            ? { icon: faviconUrl, shortcut: faviconUrl, apple: faviconUrl }
            : undefined,
        openGraph: {
            type: "website",
            siteName: siteName,
            locale: "en_US",
        },
        twitter: {
            card: "summary_large_image",
        },
        robots: {
            index: true,
            follow: true,
            googleBot: {
                index: true,
                follow: true,
                "max-video-preview": -1,
                "max-image-preview": "large", 
                "max-snippet": -1,
            },
        },
    };
}

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    themeColor: [
        {media: "(prefers-color-scheme: light)", color: "#ffffff"},
        {media: "(prefers-color-scheme: dark)", color: "#000000"},
    ],
};

export default function RootLayout({children}: LayoutProps<'/'>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body
                className={`${geistSans.variable} ${geistMono.variable} ${jost.variable} ${inter.variable} antialiased flex flex-col min-h-screen pb-16 md:pb-0`}
            >
                <ThemeProvider>
                    <PriceListProvider>
                        <Navbar />
                        {children}
                        <Footer />
                        <MobileBottomNav />
                        <Toaster />
                    </PriceListProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
