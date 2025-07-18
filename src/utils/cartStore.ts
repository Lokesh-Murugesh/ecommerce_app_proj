import { create } from 'zustand';
import { Cart, TCart } from '@/db/cart';
import { User } from '@/db/user';
import { TProduct, Product } from '@/db/products';

type CartState = {
    cart: TCart | null;
    latestTotalPrice: number | null;
    blockCheckout: boolean;
    allProducts: TProduct[] | null;
    user: any;
    itemsCount: number;
    fetchCart: () => Promise<void>;
    handleRemoveItem: (productId: string, size: string) => Promise<void>;
    handleQuantityChange: (productId: string, newQuantity: number, size: string) => Promise<void>;
    setItemsCount: (count: number) => void;
    incrementItemsCount: (amount: number) => void;
};

export const useCartStore = create<CartState>((set, get) => ({
    cart: null,
    latestTotalPrice: null,
    blockCheckout: false,
    allProducts: null,
    user: null,
    itemsCount: 0,

    fetchCart: async () => {
        set({ blockCheckout: true });

        const currentUser = await User.getCurrentUserWithRedirect();
        if (!currentUser) return;

        const cart = await Cart.getCart(currentUser.uid);
        if (!cart) return;

        let totalPrice = 0;
        const products = await new Product().getProducts();

        // Calculate total items count
        const itemsCount = cart.items.reduce((acc, item) => acc + item.quantity, 0);

        for (const item of cart.items) {
            const product = products.find(p => p.id === item.itemId);
            if (!product) {
                await Cart.removeItemFromCart(currentUser.uid, item.itemId, item.size);
                continue;
            }

            const variant = product.variants.find(v => v.size === item.size);
            if (!variant) {
                await Cart.removeItemFromCart(currentUser.uid, item.itemId, item.size);
                continue;
            }

            if (variant.available < item.quantity) {
                alert(`Only ${variant.available} left in stock for ${product.name} (${item.size})`);
                await Cart.updateItemQuantity(currentUser.uid, item.itemId, item.size, variant.available);
                continue;
            }

            // Fix: Use priceEUR and salePriceEUR
            totalPrice += (product.salePriceEUR !== -1 ? product.salePriceEUR : product.priceEUR) * item.quantity;
            item.itemPrice = product.salePriceEUR !== -1 ? product.salePriceEUR : product.priceEUR;
        }

        set({
            cart,
            latestTotalPrice: totalPrice,
            allProducts: products,
            blockCheckout: false,
            user: currentUser,
            itemsCount,
        });
    },

    handleRemoveItem: async (productId, size) => {
        const currentUser = await User.getCurrentUserWithRedirect();
        if (!currentUser) return;

        await Cart.removeItemFromCart(currentUser.uid, productId, size);
        get().fetchCart();
    },

    handleQuantityChange: async (productId, newQuantity, size) => {
        const currentUser = await User.getCurrentUserWithRedirect();
        if (!currentUser) return;

        await Cart.updateItemQuantity(currentUser.uid, productId, size, newQuantity);
        get().fetchCart();
    },

    setItemsCount: (count: number) => {
        set({ itemsCount: count });
    },

    incrementItemsCount: (amount: number) => {
        set(state => ({ itemsCount: state.itemsCount + amount }));
    },
}));