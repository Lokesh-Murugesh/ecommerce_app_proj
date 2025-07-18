import React from 'react';
import { ProductCard } from '../productpage/ProductCard';
import { TProduct } from '@/db/products'; // Import TProduct from the central definition

// No need to define TProduct here anymore, it's imported
// interface TProduct {
//   id: string;
//   slug: string;
//   name: string;
//   priceEUR: number;
//   featuredImage: string;
//   variants: Array<{ available: number }>;
// }

interface GridProductsSectionProps {
  products: TProduct[];
  categorySlug: string;
}

const GridProductsSection = ({ products, categorySlug }: GridProductsSectionProps) => {
  // Handle the case where there are no products to display
  if (!products || products.length === 0) {
    return (
      <div className="py-20 text-center">
        <h2 className="text-2xl font-semibold text-zinc-400">No Services Found</h2>
        <p className="mt-2 text-zinc-500">There are currently no services available in this category.</p>
      </div>
    );
  }

  return (
    // This creates a responsive grid. It will show 1, 2, or 3 columns
    // depending on the screen size, making it look great on mobile and desktop.
    <section className="mt-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => {
          console.log("Product data in GridProductsSection:", product); // <-- ADDED LOG HERE
          return (
            <div key={product.id}>
              <ProductCard
                product={product}
                category={categorySlug}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default GridProductsSection;