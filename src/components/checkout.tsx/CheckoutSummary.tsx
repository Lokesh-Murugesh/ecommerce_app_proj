import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useCartStore } from '@/utils/cartStore';
import { useCheckoutStore } from '@/utils/checkoutStore';
import { MIN_TOTAL_VALUE_FOR_FREE_DELIVERY } from '@/utils/checkout';
import { calculateSubtotal } from '@/utils/checkout';

export default function CheckoutSummary({ handlePayNowClick }: { handlePayNowClick: () => void }) {
    const { cart } = useCartStore();
    const {
        postalCode,
        deliveryFee,
        setFormField,
        calculateTotalPrice,
    } = useCheckoutStore();

    const { data: totalPrice = 0, isLoading } = useQuery({
        queryKey: ['totalPrice', cart],
        queryFn: calculateTotalPrice,
        staleTime: 1000 * 60, 
    });

    if (!cart) return null;

    const showDeliveryFee = calculateSubtotal(cart) < MIN_TOTAL_VALUE_FOR_FREE_DELIVERY &&
        !cart.items.some((item: any) => item.itemName.includes("Interstellar"));

    return (
        <section className="bg-foreground border-2 border-black p-8 rounded-lg shadow-dark shadow-black">
            <h2 className="text-2xl font-bold text-black mb-8">Order Summary</h2>

            <div className="space-y-6">
                {/* Product List */}
                <div className="space-y-4">
                    {cart.items.map((product: any) => (
                        <div key={`${product.itemId}-${product.size}`} className="flex gap-4 bg-white border-2 border-black p-4 rounded">
                            <img
                                src={product.image}
                                className="h-20 w-20 object-cover border-2 border-black rounded-md"
                                alt={product.itemName}
                            />
                            <div className="flex-1">
                                <h3 className="font-bold">{product.itemName}</h3>
                                <p className="text-sm">{product.size}</p>
                            </div>
                            <p className="font-bold">€{product.itemPrice}</p>
                        </div>
                    ))}
                </div>
                {/* Order Total */}
                <div className="space-y-4 border-t-2 border-black pt-4">
                    <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span className="font-bold">€{calculateSubtotal(cart)}</span>
                    </div>

                    <div className="flex justify-between">
                        <span>Shipping</span>
                        {showDeliveryFee ? (
                            <span className="font-bold">
                                {postalCode.length !== 6 ? "Please enter pincode" : `€${deliveryFee}`}
                            </span>
                        ) : (
                            <span className="font-bold">Free</span>
                        )}
                    </div>

                    <div className="flex justify-between text-lg font-bold">
                        <span>Total</span>
                        <span>
                            {isLoading
                                ? "Calculating..."
                                : postalCode.length === 6
                                    ? `Pay €${totalPrice}`
                                    : "Please enter pincode"}
                        </span>
                    </div>
                </div>

                {/* Pay Button */}
                <button
                    onClick={handlePayNowClick}
                    className="w-full border-2 border-black bg-outlaw-blue text-white p-4 rounded font-bold text-lg shadow-dark shadow-black hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
                >
                    {isLoading
                        ? "Processing..."
                        : postalCode.length === 6
                            ? `Pay €${totalPrice}`
                            : "Pay Now"}
                </button>
            </div>
        </section>
    );
}
