import { ProductImageCarousel } from '@/components/commerce/product-image-carousel';
import { ExtraMaterialsInterface, ProductInfo } from '@/components/commerce/product-info';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import Link from 'next/link';
import {
    buildCanonicalUrl,
    buildOgImages,
    SITE_NAME,
    truncateDescription,
} from '@/lib/metadata';
import { getProduct } from '@/lib/swipall/rest-adapter';
import { InterfaceInventoryItem, Material, ProductKind } from '@/lib/swipall/types/types';
import type { Metadata } from 'next';
import { cacheLife, cacheTag } from 'next/cache';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { getCompoundMaterials } from './actions';
import { getAuthToken, getAuthUserCustomerId } from '@/lib/auth';
import ProductLoading from './loading';

async function getProductData(id: string, customerId?: string) {
    'use cache';
    cacheLife('hours');
    cacheTag(`product-${id}`);

    try {
        const result = await getProduct(id, customerId);
        return result;
    } catch (error) {
        return null;
    }
}


const onGroupMaterialsByTaxonomy = (materials: Material[]): ExtraMaterialsInterface => {
    const grouped: { [id: string]: { id: string; value: string; materials: Material[] } } = {};

    (materials || []).forEach((item: any) => {
        const tax = item.material.taxonomy?.[0];
        const id = tax?.id || 'adicionales';
        const value = tax?.value || 'Adicionales';

        if (!grouped[id]) {
            grouped[id] = { id, value, materials: [] };
        }
        grouped[id].materials.push(item.material);
    });

    const compoundMaterials = Object.values(grouped)
        .sort((a, b) => a.value.localeCompare(b.value, 'es', { sensitivity: 'base' }))
        .map(({ value, materials }) => ({
            taxonomy: value,
            materials
        }));
    return compoundMaterials;
}

async function fetchProductMaterials(product: InterfaceInventoryItem | null) {
    if (!product) {
        return null;
    }
    const token = await getAuthToken();
    if (product.kind === ProductKind.Compound && token) {
        const compoundMaterials = await getCompoundMaterials(product.id, {});
        product.extra_materials = onGroupMaterialsByTaxonomy(compoundMaterials.results);
    }
    return product;
}

export async function generateMetadata({
    params,
}: PageProps<'/product/[id]'>): Promise<Metadata> {
    const { id: encodedId } = await params;
    const id = decodeURIComponent(encodedId);
    const result = await getProductData(id);

    const product = result;
    if (!product) {
        return {
            title: 'Producto no encontrado',
        };
    }

    const description = truncateDescription((product as any).description || product.name);
    const ogImage = product.featured_image;

    return {
        title: product.name,
        description: description || `Compra ${product.name} en ${SITE_NAME}`,
        alternates: {
            canonical: buildCanonicalUrl(`/product/${product.id}`),
        },
        openGraph: {
            title: product.name,
            description: description || `Compra ${product.name} en ${SITE_NAME}`,
            type: 'website',
            url: buildCanonicalUrl(`/product/${product.id}`),
            images: buildOgImages(ogImage, product.name),
        },
        twitter: {
            card: 'summary_large_image',
            title: product.name,
            description: description || `Compra ${product.name} en ${SITE_NAME}`,
            images: ogImage ? [ogImage] : undefined,
        },
    };
}

export default async function ProductDetailPage({ params, searchParams }: PageProps<'/product/[id]'>) {
    return (
        <Suspense fallback={<ProductLoading />}>
            <ProductDetailContent params={params} searchParams={searchParams} />
        </Suspense>
    );
}

async function ProductDetailContent({ params, searchParams }: PageProps<'/product/[id]'>) {
    const { id: encodedId } = await params;
    const searchParamsResolved = await searchParams;
    const id = decodeURIComponent(encodedId);
    const customerId = await getAuthUserCustomerId();
    const result = await getProductData(id, customerId);
    const product = await fetchProductMaterials(result);
    if (!product) {
        notFound();
    }
    // const primaryCollection = product.taxonomy?.[0]; //TODO: Supoort related products
    const category = product.taxonomy?.find(t => t.kind === 'family') ?? product.taxonomy?.[0];
    const categoryLabel = category?.value ?? category?.name;

    return (
        <>
            <div className="container mx-auto px-4 py-2 sm:mt-16 bg-card">
                <Breadcrumb className="mb-2 text-muted-foreground">
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild>
                                <Link className='text-muted-foreground' href="/">Inicio</Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        {category && categoryLabel && (
                            <>
                                <BreadcrumbSeparator className='text-muted-foreground' />
                                <BreadcrumbItem>
                                    <BreadcrumbLink asChild>
                                        <Link className='text-muted-foreground' href={`/collection/${category.slug}`}>{categoryLabel}</Link>
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                            </>
                        )}
                        <BreadcrumbSeparator className='text-muted-foreground' />
                        <BreadcrumbItem>
                            <BreadcrumbPage className="line-clamp-1 text-muted-foreground">{product.name}</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-12">
                    {/* Left Column: Image Carousel */}
                    <div className="lg:sticky lg:top-20 lg:self-start">
                        <ProductImageCarousel images={[
                            ...(product.featured_image ? [product.featured_image] : []),
                            ...(product.pictures?.map(p => p.url).filter(url => url !== product.featured_image) ?? []),
                        ]} />
                    </div>

                    {/* Right Column: Product Info */}
                    <div>
                        <h1 className="text-2xl font-bold mb-4">{product.name}</h1>
                        {/* {product.description && (
                            <p className="text-foreground mb-6">{product.description}</p>
                        )} */}
                        <ProductInfo product={product} searchParams={searchParamsResolved} />
                    </div>
                </div>
            </div>

            {/* Store FAQ Section */}
            <section className="py-16 bg-muted/30 hidden">
                <div className="container mx-auto px-4 max-w-3xl">
                    <h2 className="text-2xl font-bold text-center mb-8">Preguntas Frecuentes</h2>
                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="shipping">
                            <AccordionTrigger>¿Cuáles son sus opciones de envío?</AccordionTrigger>
                            <AccordionContent>
                                Ofrecemos envío estándar (5-7 días hábiles), envío exprés (2-3 días hábiles) y entrega al día siguiente para áreas selectas. El envío estándar es gratuito en pedidos superiores a $50.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="returns">
                            <AccordionTrigger>¿Cuál es su política de devoluciones?</AccordionTrigger>
                            <AccordionContent>
                                Aceptamos devoluciones dentro de los 30 días posteriores a la compra. Los artículos deben estar sin usar y en su embalaje original. Simplemente contacte a nuestro equipo de soporte para iniciar una devolución y recibir una etiqueta de envío prepagada.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="tracking">
                            <AccordionTrigger>¿Cómo puedo rastrear mi pedido?</AccordionTrigger>
                            <AccordionContent>
                                Una vez que su pedido sea enviado, recibirá un correo electrónico con un número de seguimiento. También puede ver el estado de su pedido en cualquier momento iniciando sesión en su cuenta y visitando la sección de historial de pedidos.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="international">
                            <AccordionTrigger>¿Ofrecen envíos internacionales?</AccordionTrigger>
                            <AccordionContent>
                                ¡Sí! Enviamos a más de 50 países en todo el mundo. Las tarifas y los tiempos de entrega internacionales varían según la ubicación. Puede ver el costo exacto en la caja antes de completar su compra.
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </div>
            </section>

            {/* {primaryCollection && (
                <RelatedProducts
                    collectionSlug={primaryCollection.slug}
                    currentProductId={product.id}
                />
            )} */}
        </>
    );
}
