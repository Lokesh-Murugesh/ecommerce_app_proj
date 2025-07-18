import { create } from 'zustand'
import { Product, TProduct } from "@/db/products"

type ProductState = {
  products: TProduct[];
  isLoading: boolean;
  initialize: () => Promise<void>;
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  isLoading: false,
  initialize: async () => {
    // Only fetch if products are not already loaded and not currently loading.
    if (get().products.length === 0 && !get().isLoading) {
      set({ isLoading: true });
      try {
        const productService = new Product();
        const productData = await productService.getProducts();
        set({ products: productData, isLoading: false });
      } catch (error) {
        console.error("Failed to fetch and initialize products:", error);
        set({ isLoading: false });
      }
    }
  }
}));