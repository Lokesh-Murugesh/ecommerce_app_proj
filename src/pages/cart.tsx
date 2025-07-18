import { useEffect } from 'react';
import Nav from '@/components/shared/Nav';
import Footer from '@/components/shared/Footer';
import { useCartStore } from '@/utils/cartStore';
import PageLoader from '@/components/shared/PageLoader';
import Summary from '@/components/cart/Summary';
import CartItems from '@/components/cart/CartItems';

export default function CartPage() {
    const { cart, allProducts, latestTotalPrice, blockCheckout, user, fetchCart, handleQuantityChange, handleRemoveItem } = useCartStore();

    useEffect(() => {
        fetchCart();
    }, []);

    if (!user || !cart) return <PageLoader />;

    return (
        <div className="bg-black">
            <Nav />
            <main className="mx-auto max-w-2xl px-4 pb-24 pt-16 sm:px-6 lg:max-w-7xl lg:px-8">
                <div className="flex flex-col w-full gap-4 items-center justify-between md:flex-row">
                    <h1 className="text-4xl font-bold tracking-tight text-pink-600">Your Cart</h1>
                </div>

                <div className="mt-12 lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-12 xl:gap-x-16 px-4 rounded-lg border-4 border-outlaw-blue shadow-dark ">
                    <CartItems cart={cart} allProducts={allProducts} handleQuantityChange={handleQuantityChange} handleRemoveItem={handleRemoveItem} />
                    <Summary/>
                </div>
            </main>
            <Footer />
        </div>
    );
}
