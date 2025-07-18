import React, { useState, useEffect } from 'react';
import { useCheckoutStore } from '@/utils/checkoutStore';
import { useCartStore } from '@/utils/cartStore'; // To ensure cart data is fetched
import PageLoader from '@/components/shared/PageLoader';
import Nav from '@/components/shared/Nav';
import Footer from '@/components/shared/Footer';
import Link from 'next/link';

export default function DummyPaymentFormPage() {
    const {
        name, email, phone, address, city, province, postalCode,
        isCreatingOrder, createOrder, validateForm, calculateTotalPrice
    } = useCheckoutStore();
    const { cart, fetchCart } = useCartStore(); // Ensure cart is fetched for total price

    const [cardNumber, setCardNumber] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [cvc, setCvc] = useState('');
    const [cardholderName, setCardholderName] = useState('');
    const [totalPrice, setTotalPrice] = useState<number | null>(null);

    useEffect(() => {
        fetchCart(); // Fetch cart to ensure all necessary data is available
    }, [fetchCart]);

    useEffect(() => {
        const calculateAndSetPrice = async () => {
            const price = await calculateTotalPrice();
            setTotalPrice(price);
        };
        if (cart) { // Only calculate if cart data is available
            calculateAndSetPrice();
        }
    }, [cart, calculateTotalPrice]);


    const handleSubmitPayment = async (e: React.FormEvent) => {
        e.preventDefault();

        // Basic client-side validation for dummy form
        if (!cardNumber || !expiryDate || !cvc || !cardholderName) {
            alert('Please fill in all card details.');
            return;
        }

        if (isCreatingOrder) return; // Prevent double submission

        // You might want to add more specific regex validation here
        // for card number, expiry, CVC if needed for a "more realistic" dummy.

        // Simulate payment success after a short delay
        console.log("Simulating payment processing...");
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate 1.5 second processing

        try {
            // Trigger the actual order creation with a dummy payment ID
            await createOrder('pay_dummyPaymentFormSuccess');
            // Redirection to /orders is handled inside createOrder function
        } catch (error) {
            console.error("Error during dummy payment and order creation:", error);
            alert("Failed to process payment and create order. Please try again.");
        }
    };

    if (isCreatingOrder || !cart || totalPrice === null) return <PageLoader />;

    return (
        <div className="min-h-screen bg-slate-600 max-h-fit pb-8 text-black">
            <Nav />
            <header className="relative mx-8 max-w-7xl py-6 lg:py-6">
                <div className="flex max-w-2xl px-4">
                    <Link href="#" className="inline-block bg-transparent">
                        <span className="sr-only">Company Name</span>
                        <img className="h-16" src="/logo.png" alt="Logo" />
                    </Link>
                </div>
            </header>

            <main className="relative mx-auto max-w-2xl px-4 lg:px-8">
                <div className="bg-white border-2 border-black p-8 rounded-lg shadow-dark shadow-black">
                    <h2 className="text-2xl font-bold mb-8">Payment Information</h2>
                    <h3 className="text-xl font-semibold mb-4">Total Amount: EUR {totalPrice?.toLocaleString()}</h3>

                    <form onSubmit={handleSubmitPayment} className="space-y-6">
                        <div>
                            <label htmlFor="cardNumber" className="block text-sm font-bold mb-2">Card Number</label>
                            <input
                                type="text"
                                id="cardNumber"
                                value={cardNumber}
                                onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16))} // Only digits, max 16
                                className="w-full border-2 border-black p-3 rounded bg-slate-300 focus:outline-none focus:ring-2 focus:ring-black"
                                placeholder="XXXX XXXX XXXX XXXX"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="expiryDate" className="block text-sm font-bold mb-2">Expiry Date (MM/YY)</label>
                                <input
                                    type="text"
                                    id="expiryDate"
                                    value={expiryDate}
                                    onChange={(e) => setExpiryDate(e.target.value.replace(/\D/g, '').slice(0, 4))} // Only digits, max 4
                                    className="w-full border-2 border-black p-3 rounded bg-slate-300 focus:outline-none focus:ring-2 focus:ring-black"
                                    placeholder="MMYY"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="cvc" className="block text-sm font-bold mb-2">CVC</label>
                                <input
                                    type="text"
                                    id="cvc"
                                    value={cvc}
                                    onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, 4))} // Only digits, max 4
                                    className="w-full border-2 border-black p-3 rounded bg-slate-300 focus:outline-none focus:ring-2 focus:ring-black"
                                    placeholder="XXX"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="cardholderName" className="block text-sm font-bold mb-2">Cardholder Name</label>
                            <input
                                type="text"
                                id="cardholderName"
                                value={cardholderName}
                                onChange={(e) => setCardholderName(e.target.value)}
                                className="w-full border-2 border-black p-3 rounded bg-slate-300 focus:outline-none focus:ring-2 focus:ring-black"
                                placeholder="Name on card"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className={`w-full block ${isCreatingOrder ? "opacity-80 cursor-not-allowed" : ""} px-4 py-3 text-base font-medium text-center rounded-md border-2 border-black bg-white text-black shadow-dark shadow-black hover:translate-x-1 hover:translate-y-1 hover:shadow-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-50`}
                            disabled={isCreatingOrder}
                        >
                            {isCreatingOrder ? "Processing Payment..." : "Submit Payment"}
                        </button>
                    </form>
                </div>
            </main>
            <Footer />
        </div>
    );
} 