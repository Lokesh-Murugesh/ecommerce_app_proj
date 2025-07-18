"use client"

import React, { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCollection } from "react-firebase-hooks/firestore"
import { Orders, TOrder } from "@/db/orders"
import { Product, TProduct } from "@/db/products"
import { Categories, Category } from "@/db/drops" // Changed import from Drops, Drop to Categories, Category
import { Bar, BarChart, Line, LineChart, Pie, PieChart, Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import AppShell from "@/components/shared/AppShell"
import { collection } from "firebase/firestore"; // Import collection
import firestore from "@/firebase/firestore"; // Import firestore
// Import GetServerSideProps for server-side data fetching
import { GetServerSideProps } from "next";
// Import adminFirestore ONLY for getServerSideProps
import { adminFirestore } from "@/firebase/admin";


interface AnalyticsData {
  productSales: any[]
  sizeSales: any[]
  categorySales: any[] // Changed dropSales to categorySales
  timeSeriesData: any[]
  sizePerformance: any[]
  productComparison: any[]
  categoryPerformance: any[] // Changed dropPerformance to categoryPerformance
  returnStats: any[]
  refundStats: any[]
}

// Define the props interface for the component
interface SalesAnalyticsDashboardProps {
  initialProducts: TProduct[];
  initialCategories: Category[];
}

export default function SalesAnalyticsDashboard({ initialProducts, initialCategories }: SalesAnalyticsDashboardProps) {
  const [orders, setOrders] = useState<TOrder[]>([])
  const [snapshot] = useCollection(collection(firestore, "orders")) // Fixed: Use collection(firestore, "orders")
  const [products, setProducts] = useState<TProduct[]>(initialProducts) // Initialize with server-fetched data
  const [categories, setCategories] = useState<Category[]>(initialCategories) // Initialize with server-fetched data

  const [selectedCategory, setSelectedCategory] = useState<string>("all") // Changed selectedDrop to selectedCategory
  const [selectedProduct, setSelectedProduct] = useState<string>("all")
  const [selectedProductForSize, setSelectedProductForSize] = useState<string>("all")
  const [selectedProductForReturns, setSelectedProductForReturns] = useState<string>("all")
  const [timeRange, setTimeRange] = useState<string>("90d")
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    productSales: [],
    sizeSales: [],
    categorySales: [], // Changed dropSales to categorySales
    timeSeriesData: [],
    sizePerformance: [],
    productComparison: [],
    categoryPerformance: [], // Changed dropPerformance to categoryPerformance
    returnStats: [],
    refundStats: []
  })

  useEffect(() => {
    if (!snapshot) return
    const allOrders = snapshot.docs.map((doc) => ({ ...(doc.data() as TOrder), id: doc.id }))
    setOrders(allOrders)
  }, [snapshot])

  // Remove the useEffect that fetches products and categories on the client-side
  // useEffect(() => {
  //   const fetchData = async () => {
  //     const productsSnapshot = await adminFirestore.collection('products').get();
  //     const fetchedProducts = productsSnapshot.docs.map((doc) => ({
  //       ...(doc.data() as TProduct),
  //       id: doc.id,
  //     }));
  //     setProducts(fetchedProducts);
  //
  //     const categoriesSnapshot = await adminFirestore.collection('categories').get();
  //     const fetchedCategories = categoriesSnapshot.docs.map((doc) => ({
  //       ...(doc.data() as Category),
  //       slug: doc.id,
  //     }));
  //     setCategories(fetchedCategories);
  //
  //     processData()
  //   }
  //   fetchData()
  // }, [orders])

  useEffect(() => {
    processData()
  }, [selectedCategory, selectedProduct, selectedProductForSize, selectedProductForReturns, timeRange, orders, products, categories]) // Changed drops to categories

  const processData = () => {
    const timeSeriesMap = new Map<string, { date: string; sales: number; revenue: number }>()
    const sizePerformanceMap = new Map<string, { product: string; size: string; sales: number; revenue: number }>()
    const productComparisonMap = new Map<string, { name: string; sales: number; revenue: number; averagePrice: number; totalOrders: Set<string> }>()
    const categoryPerformanceMap = new Map<string, { name: string; sales: number; revenue: number; uniqueProducts: Set<string> }>() // Changed dropPerformanceMap to categoryPerformanceMap
    const returnsMap = new Map<string, { product: string; size: string; returns: number; refunds: number }>()

    const referenceDate = new Date()
    let daysToSubtract = 90
    if (timeRange === "30d") {
      daysToSubtract = 30
    } else if (timeRange === "7d") {
      daysToSubtract = 7
    }
    const startDate = new Date(referenceDate)
    startDate.setDate(startDate.getDate() - daysToSubtract)

    // Process orders for time series (day by day)
    orders.forEach((order) => {
      const orderDate = new Date(order.createTimestamp)
      if (orderDate < startDate) return

      const dayKey = orderDate.toLocaleDateString("en-US", {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })

      if (order.status === "cancelled" || order.status === "refunded") return

      order.items.forEach((item) => {
        const product = products.find((p) => p.name === item.itemName)
        if (!product) return

        // Time series data - no product/category filter for overview
        if (!timeSeriesMap.has(dayKey)) {
          timeSeriesMap.set(dayKey, { date: dayKey, sales: 0, revenue: 0 })
        }
        const timeData = timeSeriesMap.get(dayKey)!
        timeData.sales += item.quantity
        timeData.revenue += item.itemPrice * item.quantity

        // Size performance data - filter by selected product for size
        if (selectedProductForSize === "all" || item.itemName === selectedProductForSize) {
          const sizeKey = `${item.itemName}-${item.size}`
          if (!sizePerformanceMap.has(sizeKey)) {
            sizePerformanceMap.set(sizeKey, { product: item.itemName, size: item.size, sales: 0, revenue: 0 })
          }
          const sizeData = sizePerformanceMap.get(sizeKey)!
          sizeData.sales += item.quantity
          sizeData.revenue += item.itemPrice * item.quantity
        }

        // Product comparison data - filter by selected category
        if (selectedCategory === "all" || product.categories.includes(selectedCategory)) { // Changed selectedDrop to selectedCategory
          if (!productComparisonMap.has(item.itemName)) {
            productComparisonMap.set(item.itemName, { name: item.itemName, sales: 0, revenue: 0, averagePrice: 0, totalOrders: new Set() })
          }
          const productData = productComparisonMap.get(item.itemName)!
          productData.sales += item.quantity
          productData.revenue += item.itemPrice * item.quantity
          productData.totalOrders.add(order.id)
        }

        // Category performance data
        product.categories.forEach((categorySlug) => { // Renamed 'category' to 'categorySlug' to avoid conflict with Category type
          if (!categoryPerformanceMap.has(categorySlug)) { // Changed dropPerformanceMap to categoryPerformanceMap
            categoryPerformanceMap.set(categorySlug, { name: categories.find(c => c.slug === categorySlug)?.name || categorySlug, sales: 0, revenue: 0, uniqueProducts: new Set() }) // Changed dropPerformanceMap and added category name lookup
          }
          const categoryData = categoryPerformanceMap.get(categorySlug)! // Changed dropData to categoryData
          categoryData.sales += item.quantity
          categoryData.revenue += item.itemPrice * item.quantity
          categoryData.uniqueProducts.add(item.itemName)
        })
      })
    })

    // Process returns and refunds
    orders.forEach((order) => {
      if (order.status === "replaced" || order.status === "refunded") {
        order.items.forEach((item) => {
          if (selectedProductForReturns !== "all" && item.itemName !== selectedProductForReturns) return

          const sizeKey = `${item.itemName}-${item.size}`
          if (!returnsMap.has(sizeKey)) {
            returnsMap.set(sizeKey, {
              product: item.itemName,
              size: item.size,
              returns: 0,
              refunds: 0
            })
          }
          const returnData = returnsMap.get(sizeKey)!
          if (order.status === "replaced") {
            returnData.returns += item.quantity
          } else {
            returnData.refunds += item.quantity
          }
        })
      }
    })

    // Process the collected data
    const timeSeriesData = Array.from(timeSeriesMap.values())
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    const sizePerformance = Array.from(sizePerformanceMap.values())

    const productComparison = Array.from(productComparisonMap.values())
      .map((product) => ({
        ...product,
        averagePrice: product.revenue / product.sales,
        totalOrders: product.totalOrders.size,
      }))
      .sort((a, b) => b.sales - a.sales)

    const categoryPerformance = Array.from(categoryPerformanceMap.values()) // Changed dropPerformance to categoryPerformance
      .map((category) => ({ // Changed drop to category
        ...category,
        uniqueProducts: category.uniqueProducts.size,
      }))
      .sort((a, b) => b.sales - a.sales)

    console.log(returnsMap)

    setAnalytics({
      timeSeriesData,
      sizePerformance,
      productComparison,
      categoryPerformance, // Changed dropPerformance to categoryPerformance
      productSales: productComparison,
      sizeSales: sizePerformance,
      categorySales: categoryPerformance, // Changed dropSales to categorySales
      returnStats: Array.from(returnsMap.values()),
      refundStats: Array.from(returnsMap.values())
    })
  }

  const chartConfig = {
    sales: {
      label: "Sales",
      color: "hsl(var(--chart-1))",
    },
    revenue: {
      label: "Revenue",
      color: "hsl(var(--chart-2))",
    },
    returns: {
      label: "Returns",
      color: "hsl(var(--chart-3))",
    },
    refunds: {
      label: "Refunds",
      color: "hsl(var(--chart-4))",
    }
  }

  return (
    <AppShell active="Reports">
      <div className="space-y-6">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger> {/* Changed 'drops' to 'categories' */}
          </TabsList>

          <TabsContent value="overview">
            <div className="grid gap-6">
              <Card>
                <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
                  <div className="grid flex-1 gap-1 text-center sm:text-left">
                    <CardTitle>Daily Sales Trend</CardTitle>
                    <CardDescription>
                      Showing total sales and revenue day by day
                    </CardDescription>
                  </div>
                  <Select value={timeRange} onValueChange={setTimeRange}>
                    <SelectTrigger className="w-[160px] rounded-lg sm:ml-auto">
                      <SelectValue placeholder="Last 3 months" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="90d">Last 3 months</SelectItem>
                      <SelectItem value="30d">Last 30 days</SelectItem>
                      <SelectItem value="7d">Last 7 days</SelectItem>
                    </SelectContent>
                  </Select>
                </CardHeader>
                <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
                  <ChartContainer config={chartConfig} className="aspect-auto h-[300px] w-full">
                    <AreaChart data={analytics.timeSeriesData}>
                      <defs>
                        <linearGradient id="fillSales" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--color-sales)" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="var(--color-sales)" stopOpacity={0.1} />
                        </linearGradient>
                        <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--color-revenue)" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="var(--color-revenue)" stopOpacity={0.1} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid vertical={false} />
                      <XAxis
                        dataKey="date"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        minTickGap={32}
                        tickFormatter={(value) => value}
                      />
                      <YAxis yAxisId="left" tickLine={false} axisLine={false} tickMargin={8} />
                      <YAxis yAxisId="right" orientation="right" tickLine={false} axisLine={false} tickMargin={8} />
                      <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent className="text-white" />}
                      />
                      <Area
                        yAxisId="left"
                        type="monotone"
                        dataKey="sales"
                        stroke="var(--color-sales)"
                        fillOpacity={1}
                        fill="url(#fillSales)"
                      />
                      <Area
                        yAxisId="right"
                        type="monotone"
                        dataKey="revenue"
                        stroke="var(--color-revenue)"
                        fillOpacity={1}
                        fill="url(#fillRevenue)"
                      />
                      <ChartLegend content={<ChartLegendContent />} />
                    </AreaChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Overall Product Performance</CardTitle>
                  <CardDescription>Detailed list of product performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Sales</TableHead>
                        <TableHead>Revenue</TableHead>
                        <TableHead>Average Price</TableHead>
                        <TableHead>Total Orders</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {analytics.productComparison.map((product) => (
                        <TableRow key={product.name}>
                          <TableCell>{product.name}</TableCell>
                          <TableCell>{product.sales}</TableCell>
                          <TableCell>€{product.revenue.toFixed(2)}</TableCell>
                          <TableCell>€{product.averagePrice.toFixed(2)}</TableCell>
                          <TableCell>{product.totalOrders}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="products">
            <div className="grid gap-6">
              <Card>
                <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
                  <div className="grid flex-1 gap-1 text-center sm:text-left">
                    <CardTitle>Product Performance</CardTitle>
                    <CardDescription>
                      Sales and revenue by product
                    </CardDescription>
                  </div>
                  <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                    <SelectTrigger className="w-[160px] rounded-lg sm:ml-auto">
                      <SelectValue placeholder="All Products" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Products</SelectItem>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.name}>
                          {product.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardHeader>
                <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
                  {(<ChartContainer config={chartConfig} className="aspect-auto h-[300px] w-full">
                    <BarChart data={analytics.productSales.slice(0, 10)}>
                      <CartesianGrid vertical={false} />
                      <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
                      <YAxis yAxisId="left" tickLine={false} axisLine={false} tickMargin={8} />
                      <YAxis yAxisId="right" orientation="right" tickLine={false} axisLine={false} tickMargin={8} />
                      <ChartTooltip content={<ChartTooltipContent className="text-white" />} />
                      <Bar yAxisId="left" dataKey="sales" fill="var(--color-sales)" />
                      <Bar yAxisId="right" dataKey="revenue" fill="var(--color-revenue)" />
                      <ChartLegend content={<ChartLegendContent />} />
                    </BarChart>
                  </ChartContainer>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
                  <div className="grid flex-1 gap-1 text-center sm:text-left">
                    <CardTitle>Size-wise Statistics</CardTitle>
                    <CardDescription>Sales distribution across sizes for each product</CardDescription>
                  </div>
                  <Select value={selectedProductForSize} onValueChange={setSelectedProductForSize}>
                    <SelectTrigger className="w-[160px] rounded-lg sm:ml-auto">
                      <SelectValue placeholder="Select Product" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Products</SelectItem>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.name}>
                          {product.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardHeader>
                <CardContent>
                  {selectedProductForSize == "all" ? (<p>Select a product</p>) : (<ChartContainer config={chartConfig} className="aspect-auto h-[300px] w-full">
                    <BarChart data={analytics.sizeSales}>
                      <CartesianGrid vertical={false} />
                      <XAxis dataKey="size" tickLine={false} axisLine={false} tickMargin={8} />
                      <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                      <ChartTooltip content={<ChartTooltipContent className="text-white" />} />
                      <Bar dataKey="sales" fill="var(--color-sales)" />
                      <ChartLegend content={<ChartLegendContent />} />
                    </BarChart>
                  </ChartContainer>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
                  <div className="grid flex-1 gap-1 text-center sm:text-left">
                    <CardTitle>Returns and Refunds Analysis</CardTitle>
                    <CardDescription>Product and size-wise returns and refunds</CardDescription>
                  </div>
                  <Select value={selectedProductForReturns} onValueChange={setSelectedProductForReturns}>
                    <SelectTrigger className="w-[160px] rounded-lg sm:ml-auto">
                      <SelectValue placeholder="Select Product" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Products</SelectItem>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.name}>
                          {product.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="aspect-auto h-[300px] w-full">
                    <BarChart data={analytics.returnStats}>
                      <CartesianGrid vertical={false} />
                      <XAxis dataKey="size" tickLine={false} axisLine={false} tickMargin={8} />
                      <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                      <ChartTooltip content={<ChartTooltipContent className="text-white" />} />
                      <Bar dataKey="returns" fill="var(--color-returns)" name="Returns" />
                      <Bar dataKey="refunds" fill="var(--color-refunds)" name="Refunds" />
                      <ChartLegend content={<ChartLegendContent />} />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="categories">
            <Card>
              <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
                <div className="grid flex-1 gap-1 text-center sm:text-left">
                  <CardTitle>Category Performance</CardTitle>
                  <CardDescription>
                    Sales and revenue by category
                  </CardDescription>
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-[160px] rounded-lg sm:ml-auto">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.slug} value={category.slug}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardHeader>
              <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
                <ChartContainer config={chartConfig} className="aspect-auto h-[300px] w-full">
                  <BarChart data={analytics.categorySales}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
                    <YAxis yAxisId="left" tickLine={false} axisLine={false} tickMargin={8} />
                    <YAxis yAxisId="right" orientation="right" tickLine={false} axisLine={false} tickMargin={8} />
                    <ChartTooltip content={<ChartTooltipContent className="text-white" />} />
                    <Bar yAxisId="left" dataKey="sales" fill="var(--color-sales)" />
                    <Bar yAxisId="right" dataKey="revenue" fill="var(--color-revenue)" />
                    <ChartLegend content={<ChartLegendContent />} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  )
}

// Add getServerSideProps to fetch products and categories on the server
export const getServerSideProps: GetServerSideProps<SalesAnalyticsDashboardProps> = async () => {
  try {
    const productsSnapshot = await adminFirestore.collection('products').get();
    const initialProducts = productsSnapshot.docs.map((doc) => ({
      ...(doc.data() as TProduct),
      id: doc.id,
    }));

    const categoriesSnapshot = await adminFirestore.collection('categories').get();
    const initialCategories = categoriesSnapshot.docs.map((doc) => ({
      ...(doc.data() as Category),
      slug: doc.id,
    }));

    return {
      props: {
        initialProducts: JSON.parse(JSON.stringify(initialProducts)),
        initialCategories: JSON.parse(JSON.stringify(initialCategories)),
      },
    };
  } catch (error) {
    console.error("Error fetching initial data for reports dashboard:", error);
    return {
      props: {
        initialProducts: [],
        initialCategories: [],
      },
    };
  }
};
