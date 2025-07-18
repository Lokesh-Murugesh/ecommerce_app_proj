import Nav from '@/components/shared/Nav'
import Footer from '@/components/shared/Footer'
import { ProductDocument, TProduct } from '@/db/products'
import { GetServerSideProps, GetServerSidePropsContext } from 'next'
import PageLoader from '@/components/shared/PageLoader'
import Head from 'next/head'
import GridProductsSection from '@/components/category/Grid'
import Link from 'next/link'
import { COMPANY_NAME } from '@/utils/constants'
import { adminFirestore } from '@/firebase/admin'
import products from './admin/products'
import { Category } from '@/db/drops'; // Import the renamed Category type

const breadcrumbs = [{ id: 1, name: 'Home', href: '/' }]

interface CategoryPageProps {
  categoryDetails: Category | null;
  products: TProduct[]; // This will now be the pre-filtered list of products
  categorySlug: string;
}

export default function CategoryPage({ categoryDetails, products, categorySlug }: CategoryPageProps) {
    if (!categoryDetails) {
        return <PageLoader />;
    }

    const pageTitle = `${categoryDetails.name} - ${COMPANY_NAME}`;
    const pageDescription = categoryDetails.description;
    const pageUrl = `https://www.yourwebsite.com/${categorySlug}`;

    return (
        <>
            <Head>
                <title>{pageTitle}</title>
                <meta name="description" content={pageDescription} />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="canonical" href={pageUrl} />
            </Head>
            <div className="bg-black text-pink-50">
                <Nav />

                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Breadcrumbs */}
                    <div className="border-b border-zinc-800">
                        <nav aria-label="Breadcrumb" className="py-4">
                            <ol role="list" className="flex items-center space-x-4">
                                {breadcrumbs.map((breadcrumb) => (
                                    <li key={breadcrumb.id}>
                                        <div className="flex items-center">
                                            <Link href={breadcrumb.href} className="mr-4 text-sm font-medium text-zinc-400 hover:text-white">
                                                {breadcrumb.name}
                                            </Link>
                                            <svg viewBox="0 0 6 20" aria-hidden="true" className="h-5 w-auto text-zinc-600">
                                                <path d="M4.878 4.34H3.551L.27 16.532h1.327l3.281-12.19z" fill="currentColor" />
                                            </svg>
                                        </div>
                                    </li>
                                ))}
                                <li className="text-sm">
                                    <span aria-current="page" className="font-medium text-white">
                                        {categoryDetails.name}
                                    </span>
                                </li>
                            </ol>
                        </nav>
                    </div>

                    <main className="py-8">
                        {/* Page Header */}
                        <div className="pb-6">
                            <h1 className="text-4xl font-bold tracking-tight text-white">
                                {categoryDetails.name}
                            </h1>
                            <p className="mt-3 max-w-2xl text-base text-zinc-400">
                                {categoryDetails.description}
                            </p>
                        </div>
                        
                        {/* Product Grid Section */}
                        <div className="border-t border-zinc-800 pt-6">
                            <GridProductsSection products={products} categorySlug={categorySlug} />
                        </div>
                    </main>
                </div>
                <Footer />
            </div>
        </>
    )
}

// --- THIS IS THE NEW, SIMPLIFIED DATA FETCHING LOGIC ---
export const getServerSideProps: GetServerSideProps<CategoryPageProps> = async (context: GetServerSidePropsContext) => {
    const { category: categorySlug } = context.params as { category: string };

    if (!categorySlug) {
        return { notFound: true };
    }

    try {
        // --- Step 1: Fetch the details for this specific category (we still need this for the title) ---
        const categoryDocRef = adminFirestore.collection('categories').doc(categorySlug);
        const categoryDocSnap = await categoryDocRef.get();

        if (!categoryDocSnap.exists) {
            return { notFound: true };
        }
        
        const categoryDetails = {
            slug: categoryDocSnap.id,
            ...(categoryDocSnap.data() as Omit<Category, 'slug'>)
        };

        // --- Step 2: Fetch ALL products from the database ---
        const productsSnapshot = await adminFirestore.collection('products').get();
        const allProducts = productsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as ProductDocument),
        }));

        // --- Step 3: Filter the products in our code ---
        // This is the "hardcoded" logic. It finds all products where the 'categories' array
        // contains the slug from the URL (e.g., "bridal-services").
        const filteredProducts = allProducts.filter(product => 
            product.categories && product.categories.includes(categorySlug)
        );
        console.log(allProducts)
        console.log("++++++++++++++++++++++++++++++++++++++++++")

        // --- Step 4: Return the FILTERED data as props ---
        return {
            props: {
                categoryDetails: JSON.parse(JSON.stringify(categoryDetails)),
                products: JSON.parse(JSON.stringify(filteredProducts)), // Pass the filtered list
                categorySlug: categorySlug,
            }
        };

    } catch (error) {
        console.error("Error fetching category page data:", error);
        return { notFound: true };
    }
};