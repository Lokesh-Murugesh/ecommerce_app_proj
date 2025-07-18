import React from "react";
import Head from "next/head";
import { motion } from "framer-motion";
import Nav from "@/components/shared/Nav";
import Footer from "@/components/shared/Footer";
import { SkeletonCarousel } from "@/components/index/utils";
import { COMPANY_DESCRIPTION, COMPANY_NAME, COMPANY_TAGLINE } from "@/utils/constants";
import Link from "next/link";
import { type TProduct, type ProductDocument } from "@/db/products";
import { type Category } from "@/db/drops"; // Changed from Drop to Category
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { GetServerSideProps } from "next";
import { adminFirestore } from "@/firebase/admin";
// FIX: Import Carousel components
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
// FIX: Import Autoplay plugin
// import Autoplay from 'embla-carousel-autoplay';
import Image from "next/image"; // Ensure Next.js Image is imported

// Define a simpler type if needed, or inline for hardcoded values
interface ImageType {
    url: string;
}

// Define the props that the page will receive from the server
interface HomeProps {
    carouselImages: ImageType[];
    products: TProduct[];
    categories: Array<{ id: string; name: string }>;
}

export default function Home({ carouselImages, products, categories }: HomeProps) {
    if (!products) {
        return <SkeletonCarousel />;
    }

    const structuredData = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "url": "https://www.thecompany.com", // Replace with your actual URL
        "name": COMPANY_NAME,
        "description": COMPANY_DESCRIPTION,
    };

    return (
        <div className="flex flex-col min-h-screen">
            <Head>
                <title>{COMPANY_NAME} - {COMPANY_TAGLINE}</title>
                <meta name="description" content={COMPANY_DESCRIPTION} />
                <link rel="canonical" href="https://www.thecompany.com" /> {/* Replace with your actual URL */}
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
                <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" />
                <script type="application/ld+json">
                    {JSON.stringify(structuredData)}
                </script>
            </Head>

            <div className="fixed top-0 left-0 right-0 z-50">
                <Nav />
            </div>

            <main className="flex-grow pt-16">
                {/* FIX: Set Carousel container height and remove Autoplay plugin */}
                <div className="relative text-white font-sans h-[75vh]"> {/* Changed min-h-screen to h-[75vh] */}
                    <Carousel
                        opts={{ loop: true }}
                        // FIX: Re-enabled Autoplay plugin
                        // @ts-ignore: Type 'AutoplayType' is not assignable to 'CreatePluginType<LoosePluginType, {}>'.
                        plugins={[
                            
                        ]}
                    >
                        <CarouselContent>
                            {carouselImages.map((image, index) => (
                                <CarouselItem key={index}>
                                    {/* Image container for fill prop */}
                                    <div className="relative w-full h-[75vh]"> {/* Ensure this matches parent Carousel height */}
                                        <Image
                                            src={image.url}
                                            alt={`Carousel image ${index + 1}`}
                                            fill
                                            className="object-cover" // Ensures image covers the area
                                            sizes="100vw"
                                            priority={index === 0}
                                        />
                                    </div>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                    </Carousel>

                    {/* Hero Section content overlaid on carousel */}
                    <section className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 z-10 bg-black/30">
                        <motion.h1
                            className="text-5xl md:text-6xl font-bold text-rose-500"
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1 }}
                        >
                            Makeupstoriesby-Rashi
                        </motion.h1>
                        <motion.p
                            className="mt-4 text-lg md:text-xl text-rose-300"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                        >
                            Bridal Beauty • Glam Looks • Wedding Styling
                        </motion.p>
                    </section>

                    {/* Services Section */}
                    <section className="py-20 px-6 bg-black">
                        <motion.h2
                            className="text-4xl font-semibold text-center text-pink-100 mb-12"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            Our Signature Services
                        </motion.h2>

                        {categories && products && categories.map((category) => (
                            <div className="mt-8 mb-12" key={category.id}>
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                    {products
                                        .filter((p) => p.categories.includes(category.id.toLowerCase()))
                                        .slice(0, 2)
                                        .map((item: TProduct, index) => (
                                            <motion.div
                                                key={item.id}
                                                className="bg-zinc-800/70 p-4 rounded-xl overflow-hidden shadow-lg hover:shadow-rose-200/10 transition-all duration-300 flex flex-col"
                                                initial={{ opacity: 0, y: 50 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.5, delay: index * 0.3 }}
                                            >
                                                <img
                                                    src={item.featuredImage}
                                                    alt={item.name}
                                                    className="rounded-md mb-4 w-full h-[200px] object-cover"
                                                />
                                                <Link href={`/${category.id}/${item.slug}`} className="text-2xl font-semibold text-rose-200 mb-2 h-8 truncate block">{item.name}</Link>
                                                <p className="text-gray-300 mb-4 h-16 overflow-hidden">{item.description.short}</p>
                                                <div className="flex justify-between items-center mt-auto">
                                                    <span className="text-white font-semibold">EUR {item.priceEUR}</span>
                                                    <Button variant="link" className="text-rose-200 p-0">
                                                        Learn more <ChevronRight className="ml-1 h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </motion.div>
                                        ))}
                                    {products.filter((p) => p.categories.includes(category.id.toLowerCase())).length > 0 && (
                                        <div className="flex items-center justify-center p-4">
                                            <Link
                                                href={`/${category.id}`}
                                                className="inline-flex items-center justify-center rounded-md border border-pink-500 bg-pink-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
                                            >
                                                See more
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </section>
                    
                    <Footer />
                </div>
            </main>
        </div>
    );
}

// This function now fetches data and hardcodes the carousel image
export const getServerSideProps: GetServerSideProps<HomeProps> = async () => {
    try {
        const productsPromise = adminFirestore.collection('products').get();
        const categoriesPromise = adminFirestore.collection('categories').get();

        const [productsSnapshot, categoriesSnapshot] = await Promise.all([
            productsPromise,
            categoriesPromise,
        ]);

        console.log(productsSnapshot.docs.map(doc => doc.data()));
        console.log("================================================")
        const products = productsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...(doc.data() as ProductDocument),
        }));

        const carouselImages: ImageType[] = [            
            { url: "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
            {url : "https://images.unsplash.com/photo-1583241800967-3b926edea1f2?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"}
        ];

        const categories = categoriesSnapshot.docs.map(doc => ({
            id: doc.id,
            name: (doc.data() as Category).name, // Changed from Drop to Category
        }));

        return {
            props: {
                carouselImages: JSON.parse(JSON.stringify(carouselImages)),
                products: JSON.parse(JSON.stringify(products)),
                categories: JSON.parse(JSON.stringify(categories)),
            },
        };
    } catch (error) {
        console.error("Error in getServerSideProps:", error);
        return {
            props: {
                carouselImages: [],
                products: [],
                categories: [],
            },
        };
    }
};