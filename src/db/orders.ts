import firestore from "@/firebase/firestore";
import { TItemEntry } from "./cart";
import { CollectionReference, collection, doc, getDocs, query, setDoc, updateDoc, where, getDoc } from "firebase/firestore"

export type TStatus =
  | 'active'
  | 'delivered'
  | 'cancelled'
  | 'refunded'
  | 'packed'
  | 'shipped'
  | 'replaced'
  | 'dispatched';

export type TOrder = {
    id: string,
    items: TItemEntry[],
    uid: string,
    paymentId: string,
    paymentStatus: "success" | "failed",
    status: TStatus, 
    orderTrackingCode: string,
    deliveryDetails: {
        address: string,
        city: string,
        postalCode: string,
        state: string,
        name: string,
        phone: string,
        email: string,
    },
    createTimestamp: number,
    deliveryFee: number,
}

export class Orders {
    public static collection: CollectionReference = collection(firestore, "orders")

    static async getAllOrders(): Promise<(TOrder & { id: string })[]> {
        const snapshot = await getDocs(this.collection)
        const orders: (TOrder & { id: string })[] = []
        snapshot.forEach(doc => {
            // @ts-ignore
            orders.push({id: doc.id, ...doc.data() as TOrder})
        })
        return orders
    }
    
    static async getUserOrders(uid: string): Promise<(TOrder & { id: string })[]> {
        const snapshot = await getDocs(query(this.collection, where("uid", "==", uid)))
        const orders: (TOrder & { id: string })[] = []
        snapshot.forEach(doc => {
            // @ts-ignore
            orders.push({id: doc.id, ...doc.data() as TOrder})
        })
        return orders
    }

    static async createOrder(order: Omit<TOrder, "id">): Promise<void> {
        await setDoc(doc(this.collection), order)
    }

    static async updateOrderTracking(orderId: string, trackingCode: string): Promise<void> {
        await updateDoc(doc(this.collection, orderId), { orderTrackingCode: trackingCode })
    }

    static async completeOrder(orderId: string): Promise<void> {
        await updateDoc(doc(this.collection, orderId), { status: "delivered" })
    }

    static async unCompleteOrder(orderId: string): Promise<void> {
        await updateDoc(doc(this.collection, orderId), { status: "shipped" })
    }

    static async updateOrderStatus(orderId: string, status: TStatus): Promise<void> {
        await updateDoc(doc(this.collection, orderId), { status })
    }

    // New: Method to cancel an order
    static async cancelOrder(orderId: string): Promise<void> {
        await updateDoc(doc(this.collection, orderId), { status: "cancelled" });
    }

    static sortOrdersByRecency(orders: (TOrder & { id: string })[]): (TOrder & { id: string })[] {
        return orders.sort((a, b) => b.createTimestamp - a.createTimestamp)
    }

    static filterOrderByStatus(orders: (TOrder & { id: string })[], status: "active" | "delivered" | "cancelled" | "refunded" | "packed" | "shipped" | "replaced" | "dispatched"): (TOrder & { id: string })[] {
        switch (status) {
            case "active":
                return orders.filter(order => order.status === "active")
            case "delivered":
                return orders.filter(order => order.status === "delivered")
            case "cancelled":
                return orders.filter(order => order.status === "cancelled")
            case "refunded":
                return orders.filter(order => order.status === "refunded")
            case "packed":
                return orders.filter(order => order.status === "packed")
            case "shipped":
                return orders.filter(order => order.status === "shipped")  
            case "replaced":
                return orders.filter(order => order.status === "replaced")
            case "dispatched":
                return orders.filter(order => order.status === "dispatched")  
            default:
                return orders
        }
    }

    static async getOrder(orderId: string): Promise<TOrder | null> {
        const docRef = doc(this.collection, orderId);
        const docSnap = await getDoc(docRef);
        // @ts-ignore
        return docSnap.exists() ? ({ id: docSnap.id, ...docSnap.data() as TOrder }) : null;
    }
}
