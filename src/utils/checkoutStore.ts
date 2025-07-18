import { create } from 'zustand';
import { Cart, TItemEntry } from '@/db/cart';
import { Orders, TOrder } from '@/db/orders';
import { Product } from '@/db/products';
import { User } from '@/db/user';
import {
    calculateSubtotal,
    getSaleOrNonSalePrice,
    fetchDeliveryFee,
    MIN_TOTAL_VALUE_FOR_FREE_DELIVERY
} from '@/utils/checkout';

type CheckoutState = {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    province: string;
    postalCode: string;
    deliveryFee: number;
    isCreatingOrder: boolean;
    isLoading: boolean;

    // Form actions
    setFormField: (field: keyof Omit<CheckoutState, 'setFormField' | 'resetForm'>, value: string) => void;
    resetForm: () => void;

    // Checkout actions
    calculateDeliveryFee: (subtotal: number) => Promise<number>;
    calculateTotalPrice: () => Promise<number>;
    createOrder: (paymentId: string) => Promise<void>;
    validateForm: () => boolean;
};

export const useCheckoutStore = create<CheckoutState>((set, get) => ({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    province: '',
    postalCode: '',
    deliveryFee: 69,
    isCreatingOrder: false,
    isLoading: false,

    setFormField: (field, value) => {
        set({ [field]: value });

        // Update delivery fee when postal code changes
        if (field === 'postalCode' && value.length === 6) {
            fetchDeliveryFee(value)
                .then(fee => set({ deliveryFee: fee }))
                .catch(() => set({ deliveryFee: 69 }));
        }
    },

    resetForm: () => {
        set({
            name: '',
            email: '',
            phone: '',
            address: '',
            city: '',
            province: '',
            postalCode: '',
            deliveryFee: 69,
            isCreatingOrder: false,
            isLoading: false,
        });
    },

    calculateDeliveryFee: async (subtotal: number) => {
        const state = get();
        const currentUser = await User.getCurrentUser();
        const hasInterstellarItem = await Cart.getCart(currentUser?.uid || '')
            .then(cart => cart?.items.some(item => item.itemName.includes('Interstellar')));

        if (hasInterstellarItem) return 0;
        return subtotal >= MIN_TOTAL_VALUE_FOR_FREE_DELIVERY ? 0 : state.deliveryFee;
    },

    calculateTotalPrice: async () => {
        const state = get();
        const user = await User.getCurrentUser();
        const cart = await Cart.getCart(user?.uid || '');
        if (!cart) return 0;

        const subtotal = calculateSubtotal(cart);
        const deliveryFee = await get().calculateDeliveryFee(subtotal);

        return subtotal + deliveryFee;
    },

    validateForm: () => {
        const state = get();
        if (!state.name || !state.email || !state.phone || !state.address ||
            !state.city || !state.province || !state.postalCode) {
            alert('Please fill all fields');
            return false;
        }

        // Fix: Simplify postal code validation to allow 6 numeric digits
        const postalCodeRegex = /^[0-9]{6}$/;
        if (!postalCodeRegex.test(state.postalCode)) {
            alert('Please enter a valid 6-digit postal code.'); // Updated message for clarity
            return false;
        }

        return true;
    },

    createOrder: async (paymentId: string) => {
        const state = get();
        set({ isCreatingOrder: true });

        try {
            const currentUser = await User.getCurrentUserWithRedirect();
            if (!currentUser) return;

            const cart = await Cart.getCart(currentUser.uid);
            if (!cart) return;

            // Update stock
            await new Product().bulkUpdateProductsStock(
                cart.items.map(item => ({
                    productId: item.itemId,
                    size: item.size,
                    quantity: item.quantity
                }))
            );

            // Prepare order items
            const items = await Promise.all(
                cart.items.map(async (item) => {
                    const product = await new Product().getProduct(item.itemId);
                    if (!product) return null;

                    return {
                        itemId: item.itemId,
                        itemName: product.name,
                        itemPrice: getSaleOrNonSalePrice(product),
                        quantity: item.quantity,
                        size: item.size,
                        image: product.featuredImage || '', // FIX: Ensure featuredImage is a string, default to empty
                        productSlug: item.productSlug,
                        categorySlug: item.categorySlug
                    };
                })
            );

            const orderData = {
                items: items.filter(item => item !== null) as TItemEntry[],
                paymentId,
                paymentStatus: 'success' as 'success' | 'failed',   
                status: 'active' as 'active', // FIX: Explicitly cast to literal type 'active'
                uid: currentUser.uid,
                orderTrackingCode: '',
                deliveryDetails: {
                    name: state.name,
                    email: state.email,
                    phone: state.phone,
                    address: state.address,
                    city: state.city,
                    state: state.province,
                    postalCode: state.postalCode,
                },
                createTimestamp: Date.now(),
                deliveryFee: await get().calculateDeliveryFee(calculateSubtotal(cart)),
            };

            console.log("Order data being sent to Firestore:", orderData);

            // Create order
            await Orders.createOrder(orderData);

            // Clear cart
            await Cart.clearCart(currentUser.uid);

            // Reset form
            get().resetForm();

            // Redirect to orders page
            if (typeof window !== 'undefined') {
                window.location.href = '/orders';
            }

        } catch (error) {
            console.error('Error creating order:', error);
            alert('There was an error creating your order. Please try again.');
        } finally {
            set({ isCreatingOrder: false });
        }
    },
}));
