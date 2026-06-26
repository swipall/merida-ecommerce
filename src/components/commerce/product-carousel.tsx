'use client';

import {ProductCard} from "@/components/commerce/product-card";
import {Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious,} from "@/components/ui/carousel";
import { InterfaceInventoryItem } from "@/lib/swipall/types/types";
import {useId} from "react";

interface ProductCarouselClientProps {
    title: string;
    excerpt?: string | null;
    products: InterfaceInventoryItem[];
}

export function ProductCarousel({title, excerpt, products}: ProductCarouselClientProps) {
    const id = useId();

    if(!products){
        return null;
    }

    return (
        <section className="py-12 md:py-16">
            <div className="container mx-auto px-4">
                {excerpt && <p className="font-jost text-[#FF637E] text-[11px] font-bold uppercase tracking-[2px] mb-1">{excerpt}</p>}
                <h2 className="font-jost text-2xl md:text-3xl font-black uppercase tracking-[2px] mb-8">{title}</h2>
                <Carousel
                    opts={{
                        align: "start",
                        loop: true,
                    }}
                    className="w-full"
                >
                    <CarouselContent className="-ml-2 md:-ml-4">
                        {products.map((product, i) => (
                            <CarouselItem key={id + i}
                                          className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                                <ProductCard product={product}/>
                            </CarouselItem>
                        ))}
                    </CarouselContent> 
                    <CarouselPrevious className="hidden md:flex"/>
                    <CarouselNext className="hidden md:flex"/>
                </Carousel>
            </div>
        </section>
    );
}
