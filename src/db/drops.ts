import firestore from "@/firebase/firestore"
import { CollectionReference, addDoc, collection, deleteDoc, doc, getDocs, setDoc, updateDoc } from "firebase/firestore"

// FIX: Renamed type from Drop to Category
export interface Category {
    name: string
    description: string
    image?: string // Image is optional as it might not exist on all categories
    id: string; // Add an 'id' property, which can be the slug
    slug: string
}

// FIX: Renamed class from Drops to Categories
export class Categories {
    public collection: CollectionReference

    constructor() {
        this.collection = collection(firestore, 'categories') as CollectionReference<Category>; // Corrected usage
    }

    /**
     * Correctly fetches all documents from the 'categories' collection.
     * Each document is treated as a separate category.
     */
    // FIX: Renamed getDrops to getCategories
    async getCategories(): Promise<{ [key: string]: Category }> { // FIX: Updated return type to Category
        const snapshot = await getDocs(this.collection); // Corrected usage for fetching all documents
        const categories: { [slug: string]: Category } = {}; // Use slug as key
        snapshot.docs.forEach(doc => {
            // Ensure 'id' is populated with doc.id when fetching
            categories[doc.id] = { ...(doc.data() as Category), id: doc.id, slug: doc.id }; // Explicitly cast doc.data()
        });
        return categories;
    }

    // The functions below should now work correctly with the new structure
    // FIX: Renamed getDrop to getCategory and dropSlug to categorySlug
    async getCategory(categorySlug: string): Promise<Category | undefined> { // FIX: Updated return type to Category
        const categories = await this.getCategories()
        return categories[categorySlug]
    }

    // FIX: Renamed updateDrop to updateCategory and dropSlug to categorySlug, drop to category
    async updateCategory(categorySlug: string, category: any) {
        const old = await this.getCategory(categorySlug)
        await updateDoc(doc(this.collection, categorySlug), { ...old, ...category })
    }

    // FIX: Renamed createDrop to createCategory and dropSlug to categorySlug, drop to category
    async createCategory(categorySlug: string, category: any) {
        await setDoc(doc(this.collection, categorySlug), category)
    }

    // FIX: Renamed deleteDrop to deleteCategory and dropSlug to categorySlug
    async deleteCategory(categorySlug: string) {
        await deleteDoc(doc(this.collection, categorySlug))
    }
}