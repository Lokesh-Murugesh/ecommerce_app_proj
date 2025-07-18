import { useEffect, useState } from 'react';
import { Orders, TOrder, TStatus } from '@/db/orders'; // Import TStatus
import { User } from '@/db/user';
import Link from 'next/link';
import Nav from '@/components/shared/Nav';
import Footer from '@/components/shared/Footer';
import PageLoader from '@/components/shared/PageLoader';
import { motion } from 'framer-motion'; // For subtle animations
import { CircleCheck, XCircle, Package, Truck, Replace, Clock, MapPin } from 'lucide-react'; // Icons for status
import Image from 'next/image'; // Import Image component

function getNumberOfItems(order: TOrder) {
    return order.items.reduce((acc, item) => acc + item.quantity, 0);
}

// Helper function to get status icon and color
const getStatusDisplay = (status: TStatus) => {
    switch (status) {
        case 'active':
            return { icon: <Clock className="h-4 w-4 text-yellow-500" />, text: 'Pending', color: 'text-yellow-400' };
        case 'packed':
            return { icon: <Package className="h-4 w-4 text-blue-500" />, text: 'Packed', color: 'text-blue-400' };
        case 'shipped':
            return { icon: <Truck className="h-4 w-4 text-indigo-500" />, text: 'Shipped', color: 'text-indigo-400' };
        case 'dispatched':
            return { icon: <MapPin className="h-4 w-4 text-purple-500" />, text: 'Dispatched', color: 'text-purple-400' };
        case 'delivered':
            return { icon: <CircleCheck className="h-4 w-4 text-green-500" />, text: 'Delivered', color: 'text-green-400' };
        case 'cancelled':
            return { icon: <XCircle className="h-4 w-4 text-red-500" />, text: 'Cancelled', color: 'text-red-400' };
        case 'refunded':
            return { icon: <Replace className="h-4 w-4 text-gray-500" />, text: 'Refunded', color: 'text-gray-400' };
        case 'replaced':
            return { icon: <Replace className="h-4 w-4 text-orange-500" />, text: 'Replaced', color: 'text-orange-400' };
        default:
            return { icon: <Clock className="h-4 w-4 text-gray-500" />, text: status, color: 'text-gray-400' };
    }
};

export default function OrdersPage() {
    const [orders, setOrders] = useState<TOrder[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = async () => {
        const user = await User.getCurrentUser();
        if (user) {
            const userOrders = await Orders.getUserOrders(user.uid);
            setOrders(userOrders.sort((a, b) => b.createTimestamp - a.createTimestamp));
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleCancelOrder = async (orderId: string) => {
        if (window.confirm("Are you sure you want to cancel this order?")) {
            setLoading(true); // Show loader during cancellation
            try {
                await Orders.cancelOrder(orderId);
                alert("Order cancelled successfully!");
                fetchOrders(); // Re-fetch orders to update UI
            } catch (error) {
                console.error("Error cancelling order:", error);
                alert("Failed to cancel order. Please try again.");
            } finally {
                setLoading(false);
            }
        }
    };

    if (loading) return <PageLoader />;

    return (
        <div className="bg-gradient-to-br from-black to-zinc-900 min-h-screen text-pink-50">
            <Nav />
            <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:pb-24">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="max-w-xl mb-12"
                >
                    <h1 className="text-4xl font-extrabold tracking-tight text-pink-400 sm:text-5xl">Your Orders</h1>
                    <p className="mt-3 text-lg text-zinc-300">Track the status of your purchases and manage your history.</p>
                </motion.div>

                <section aria-labelledby="order-history-heading" className="mt-8">
                    <h2 id="order-history-heading" className="sr-only">Order History</h2>

                    {orders.length === 0 ? (
                        <div className="py-20 text-center">
                            <h2 className="text-2xl font-semibold text-zinc-400">No Orders Found</h2>
                            <p className="mt-2 text-zinc-500">Looks like you haven't placed any orders yet.</p>
                            <Link href="/" className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500">
                                Start Shopping
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-10">
                            {orders.map((order) => {
                                const { icon, text, color } = getStatusDisplay(order.status);
                                return (
                                    <motion.div
                                        key={order.id}
                                        initial={{ opacity: 0, y: 50 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5 }}
                                        className="bg-zinc-800 rounded-xl shadow-lg overflow-hidden border border-zinc-700"
                                    >
                                        {/* Order Header */}
                                        <div className="bg-zinc-700 px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                            <div className="flex-grow">
                                                <h3 className="text-lg font-semibold text-pink-200">Order #{order.id.substring(0, 8)}</h3>
                                                <p className="text-sm text-zinc-400">
                                                    Placed on <time dateTime={new Date(order.createTimestamp).toISOString()}>{new Date(order.createTimestamp).toLocaleDateString()}</time>
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-x-2">
                                                {icon}
                                                <span className={`text-sm font-medium ${color}`}>{text}</span>
                                                <p className="ml-4 text-lg font-bold text-pink-100">€{order.items.reduce((acc, item) => acc + item.itemPrice * item.quantity, 0) + order.deliveryFee}</p>
                                            </div>
                                        </div>

                                        {/* Order Items */}
                                        <div className="px-6 py-6 border-b border-zinc-700">
                                            <ul role="list" className="space-y-6">
                                                {order.items.map((item) => (
                                                    <li key={item.itemId} className="flex items-center space-x-4">
                                                        <div className="flex-shrink-0 relative w-20 h-20 rounded-md overflow-hidden border border-zinc-600">
                                                            <Image
                                                                src={item.image}
                                                                alt={item.itemName}
                                                                fill
                                                                className="object-cover"
                                                                sizes="80px"
                                                            />
                                                        </div>
                                                        <div className="flex-grow">
                                                            <Link href={`/${item.categorySlug}/${item.productSlug}`} className="text-lg font-medium text-pink-100 hover:text-pink-300">
                                                                {item.itemName}
                                                            </Link>
                                                            <p className="text-sm text-zinc-400">Size: {item.size} | Qty: {item.quantity}</p>
                                                            <p className="text-md font-semibold text-pink-100">€{item.itemPrice * item.quantity}</p>
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        {/* Order Actions */}
                                        <div className="px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                                            <Link
                                                href={`/order/${order.id}`}
                                                className="flex-1 w-full sm:w-auto items-center justify-center rounded-md border border-zinc-600 bg-zinc-700 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-zinc-600 transition-colors"
                                            >
                                                View Order Details
                                            </Link>
                                            {order.status === 'active' && ( // Only show cancel for active orders
                                                <button
                                                    onClick={() => handleCancelOrder(order.id)}
                                                    className="flex-1 w-full sm:w-auto items-center justify-center rounded-md border border-red-500 bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 transition-colors"
                                                >
                                                    Cancel Order
                                                </button>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </section>
            </main>
            <Footer />
        </div>
    );
}