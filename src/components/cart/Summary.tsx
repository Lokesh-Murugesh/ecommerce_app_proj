import { useCartStore } from '@/utils/cartStore'
import { MIN_TOTAL_VALUE_FOR_FREE_DELIVERY, calculateSubtotal } from '@/utils/checkout'
import React from 'react'


export default function Summary() {
    const { cart, blockCheckout, latestTotalPrice } = useCartStore()
    return (
        <section
            aria-labelledby="summary-heading"
            className="my-8 rounded-lg bg-outlaw-blue px-4 py-6 sm:p-6 lg:col-span-5 lg:mt-4 lg:p-8 border-black border-4 shadow-dark shadow-black"
        >
            <h2 id="summary-heading" className="text-xl font-bold text-foreground">
                Order summary
            </h2>

            <dl className="mt-6 space-y-4">
                <div className="flex items-center justify-between">
                    <dt className="text-md font-mono font-semibold text-foreground">Subtotal</dt>
                    <dd className="text-md font-mono font-semibold text-foreground">EUR {latestTotalPrice}</dd>
                </div>
                <div>
                    {cart?.items.some((item: any) => item.itemName.includes("Interstellar")) ? (
                        <div>
                            <span className="text-sm font-bold text-green-100">
                                This little maneuver didnt cost you 51 years but gets you free delivery 🚀
                            </span>
                            <div className="flex items-center justify-between border-t border-black pt-4">
                                <dt className="flex text-md font-mono text-foreground">
                                    <span>Delivery</span>
                                </dt>
                                <dd className="text-md font-mono font-semibold text-foreground">Free!!</dd>
                            </div>
                        </div>
                    ) : calculateSubtotal(cart) < MIN_TOTAL_VALUE_FOR_FREE_DELIVERY && (
                        <span className="text-sm text-red-100">
                            Add items worth €{MIN_TOTAL_VALUE_FOR_FREE_DELIVERY - calculateSubtotal(cart)} more for a mystery discount
                        </span>
                    )}
                </div>
                <div className="flex items-center justify-between border-t border-black pt-4">
                    <dt className="flex text-md font-mono text-foreground">
                        <span>Tax estimate</span>
                    </dt>
                    <dd className="text-md font-mono font-semibold text-foreground">Included</dd>
                </div>
                <div className="flex items-center justify-between border-t border-black pt-4">
                    <dt className="text-lg font-mono font-bold text-foreground">Order total</dt>
                    <dd className="text-lg font-mono font-bold text-foreground">EUR {latestTotalPrice}</dd>
                </div>
            </dl>

            <div className="mt-6">
                <button
                    type="submit"
                    disabled={blockCheckout || cart?.items.length === 0}
                    onClick={() => {
                        if (typeof window != "undefined") {
                            window.location.href = "/checkout"
                        }
                    }}
                    className={`w-full block ${blockCheckout || cart?.items.length === 0 ? "opacity-80 cursor-not-allowed" : ""} px-4 py-3 text-base font-medium text-center rounded-md border-2 border-black bg-white text-black shadow-dark shadow-black hover:translate-x-1 hover:translate-y-1 hover:shadow-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-50`}
                >
                    {
                        blockCheckout ? "Validating Cart..." : cart?.items.length === 0 ? "Cart is Empty" : "Checkout"
                    }
                </button>
            </div>
        </section>
    )
}