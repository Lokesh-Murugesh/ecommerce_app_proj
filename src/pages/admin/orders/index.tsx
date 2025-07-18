import React, { useEffect, useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    SortingState,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Orders, TOrder, TStatus } from "@/db/orders";
import { useCollection } from "react-firebase-hooks/firestore";
import SlideOver from "@/components/shared/SlideOver";
import TextField from "@/components/forms/TextField";
import Link from "next/link";
import generateInvoice from "@/components/backrooms/PDF";
import { DataTablePagination } from "@/components/shared/Pagination";
import { Select, SelectItem, SelectValue, SelectContent, SelectTrigger } from "@/components/ui/select";
import withAdminAuth from "@/components/withAdminAuth";
import AppShell from "@/components/shared/AppShell";
import { collection } from "firebase/firestore";
import firestore from "@/firebase/firestore"; // FIX: Import firestore instance


const OrdersMod = () => {
    const [orders, setOrders] = useState<(TOrder & { id: string })[]>([]);
    const [displayedOrders, setDisplayedOrders] = useState<(TOrder & { id: string })[]>([]);
    const [currentTab, setCurrentTab] = useState<TStatus>("active");
    const [status, setStatus] = useState<TStatus>("active");
    const [orderTrackingCode, setOrderTrackingCode] = useState<string>("");
    const [editLoading, setEditLoading] = useState(false);

    const [isMobile, setIsMobile] = useState(false);

    const [showEditingSlideOver, setShowEditingSlideOver] = useState(false)
    const [currentlyEditingOrder, setCurrentlyEditingOrder] = useState<string>("")

    // FIX: Use collection(firestore, "orders") instead of Orders.firestore
    const [snapshot, loading, error] = useCollection(collection(firestore, "orders"));

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        checkMobile();

        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const populateEditFields = (id: string) => {
        const order = orders.find(p => p.id === id)
        if (!order) return
        setStatus(order.status)
        setOrderTrackingCode(order.orderTrackingCode)
    }

    const clearFields = () => {
        setOrderTrackingCode("")
    }

    const handleUpdateOrderTracking = async () => {
        setEditLoading(true)
        await Orders.updateOrderTracking(currentlyEditingOrder, orderTrackingCode)
        const res = await Orders.updateOrderStatus(currentlyEditingOrder, status)
        console.log("res", res)
        setEditLoading(false)
        setShowEditingSlideOver(false)
        clearFields()
    }

    const [sorting, setSorting] = React.useState<SortingState>([])

    const columns: ColumnDef<TOrder & { id: string }>[] = [
        {
            // FIX: Added unique 'id' for this column
            id: "createdOrderOn",
            accessorFn: (row: any) => new Date(row.createTimestamp).toLocaleDateString(),
            header: ({ column }) => (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Created Order on
                </Button>
            ),
            cell: ({ row }) => <span className="text-black">{new Date(row.original.createTimestamp).toLocaleDateString()}</span>,
            sortDescFirst: true,
        },
        {
            accessorKey: "status",
            // FIX: Added unique 'id' for this column
            id: "status",
            header: ({ column }) => (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Status
                </Button>
            ),
            cell: ({ row }) => <span className="text-black">{row.original.status}</span>,
        },
        {
            id: "address",
            header: "Address",
            cell: ({ row }) => (
                <div className="max-w-[200px] break-words text-black">
                    {row.original.deliveryDetails.address}
                    <br />
                    {row.original.deliveryDetails.city}, {row.original.deliveryDetails.state}
                    <br />
                    Zip: {row.original.deliveryDetails.postalCode}
                </div>
            ),
        },
        {
            id: "contact",
            header: "Contact",
            cell: ({ row }) => (
                <div className="max-w-[200px] break-words text-black">
                    {row.original.deliveryDetails.name}
                    <br />
                    {row.original.deliveryDetails.phone}
                    <br />
                    {row.original.deliveryDetails.email}
                </div>
            ),
        },
        {
            id: "products",
            header: "Products",
            cell: ({ row }) => (
                <div className="min-w-[200px] text-black">
                    {row.original.items.map((item: any, index: any) => (
                        <Link
                            key={index}
                            className="flex items-center mb-1 gap-2 text-blue-600 hover:underline"
                            href={`/${item.categorySlug}/${item.productSlug}`}
                        >
                            <span className="truncate">{item.itemName}</span>
                            <span>{item.size}</span>
                            <span className="whitespace-nowrap">x{item.quantity}</span>
                        </Link>
                    ))}
                </div>
            ),
        },
        {
            id: "checkoutValue",
            accessorFn: (row: any) => {
                return (
                    row.items.reduce((acc: any, item: any) => acc + item.itemPrice * item.quantity, 0)
                )
            },
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Final Value
                    </Button>
                )
            },
            cell: ({ row }) =>
                <div className="text-center text-black">
                    €{row.original.items.reduce((acc: any, item: any) => acc + item.itemPrice * item.quantity, 0).toLocaleString()}
                </div>

        },
        {
            id: "payment",
            header: "Payment Id",
            cell: ({ row }) => (
                <div className="whitespace-nowrap text-black">
                    {row.original.paymentId}
                    <br />
                    {row.original.paymentStatus}
                </div>
            ),
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => {

                return (
                    <div className="flex flex-col space-y-2">
                        {row.original.status === 'active' && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="text-green-600 border-green-600 hover:bg-green-50"
                                onClick={async () => {
                                    await Orders.completeOrder(row.original.id)
                                }}
                            >
                                Complete Order
                            </Button>
                        )}
                        <Button
                            variant="outline"
                            size="sm"
                            className="text-blue-600 border-blue-600 hover:bg-blue-50"
                            onClick={async () => {
                                setShowEditingSlideOver(true)
                                setCurrentlyEditingOrder(row.original.id)
                                populateEditFields(row.original.id)
                            }}
                        >
                            Update Order
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="text-purple-600 border-purple-600 hover:bg-purple-50"
                            onClick={() => generateInvoice(row.original)}
                        >
                            Download Invoice
                        </Button>
                    </div>
                )

            }
        },
    ];

    const table = useReactTable({
        data: displayedOrders,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        state: {
            sorting,
        }
    });

    useEffect(() => {
        if (snapshot) {
            setOrders(snapshot.docs.map((doc: any) => ({ ...(doc.data() as TOrder), id: doc.id })));
        }
    }, [snapshot]);

    useEffect(() => {
        setDisplayedOrders(
            Orders.sortOrdersByRecency(
                Orders.filterOrderByStatus(orders, currentTab)
            )
        );
    }, [currentTab, orders]);

    const handleSelect = (value: any) => {
        setCurrentTab(value)
    }

    const handleStatusSelect = (value: any) => {
        setStatus(value)
    }

    return (
        <AppShell active="Orders">
            <div className="space-y-4 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-black">Orders</h1>
                    {isMobile ? (
                        <Select onValueChange={handleSelect}>
                            <SelectTrigger className="w-32 text-black border-gray-300">
                                <SelectValue placeholder="Status" className="text-black"></SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="active" className="text-black"> Active </SelectItem>
                                <SelectItem value="packed" className="text-black"> Packed </SelectItem>
                                <SelectItem value="dispatched" className="text-black"> Dispatched </SelectItem>
                                <SelectItem value="shipped" className="text-black"> Shipped </SelectItem>
                                <SelectItem value="delivered" className="text-black"> Delivered </SelectItem>
                                <SelectItem value="cancelled" className="text-black"> Cancelled </SelectItem>
                            </SelectContent>
                        </Select>
                    ) : (
                        <Tabs value={currentTab} onValueChange={handleSelect} className="mb-4">
                            <TabsList className="bg-gray-100 border border-gray-300">
                                <TabsTrigger value="active" className="text-black data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700">Active</TabsTrigger>
                                <TabsTrigger value="packed" className="text-black data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700">Packed</TabsTrigger>
                                <TabsTrigger value="dispatched" className="text-black data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700">Dispatched</TabsTrigger>
                                <TabsTrigger value="shipped" className="text-black data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700">Shipped</TabsTrigger>
                                <TabsTrigger value="delivered" className="text-black data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700">Delivered</TabsTrigger>
                                <TabsTrigger value="cancelled" className="text-black data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700">Cancelled</TabsTrigger>
                            </TabsList>
                        </Tabs>
                    )}
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-60">
                        <p className="text-lg text-gray-600">Loading orders...</p>
                    </div>
                ) : error ? (
                    <div className="flex justify-center items-center h-60">
                        <p className="text-lg text-red-500">Error loading orders: {error.message}</p>
                    </div>
                ) : (
                    <div className="rounded-md border border-gray-200 shadow-sm bg-white">
                        <Table>
                            <TableHeader>
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <TableRow key={headerGroup.id}>
                                        {headerGroup.headers.map((header) => {
                                            return (
                                                <TableHead key={header.id} className="text-black">
                                                    {header.isPlaceholder
                                                        ? null
                                                        : flexRender(
                                                            header.column.columnDef.header,
                                                            header.getContext()
                                                        )}
                                                </TableHead>
                                            )
                                        })}
                                    </TableRow>
                                ))}
                            </TableHeader>
                            <TableBody>
                                {table.getRowModel().rows?.length ? (
                                    table.getRowModel().rows.map((row) => (
                                        <TableRow
                                            key={row.id}
                                            data-state={row.getIsSelected() && "selected"}
                                        >
                                            {row.getVisibleCells().map((cell) => (
                                                <TableCell key={cell.id} className="text-black">
                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={columns.length} className="h-24 text-center text-black">
                                            No results.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                )}
                <DataTablePagination table={table} />
            </div>

            <SlideOver
                onSubmit={handleUpdateOrderTracking}
                loading={editLoading}
                title={`Update Order ${currentlyEditingOrder}`}
                setOpen={setShowEditingSlideOver}
                open={showEditingSlideOver}
            >
                <div className="space-y-5">
                    <TextField
                        label="Order Tracking Code"
                        value={orderTrackingCode}
                        setValue={setOrderTrackingCode}
                        placeholder="Enter tracking code"
                    />
                    <Select value={status} onValueChange={handleStatusSelect}>
                        <SelectTrigger className="w-full text-black border-gray-300">
                            <SelectValue placeholder="Select Status" className="text-black"></SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="active" className="text-black">Active</SelectItem>
                            <SelectItem value="packed" className="text-black">Packed</SelectItem>
                            <SelectItem value="dispatched" className="text-black">Dispatched</SelectItem>
                            <SelectItem value="shipped" className="text-black">Shipped</SelectItem>
                            <SelectItem value="delivered" className="text-black">Delivered</SelectItem>
                            <SelectItem value="cancelled" className="text-black">Cancelled</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </SlideOver>
        </AppShell>
    );
}


export default withAdminAuth(OrdersMod)
