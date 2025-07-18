import { create } from 'zustand'
import { Categories, Category } from "@/db/drops"

type CategoryState = {
  categories: Category[]
  initialize: () => Promise<void>
}

export const useDropsStore = create<CategoryState>((set, get) => ({
  categories: [],
  initialize: async () => {
    // This guard clause prevents the store from re-fetching data if it already exists.
    if (get().categories.length === 0) {
      try {
        const categoriesService = new Categories()
        const categories = await categoriesService.getCategories()
        
        const categoriesData = Object.entries(categories).map(([id, categoryData]) => ({
          ...(categoryData as Category) // Spread the entire Category object
        }))
        
        set({ categories: categoriesData })
      } catch (error) {
          console.error("Failed to fetch and initialize categories:", error);
      }
    }
  }
}))

// The automatic initialization line has been removed from the end of this file.