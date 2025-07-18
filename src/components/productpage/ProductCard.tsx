import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { TProduct } from '@/db/products'; // Add this import

// Define the exact props the card needs to render itself.
interface ProductCardProps {
  product: TProduct; // Ensure this uses the imported TProduct
  category: string;
}

export const ProductCard = ({ product, category }: ProductCardProps) => {
  // Check if any variant of the product is available (stock > 0)
  const isAvailable = product.variants.some(v => v.available > 0);
  
  return (
    // The <Link> component wraps the entire card, making it clickable.
    // legacyBehavior is needed when the child of Link is a custom component or an <a> tag.
    <Link href={`/${category}/${product.slug}`} legacyBehavior>
      <a className="group block h-full overflow-hidden rounded-lg border-2 border-zinc-800 bg-zinc-900 transition-all duration-300 hover:border-pink-500 hover:shadow-lg hover:shadow-pink-500/10">
        
        {/* Image Container: FIX - Added a fixed height to resolve "height of 0" warning */}
        <div className="relative w-full h-[250px] overflow-hidden"> {/* Increased height a bit for better visibility */}
          {product.featuredImage ? (
            <Image
              src={product.featuredImage}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            // A fallback in case an image URL is missing
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-800 to-black">
              <span className="text-pink-300">No Image</span>
            </div>
          )}
          
          {/* "Unavailable" Badge */}
          {!isAvailable && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-black/70 px-3 py-1 text-xs font-medium text-rose-300 backdrop-blur-sm">
              <p>Unavailable</p>
            </div>
          )}
        </div>
        
        {/* Text Content */}
        <div className="p-4">
          <h3 className="truncate text-lg font-semibold text-rose-200 transition-colors group-hover:text-rose-100">{product.name}</h3>
          
          {/* FIX: Add the short description here with fixed height for consistency */}
          <p className="text-gray-300 mb-4 h-16 overflow-hidden">{product.description.short}</p>

          <div className="mt-2 flex items-center justify-between">
            <p className="font-bold text-pink-100">€{product.priceEUR.toLocaleString()}</p>
            <span className="text-xs font-semibold uppercase tracking-wider text-pink-300 transition-colors group-hover:text-pink-100">
              {isAvailable ? 'Book Now' : 'Details'} →
            </span>
          </div>
        </div>
      </a>
    </Link>
  );
};