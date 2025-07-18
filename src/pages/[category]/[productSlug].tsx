import ProductDetails from "@/components/productpage/Details"
import ProductGallery from "@/components/productpage/Gallery"
import RelatedProducts from "@/components/productpage/Related"
import Nav from "@/components/shared/Nav"
import { TProduct } from "@/db/products"
import { Toaster } from "react-hot-toast"

import { GetServerSideProps } from 'next';
import { Product, ProductDocument } from '@/db/products';
import { Query, getDocs, query, where } from 'firebase/firestore';
import { COMPANY_NAME } from '@/utils/constants';


interface ProductPageProps {
  product: TProduct
  relatedProducts: TProduct[]
}

export const getServerSideProps: GetServerSideProps<ProductPageProps> = async (context) => {
    const { category, productSlug } = context.params as { category: string; productSlug: string };

    // Fetch products
    const productsQuery = query(
        new Product().collection,
        where("categories", "array-contains", category)
    );

    const productsSnapshot = await getDocs(productsQuery);
    const products = productsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as ProductDocument),
    }));

    const product = products.find((p) => p.slug === productSlug) || null;
    const relatedProducts = products.filter((p) => p.slug !== productSlug);

    if (!product) {
        return {
            notFound: true
        };
    }

    return {
        props: {
            product,
            relatedProducts,
        }
    };
};

export default function ProductPage({ product, relatedProducts }: ProductPageProps) {
  if (!product) return null

  return (
    <div className="bg-black text-white min-h-screen">
    
        <Nav/>
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:grid lg:grid-cols-2 lg:gap-x-8 bg-zinc-900 rounded-md p-4 md:p-6 lg:p-8">
          <ProductGallery images={product.images} />
          <ProductDetails product={product} />
        </div>

        <RelatedProducts products={relatedProducts} category={product.categories[0]} />
      </main>
      <Toaster position="bottom-center" />
    </div>
  )
}
