import Image from 'next/image';
import Link from 'next/link';
import { Price } from '@/components/commerce/price';
import { ProductKind, type InterfaceInventoryItem, type ProductAttribute } from '@/lib/swipall/types/types';

const MAX_SWATCHES = 4;

function getUniqueColors(attrs: ProductAttribute[]) {
    const seen = new Set<string>();
    return attrs.filter(a => a.kind === 'color' && a.color && a.is_visible_on_web && !seen.has(a.color) && seen.add(a.color));
}

function getUniqueSizeCount(attrs: ProductAttribute[]) {
    return new Set(attrs.filter(a => a.kind === 'size' && a.is_visible_on_web).map(a => a.name)).size;
}

function getBadge(product: InterfaceInventoryItem, hasDiscount: boolean): string | null {
    const slugs = product.taxonomy?.map(t => t.slug) ?? [];
    if (slugs.some(s => s.includes('nuevo') || s.includes('new'))) return 'NUEVO';
    if (hasDiscount) return 'OFERTA';
    if (slugs.some(s => s.includes('top') || s.includes('popular'))) return 'TOP';
    return null;
}

interface ProductCardProps {
    product: InterfaceInventoryItem;
}

export function ProductCard({ product }: ProductCardProps) {
    const priceVal    = product.price     ? parseFloat(product.price)     : undefined;
    const webPriceVal = product.web_price ? parseFloat(product.web_price) : undefined;
    const finalPrice  = priceVal ?? webPriceVal;
    const originalPrice = priceVal && webPriceVal && webPriceVal > priceVal ? webPriceVal : undefined;
    const hasDiscount = !!originalPrice;
    const discountPct = hasDiscount ? Math.round((1 - priceVal! / originalPrice!) * 100) : 0;

    const imageUrl = product.featured_image || product.pictures?.[0]?.url;
    const isGroup  = product.kind === ProductKind.Group;
    const attrs    = product.attribute_combinations ?? [];

    const colors    = isGroup ? getUniqueColors(attrs) : [];
    const sizeCount = isGroup ? getUniqueSizeCount(attrs) : 0;
    const category  = (product.taxonomy?.find(t => t.kind === 'family') ?? product.taxonomy?.[0])?.value;
    const badge     = getBadge(product, hasDiscount);

    const visibleSwatches  = colors.slice(0, MAX_SWATCHES);
    const extraSwatches    = colors.length - visibleSwatches.length;

    return (
        <Link
            href={`/product/${product.id}`}
            className="group block bg-white rounded-xl overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-300"
        >
            {/* Imagen */}
            <div className="relative aspect-[4/5] overflow-hidden bg-muted">
                {imageUrl ? (
                    <Image
                        src={imageUrl}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                        Sin imagen
                    </div>
                )}

                {/* Badge NUEVO / OFERTA / TOP */}
                {badge && (
                    <span className="absolute top-2 right-2 bg-[#FF637E] text-white font-jost text-[10px] font-bold px-2 py-1 rounded-full tracking-wider uppercase">
                        {badge}
                    </span>
                )}

                {/* Quick-add overlay */}
                <div className="absolute bottom-0 inset-x-0 bg-black text-white font-jost text-xs font-bold uppercase tracking-widest py-2.5 text-center translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    Ver producto
                </div>
            </div>

            {/* Info */}
            <div className="p-3 space-y-1.5">
                {/* Categoría */}
                {category && (
                    <p className="font-inter text-[11px] text-muted-foreground leading-none">
                        {category}
                    </p>
                )}

                {/* Nombre */}
                <p className="font-jost text-[13px] font-bold uppercase tracking-[1px] text-foreground line-clamp-2 leading-tight">
                    {product.name}
                </p>

                {/* Colores + tallas (solo grupos) */}
                {isGroup && (colors.length > 0 || sizeCount > 0) && (
                    <div className="flex items-center gap-2 flex-wrap">
                        {visibleSwatches.length > 0 && (
                            <div className="flex items-center gap-1">
                                {visibleSwatches.map(attr => (
                                    <span
                                        key={attr.id}
                                        className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0"
                                        style={{ backgroundColor: attr.color }}
                                        title={attr.name}
                                    />
                                ))}
                                {extraSwatches > 0 && (
                                    <span className="font-inter text-[10px] text-muted-foreground">
                                        +{extraSwatches}
                                    </span>
                                )}
                            </div>
                        )}
                        {sizeCount > 0 && (
                            <span className="font-inter text-[10px] text-muted-foreground">
                                +{sizeCount} tallas
                            </span>
                        )}
                    </div>
                )}

                {/* Precios */}
                {finalPrice && (
                    <div className="flex items-center gap-2 flex-wrap pt-0.5">
                        <span className="font-jost text-[15px] font-bold text-foreground">
                            <Price value={finalPrice} />
                        </span>
                        {hasDiscount && (
                            <>
                                <span className="font-inter text-[12px] text-muted-foreground line-through">
                                    <Price value={originalPrice!} />
                                </span>
                                <span className="font-jost text-[10px] font-bold text-[#FF637E] bg-pink-50 px-1.5 py-0.5 rounded">
                                    -{discountPct}%
                                </span>
                            </>
                        )}
                    </div>
                )}
            </div>
        </Link>
    );
}
