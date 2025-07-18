import { useEffect } from 'react';
import { useCartStore } from '@/utils/cartStore';
import { useCheckoutStore } from '@/utils/checkoutStore';
// import { usePayment } from '@/utils/Payment'; // No longer needed directly here
import PageLoader from '@/components/shared/PageLoader';
import CheckoutForm from '@/components/checkout.tsx/CheckoutForm';
import CheckoutSummary from '@/components/checkout.tsx/CheckoutSummary';
import Link from 'next/link';
import { COMPANY_NAME } from '@/utils/constants';
import { useRouter } from 'next/router'; // Import useRouter

export default function CheckoutPage() {
    // const payment = usePayment('razorpay'); // No longer needed
    const { cart, fetchCart } = useCartStore();
    const {
        name, email, phone, address, city, province, postalCode, deliveryFee, isCreatingOrder,
        setFormField, calculateTotalPrice, createOrder, validateForm
    } = useCheckoutStore();

    const router = useRouter(); // Initialize useRouter

    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    const handlePayNowClick = async () => {
        if (!validateForm()) return;

        // Redirect to the dummy payment form page
        router.push('/dummy-payment-form');

        // Original payment logic (commented out)
        /*
        const totalPrice = calculateTotalPrice();
        payment.pay(
            Math.floor(await totalPrice * 100),
            {
                name: COMPANY_NAME,
                onPaid(response) {
                    createOrder(response.razorpay_payment_id);
                },
                description: `Checkout products for EUR ${totalPrice}`
            },
            {
                name,
                email
            }
        );
        */
    };

    if (!cart || isCreatingOrder) return <PageLoader />;

    return (
        <div className="min-h-screen bg-slate-600 max-h-fit pb-8">
            <header className="relative mx-8 max-w-7xl py-6 lg:py-6">
                <div className="flex max-w-2xl px-4">
                    <Link href="#" className="inline-block bg-transparent">
                        <span className="sr-only">{COMPANY_NAME}</span>
                        <img className="h-16" src="/logo.png" alt="Logo" />
                    </Link>
                </div>
            </header>

            <main className="relative mx-auto max-w-7xl grid grid-cols-1 gap-8 px-4 lg:grid-cols-2 lg:px-8 text-black">
                <CheckoutForm />

                <CheckoutSummary handlePayNowClick={handlePayNowClick} />
            </main>
        </div>
    );
}