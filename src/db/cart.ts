import firestore from "@/firebase/firestore"
import { CollectionReference, collection, doc, getDoc, getDocs, query, setDoc, updateDoc, where } from "firebase/firestore"

export type TItemEntry = {
    image: string,
    itemId: string,
    itemName: string,
    itemPrice: number,
    quantity: number,
    categorySlug: string,
    productSlug: string,
    size: string
}

export type TCart = {
    items: TItemEntry[],
    uid: string
}


export class Cart {
    public static collection: CollectionReference = collection(firestore, "carts")

    static async getCart(uid: string): Promise<TCart | null> {
        console.log(`[Cart] Attempting to get cart for UID: ${uid}`);
        const cartDocRef = doc(this.collection, uid);
        try {
            const cartDocSnap = await getDoc(cartDocRef);
            if (cartDocSnap.exists()) {
                console.log(`[Cart] Cart found for UID: ${uid}`);
                return cartDocSnap.data() as TCart;
            } else {
                console.log(`[Cart] No cart found for UID: ${uid}`);
                return null;
            }
        } catch (error) {
            console.error(`[Cart] Error getting cart for UID ${uid}:`, error);
            return null;
        }
    }

    static async createCart(uid: string): Promise<void> {
        console.log(`[Cart] Attempting to create cart for UID: ${uid}`);
        try {
            await setDoc(doc(this.collection, uid), { items: [], uid: uid });
            console.log(`[Cart] Cart created successfully for UID: ${uid}`);
        } catch (error) {
            console.error(`[Cart] Error creating cart for UID ${uid}:`, error);
            throw error; // Re-throw to ensure it's caught upstream
        }
    }
    
    static async ensureCartExists(uid: string): Promise<void> {
        const cart = await this.getCart(uid);
        if (!cart) {
            console.log(`No cart found for user ${uid}. Creating one.`);
            await this.createCart(uid);
        }
    }

    // The rest of the functions below will now work correctly
    // because they rely on the fixed getCart function.
    
    static async addItemToCart(uid: string, item: TItemEntry): Promise<void> {
        console.log(`[Cart] Attempting to add item to cart for UID: ${uid}`, item);
        const cart = await this.getCart(uid);
        if (!cart) {
            console.warn(`[Cart] Cart not found when adding item. Attempting to create one for UID: ${uid}`);
            await this.createCart(uid);
        }
        const newCart = await this.getCart(uid);
        if (!newCart) {
            console.error(`[Cart] Failed to get cart even after creation attempt for UID: ${uid}`);
            throw new Error("Cart not found after ensure/creation");
        }
        const itemIndex = newCart.items.findIndex(i => i.itemId === item.itemId && i.size === item.size);
        if (itemIndex === -1) {
            newCart.items.push(item);
        } else {
            newCart.items[itemIndex].quantity += item.quantity;
        }
        try {
            await updateDoc(doc(this.collection, uid), { ...newCart });
            console.log(`[Cart] Item added/updated in cart for UID: ${uid}`);
        } catch (error) {
            console.error(`[Cart] Error updating cart for UID ${uid} with item:`, item, error);
            throw error; // Re-throw to ensure it's caught upstream
        }
    }

    static async removeItemFromCart(uid: string, itemId: string, size: string): Promise<void> {
        const cart = await this.getCart(uid)
        if (!cart) {
            throw new Error("Cart not found")
        }
        const itemIndex = cart.items.findIndex(i => i.itemId === itemId && i.size === size)
        if (itemIndex === -1) {
            throw new Error("Item not found")
        }
        cart.items.splice(itemIndex, 1)
        await updateDoc(doc(this.collection, uid), { ...cart })
    }

    static async updateItemQuantity(uid: string, itemId: string, size: string, quantity: number): Promise<void> {
        const cart = await this.getCart(uid)
        if (!cart) {
            throw new Error("Cart not found")
        }
        const itemIndex = cart.items.findIndex(i => i.itemId === itemId && i.size === size)
        if (itemIndex === -1) {
            throw new Error("Item not found")
        }
        cart.items[itemIndex].quantity = quantity
        await updateDoc(doc(this.collection, uid), { ...cart })
    }

    static async clearCart(uid: string): Promise<void> {
        const cart = await this.getCart(uid)
        if (!cart) {
            throw new Error("Cart not found")
        }
        cart.items = []
        await updateDoc(doc(this.collection, uid), { ...cart })
    }
}