import { TCart } from "@/db/cart";
import { TProduct } from "@/db/products";

export const DELIVERY_FEE = 49;
export const MIN_TOTAL_VALUE_FOR_FREE_DELIVERY = 399;


export async function fetchDeliveryFee(postalCode: string): Promise<number> {
    try {
        const response = await fetch(`/api/shipping-cost?d_pin=${postalCode}`);

        if (!response.ok) {
            console.error('Failed to fetch delivery fee');
            return DELIVERY_FEE;
        }

        const data = await response.json();

        console.log(data);

        return data.total > 0 ? data.total : DELIVERY_FEE;
    } catch (error) {
        console.error('Error fetching delivery fee:', error);
        return DELIVERY_FEE;
    }
}


export function getSaleOrNonSalePrice(product: TProduct): number {
    // FIX: Use priceEUR and salePriceEUR
    return product.salePriceEUR !== -1 ? product.salePriceEUR : product.priceEUR
}

export function calculateSubtotal(cart: TCart | null): number {
    if (!cart) return 0;
    console.log(cart.items.reduce((sum, item) => sum + item.itemPrice * item.quantity, 0))
    return cart.items.reduce((sum, item) => sum + item.itemPrice * item.quantity, 0);
}
