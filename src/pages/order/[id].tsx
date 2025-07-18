import PageLoader from "@/components/shared/PageLoader"
import { TOrder, TStatus } from "@/db/orders"
// import firestore from "@/firebase/firestore" // No longer needed for SSR fetching
import { DocumentReference, doc } from "firebase/firestore" // Keep doc for type if needed, but not directly used for fetching here
import Link from "next/link"
import { useRouter } from "next/router"
// import { useDocumentData } from "react-firebase-hooks/firestore" // No longer needed for SSR fetching
import Nav from '@/components/shared/Nav'
import Footer from '@/components/shared/Footer'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { CircleCheck, XCircle, Package, Truck, Replace, Clock, MapPin, Download, ChevronRight } from 'lucide-react';
import { GetServerSideProps, GetServerSidePropsContext } from 'next'; // Import GetServerSideProps
import { adminFirestore } from '@/firebase/admin'; // Import adminFirestore

// Helper function to get status icon and color (copy from orders.tsx)
const getStatusDisplay = (status: TStatus) => {
    switch (status) {
        case 'active':
            return { icon: <Clock className="h-5 w-5 text-yellow-500" />, text: 'Pending', color: 'text-yellow-400' };
        case 'packed':
            return { icon: <Package className="h-5 w-5 text-blue-500" />, text: 'Packed', color: 'text-blue-400' };
        case 'shipped':
            return { icon: <Truck className="h-5 w-5 text-indigo-500" />, text: 'Shipped', color: 'text-indigo-400' };
        case 'dispatched':
            return { icon: <MapPin className="h-5 w-5 text-purple-500" />, text: 'Dispatched', color: 'text-purple-400' };
        case 'delivered':
            return { icon: <CircleCheck className="h-5 w-5 text-green-500" />, text: 'Delivered', color: 'text-green-400' };
        case 'cancelled':
            return { icon: <XCircle className="h-5 w-5 text-red-500" />, text: 'Cancelled', color: 'text-red-400' };
        case 'refunded':
            return { icon: <Replace className="h-5 w-5 text-gray-500" />, text: 'Refunded', color: 'text-gray-400' };
        case 'replaced':
            return { icon: <Replace className="h-5 w-5 text-orange-500" />, text: 'Replaced', color: 'text-orange-400' };
        default:
            return { icon: <Clock className="h-5 w-5 text-gray-500" />, text: status, color: 'text-gray-400' };
    }
};

function getNumberOfItems(order: TOrder): number {
    return order.items.reduce((acc, item) => acc + item.quantity, 0)
}

function getTotalOrderValue(order: TOrder): number {
    return order.items.reduce((acc, item) => acc + item.itemPrice * item.quantity, 0) + order.deliveryFee
}

// Define props for the OrderPage component
interface OrderPageProps {
    order: TOrder | null;
    formattedCreateDate: string; // Add a prop for the pre-formatted date
}

export const getServerSideProps: GetServerSideProps<OrderPageProps> = async (context: GetServerSidePropsContext) => {
    const { id } = context.params as { id: string };

    if (!id) {
        return { props: { order: null, formattedCreateDate: '' } }; // Default empty string
    }

    try {
        const orderDocRef = adminFirestore.collection('orders').doc(id);
        const orderDocSnap = await orderDocRef.get();

        if (!orderDocSnap.exists) {
            return { props: { order: null, formattedCreateDate: '' } };
        }

        const orderData = {
            id: orderDocSnap.id,
            ...(orderDocSnap.data() as Omit<TOrder, 'id'>),
        };

        // FIX: Format the date string on the server side
        const formattedDate = new Date(orderData.createTimestamp).toLocaleDateString('en-US'); // Use a consistent locale, e.g., 'en-US'

        return {
            props: {
                order: JSON.parse(JSON.stringify(orderData)),
                formattedCreateDate: formattedDate, // Pass the formatted date
            },
        };
    } catch (error) {
        console.error("Error fetching order in getServerSideProps:", error);
        return { props: { order: null, formattedCreateDate: '' } };
    }
};


export default function OrderPage({ order, formattedCreateDate }: OrderPageProps) { // Receive formattedCreateDate
    // No need for useRouter or useDocumentData here anymore
    // const { id } = useRouter().query
    // const [order, loading, error] = useDocumentData(doc(firestore, "orders", id as string) as DocumentReference<TOrder>)

    // Handle case where order is null (e.g., not found)
    if (!order) {
        return <PageLoader />; // Or a custom "Order not found" component
    }

    const { icon, text, color } = getStatusDisplay(order.status);

    // Function to handle invoice download (triggers browser print dialog)
    const handleDownloadInvoice = () => {
        window.print();
    };
    
    return (
        <div className="bg-gradient-to-br from-black to-zinc-900 min-h-screen text-pink-50">
            <Nav />
            <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:pb-24">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="max-w-3xl mx-auto"
                >
                    {/* Order Status and Header */}
                    <div className="bg-zinc-800 rounded-xl shadow-lg p-6 mb-8 border border-zinc-700">
                        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-pink-400 flex items-center gap-2">
                            Order #{order.id ? order.id.substring(0, 8) : 'N/A'} <span className="text-zinc-400 text-sm font-normal">(Confirmed)</span>
                        </h1>
                        <p className="mt-2 text-md text-zinc-300">
                            {/* FIX: Use the pre-formatted date prop directly */}
                            Placed on <time dateTime={new Date(order.createTimestamp).toISOString()}>{formattedCreateDate}</time>
                        </p>
                        <div className="mt-4 flex items-center gap-2">
                            {icon}
                            <span className={`text-lg font-semibold ${color}`}>{text}</span>
                        </div>
                        <p className="mt-4 text-2xl font-extrabold text-pink-100">
                            Total: €{getTotalOrderValue(order).toLocaleString()}
                        </p>
                    </div>

                    {/* Order Details Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Order Items */}
                        <div className="bg-zinc-800 rounded-xl shadow-lg p-6 border border-zinc-700">
                            <h2 className="text-xl font-bold text-pink-200 mb-6">Items in your order ({getNumberOfItems(order)})</h2>
                            <ul role="list" className="space-y-6 divide-y divide-zinc-700">
                                {order.items.map((item) => (
                                    <li key={item.itemId} className="flex py-4 first:pt-0">
                                        <div className="flex-shrink-0 relative w-24 h-24 rounded-md overflow-hidden border border-zinc-600">
                                            <Image
                                                src={item.image}
                                                alt={item.itemName}
                                                fill
                                                className="object-cover"
                                                sizes="96px"
                                            />
                                        </div>
                                        <div className="ml-4 flex flex-1 flex-col justify-between">
                                            <div>
                                                <h3 className="text-lg font-medium text-pink-100">
                                                    <Link href={`/${item.categorySlug}/${item.productSlug}`} className="hover:text-pink-300">
                                                        {item.itemName}
                                                    </Link>
                                                </h3>
                                                <p className="mt-1 text-sm text-zinc-400">Size: {item.size} | Qty: {item.quantity}</p>
                                            </div>
                                            <div className="flex items-end justify-between mt-2">
                                                <p className="text-md font-semibold text-pink-100">€{item.itemPrice.toLocaleString()}</p>
                                                <p className="text-sm text-zinc-400">Qty: {item.quantity}</p>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Delivery Details & Tracking */}
                        <div className="space-y-8">
                            <div className="bg-zinc-800 rounded-xl shadow-lg p-6 border border-zinc-700">
                                <h2 className="text-xl font-bold text-pink-200 mb-6">Delivery Details</h2>
                                <address className="not-italic text-zinc-300 space-y-1">
                                    <p className="font-medium text-pink-100">{order.deliveryDetails.name}</p>
                                    <p>{order.deliveryDetails.address}</p>
                                    <p>{order.deliveryDetails.city}, {order.deliveryDetails.state}</p>
                                    <p>Postal Code: {order.deliveryDetails.postalCode}</p>
                                    <p>Phone: {order.deliveryDetails.phone}</p>
                                    <p>Email: {order.deliveryDetails.email}</p>
                                </address>
                            </div>

                            <div className="bg-zinc-800 rounded-xl shadow-lg p-6 border border-zinc-700">
                                <h2 className="text-xl font-bold text-pink-200 mb-6">Tracking Information</h2>
                                <p className="text-md text-zinc-300">
                                    {order.orderTrackingCode !== "" ? (
                                        <>
                                            Tracking Code: <span className="font-semibold text-pink-100">{order.orderTrackingCode}</span>
                                        </>
                                    ) : (
                                        "Tracking code will be updated once shipped."
                                    )}
                                </p>
                                {order.orderTrackingCode !== "" && (
                                    <Link
                                        href={`https://www.delhivery.com/track-v2/package/${order.orderTrackingCode}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mt-4 inline-flex items-center text-sm font-medium text-pink-400 hover:text-pink-300 transition-colors"
                                    >
                                        Track your order on Delhivery <ChevronRight className="ml-1 h-4 w-4" />
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Summary & Download Button */}
                    <div className="mt-8 bg-zinc-800 rounded-xl shadow-lg p-6 border border-zinc-700 max-w-3xl mx-auto">
                        <h2 className="text-xl font-bold text-pink-200 mb-6">Order Summary</h2>
                        <dl className="space-y-4 text-sm">
                            <div className="flex justify-between">
                                <dt className="text-zinc-300">Subtotal</dt>
                                <dd className="font-medium text-pink-100">€{(getTotalOrderValue(order) - order.deliveryFee).toLocaleString()}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-zinc-300">Delivery Fee</dt>
                                <dd className="font-medium text-pink-100">€{order.deliveryFee.toLocaleString()}</dd>
                            </div>
                            <div className="flex justify-between border-t border-zinc-700 pt-4 text-lg font-bold">
                                <dt className="text-pink-200">Total</dt>
                                <dd className="text-pink-100">€{getTotalOrderValue(order).toLocaleString()}</dd>
                            </div>
                        </dl>
                        <button
                            onClick={handleDownloadInvoice}
                            className="mt-8 w-full inline-flex items-center justify-center rounded-md border border-pink-500 bg-pink-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
                        >
                            <Download className="h-5 w-5 mr-2" /> Download Invoice as PDF
                        </button>
                    </div>
                </motion.div>
            </main>
            <Footer />
        </div>
    )
}