import firestore from "@/firebase/firestore";
import { CollectionReference, addDoc, collection, deleteDoc, doc, getDocs, query, updateDoc, where } from "firebase/firestore";

type ProductId = string;

export type ProductVariantData = {
    size: string;
    available: number
}

export type Description = {
    long: string;
    short: string;
}

export interface TProduct {
  id: string; // Assuming 'id' is always present and is the document ID
  name: string; // Assuming 'name' is always present
  slug: string;
  categories: string[];
  description: {
    long: string;
    short: string;
  };
  // FIX: Change 'details' to allow any string key mapping to a string array
  details: {
    [key: string]: string[];
  };
  featuredImage: string;
  featuredImageHover: string;
  images: string[];
  priceEUR: number;
  salePriceEUR: number;
  variants: Array<{
    available: number;
    size: string; // Assuming 'size' is the property for the variant name
  }>;
}

// ProductDocument interface should extend TProduct, if it's meant to represent
// the raw data from Firestore before adding the 'id'.
// If you're using `adminFirestore.collection('products').get().docs.map((doc) => ({ id: doc.id, ...(doc.data() as ProductDocument) }));`
// then ProductDocument should exclude 'id' but include all other fields.
export interface ProductDocument extends Omit<TProduct, 'id'> {}

export class Product {
    public collection: CollectionReference

    constructor() {
        this.collection = collection(firestore, "products")
    }

    async getProducts(): Promise<TProduct[]> {
        const productsCollectionResult = await getDocs(this.collection)
        const products = productsCollectionResult.docs.map(doc => ({ id: doc.id, ...(doc.data() as ProductDocument) }))
        return products
    }

    async getProduct(productId: ProductId): Promise<TProduct | null> {
        const productDoc = await getDocs(query(this.collection, where("id", "==", productId)))
        if (productDoc.empty) return null
        const product = productDoc.docs[0].data() as ProductDocument
        return { id: productDoc.docs[0].id, ...product }
    }

    async getProductsByCategory(category: string): Promise<TProduct[]> {
        const productsCollectionResult = await getDocs(query(this.collection, where("categories", "array-contains", category)))
        const products = productsCollectionResult.docs.map(doc => ({ id: doc.id, ...(doc.data() as ProductDocument) }))
        return products
    }

    async updateProduct(productId: ProductId, product: ProductDocument) {
        const docRef = doc(this.collection, productId)
        await updateDoc(docRef, product)
    }

    async updateStock(productId: ProductId, size: string, quantity: number) {
        const product = await this.getProduct(productId)
        if (!product) return
        const variant = product.variants.find(variant => variant.size === size)
        if (!variant) return
        variant.available = quantity
        await this.updateProduct(productId, product)
    }

    async bulkUpdateProductsStock(cart: { productId: ProductId, size: string, quantity: number }[]) {
        const products = await this.getProducts()
        const relevantProducts = products.filter(product => cart.map(item => item.productId).includes(product.id))
        relevantProducts.forEach(product => {
            const cartItem = cart.find(item => item.productId === product.id)
            if (!cartItem) return
            const variant = product.variants.find(variant => variant.size === cartItem.size)
            if (!variant) return
            variant.available -= cartItem.quantity
        })
        await Promise.all(relevantProducts.map(product => this.updateProduct(product.id, product)))
    }

    async createProduct(product: ProductDocument) {
        await addDoc(this.collection, product)
    }

    async deleteProduct(productId: ProductId) {
        await deleteDoc(doc(this.collection, productId))
    }
}