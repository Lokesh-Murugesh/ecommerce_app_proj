import { useQuery } from '@tanstack/react-query';
import { doc, getDoc } from 'firebase/firestore';
import firestore from "@/firebase/firestore";
import { Product } from '@/db/products';
import { motion } from "framer-motion";


const SkeletonCarousel = () => (
    <div className="w-full h-[400px] bg-black/60 text-pink-100 animate-pulse backdrop-blur-md rounded-xl"></div>
);

const SkeletonProducts = () => (
    <section className="py-20 px-6 bg-[#2b2b2b]">
  <motion.h2
    className="text-4xl font-semibold text-center text-pink-100 mb-12"
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8 }}
  >
    Our Signature Services
  </motion.h2>

  <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
    {["Bridal Makeup", "Sangeet Styling", "Engagement Looks"].map(
      (title, index) => (
        <motion.div
          key={title}
          className="bg-[#3a3a3a] p-6 rounded-xl shadow-md hover:scale-105 transform transition-all duration-300"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.3 }}
        >
          <img
            src="https://images.unsplash.com/photo-1500840216050-6ffa99d75160?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt={title}
            className="rounded-md mb-4 w-full h-[200px] object-cover"
          />
          <h3 className="text-xl font-semibold text-white">{title}</h3>
          <p className="text-gray-400 mt-2">
            Enhance your beauty with bespoke styling, curated for every bride’s
            dream day.
          </p>
        </motion.div>
      )
    )}
  </div>
</section>
);

const useCarouselSettings = () => {
    return useQuery({
        queryKey: ['carouselSettings'],
        queryFn: async () => {
            const docRef = doc(firestore, 'settings', 'carousel');
            const docSnap = await getDoc(docRef);
            return docSnap.exists() ? docSnap.data().images || [] : [];
        }
    });
};

const useProducts = () => {
    return useQuery({
        queryKey: ['products'],
        queryFn: () => new Product().getProducts()
    });
};


export {useCarouselSettings, useProducts, SkeletonCarousel, SkeletonProducts };
