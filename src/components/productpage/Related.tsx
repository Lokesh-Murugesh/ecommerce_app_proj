"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import  { TProduct } from "@/db/products"

interface RelatedProductsProps {
  products: TProduct[]
  category: string
}

export default function RelatedProducts({ products, category }: RelatedProductsProps) {
  const [shouldShowControls, setShouldShowControls] = useState(false)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const calculateVisibleItems = () => {
        const width = window.innerWidth
        let itemsPerView

        if (width >= 1024) {
          // lg breakpoint
          itemsPerView = 4
        } else if (width >= 640) {
          // sm breakpoint
          itemsPerView = 2
        } else {
          itemsPerView = 1
        }

        setShouldShowControls(products.length > itemsPerView)
      }

      calculateVisibleItems()
      window.addEventListener("resize", calculateVisibleItems)

      return () => {
        window.removeEventListener("resize", calculateVisibleItems)
      }
    }
  }, [products.length])

  return (
    <section className="mt-12 py-8 px-4 w-full bg-zinc-900 rounded-lg">
      <h2 className="text-2xl font-bold text-white">Other Services You Might Like</h2>
      <div className="mt-6 relative">
        <Carousel
          opts={{
            align: "start",
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {products.map((product) => (
              <CarouselItem key={product.id} className="pl-2 md:pl-4 max-w-fit basis-full sm:basis-1/2 lg:basis-1/4">
                <div className="p-1">
                  <ProductCard product={product} category={category} />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          {shouldShowControls && (
            <>
              <CarouselPrevious className="hidden sm:flex absolute left-0 h-10 w-10 border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 -translate-x-4">
                <ChevronLeft className="h-6 w-6" />
              </CarouselPrevious>
              <CarouselNext className="hidden sm:flex absolute right-0 h-10 w-10 border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 translate-x-4">
                <ChevronRight className="h-6 w-6" />
              </CarouselNext>
            </>
          )}
        </Carousel>
      </div>
    </section>
  )
}

function ProductCard({ product, category }: { product: TProduct; category: string }) {
  return (
    <div className="group relative overflow-hidden rounded-md bg-zinc-900 p-2">
      <div className="aspect-square overflow-hidden rounded-md">
        <img
          src={product.images[0] || "/placeholder.svg"}
          alt={product.name}
          className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="mt-2">
        <h3 className="text-sm font-medium text-white truncate">{product.name}</h3>
        <p className="mt-1 text-sm font-medium text-zinc-300">
          {product.salePriceINR !== -1 ? (
            <>
              <span className="line-through text-zinc-500 mr-2">EUR {product.priceINR}</span>
              <span>EUR {product.salePriceINR}</span>
            </>
          ) : (
            <>EUR {product.priceINR}</>
          )}
        </p>
      </div>
      <a href={`/${category}/${product.slug}`} className="absolute inset-0" aria-label={`View ${product.name}`}>
        <span className="sr-only">View service</span>
      </a>
    </div>
  )
}
