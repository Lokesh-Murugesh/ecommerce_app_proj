import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel"
import Autoplay from "embla-carousel-autoplay"
import Image from "next/image"
import Link from "next/link"
import { useRef, useEffect } from "react"
import { ArrowUpRight } from "lucide-react"

export interface ImageType {
  url: string
  route_to?: string
  alt?: string
}

interface IndexCarouselProps {
  images: ImageType[]
}

export default function IndexCarousel({ images }: IndexCarouselProps) {
  const autoplayRef = useRef(Autoplay({ delay: 4000, stopOnInteraction: false }))

  useEffect(() => {
    autoplayRef.current.reset()
  }, [])

  return (
    <div className="max-w-[1100px] mx-auto px-4 py-8">
      <Carousel
        className="w-full rounded-xl overflow-hidden shadow-md"
        plugins={[autoplayRef.current]}
        opts={{
          loop: true,
          align: "start",
        }}
      >
        <CarouselContent>
          {images.map((image, index) => (
            <CarouselItem key={index} className="relative w-full">
              <div className="w-full h-full flex items-center justify-center">
                {image.route_to ? (
                  <Link href={image.route_to} className="w-full group relative cursor-pointer">
                    <div className="relative aspect-video">
                      <Image
                        src={image.url || "/placeholder.svg"}
                        alt={image.alt || `carousel-${index}`}
                        width={1200}
                        height={675}
                        priority={index === 0}
                        className="w-full h-full object-cover transition-opacity group-hover:opacity-95 rounded-lg"
                      />
                      <div className="absolute inset-0 bg-black/0 transition-colors rounded-lg">
                        <div className="absolute bottom-4 right-4 flex flex-row items-center justify-center bg-outlaw-blue/90 p-2 rounded-md shadow-md transition-opacity">
                          <ArrowUpRight className="w-5 h-5" />
                          <span className="text-sm ml-1">Check out now!</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ) : (
                  <div className="relative aspect-video">
                    <Image
                      src={image.url || "/placeholder.svg"}
                      alt={image.alt || `carousel-${index}`}
                      width={1200}
                      height={675}
                      priority={index === 0}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                )}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
}