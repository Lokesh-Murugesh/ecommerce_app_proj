import { TProduct } from '@/db/products';
import Link from 'next/link';
import { useState } from 'react';

interface ProductCardProps {
    product: TProduct
    category: string
}

export const ProductCard = ({ product, category }: ProductCardProps) => {
    const [isHovering, setIsHovering] = useState<boolean>(false)

    const handleMouseEnter = () => {
        setIsHovering(true)
    }

    const handleMouseLeave = () => {
        setIsHovering(false)
    }


    return <div
        key={product.id}
        className="group relative flex max-w-full w-64 flex-col overflow-hidden shadow-light shadow-outlaw-blue hover:shadow-none hover:translate-x-1 hover:translate-y-1 rounded-lg border-4 border-outlaw-blue bg-foreground"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
    >
        <div className="h-48 bg-black sm:aspect-none group-hover:opacity-75 sm:h-48">
            <img
                src={
                    isHovering ? product.featuredImageHover : product.featuredImage
                }
                className="h-full w-full object-cover object-center sm:h-full sm:w-full"
            />
        </div>
        <div className="flex flex-1 flex-col space-y-2 p-1">
            <h3 className="text-sm md:text-3xl font-semibold tracking-tight text-black min-h-20">
                <Link href={`/${category}/${product.slug}`}>
                    <span aria-hidden="true" className="absolute inset-0" />
                    {product.name}
                </Link>
            </h3>
        </div>
    </div>
}