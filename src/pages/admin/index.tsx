import withAdminAuth from "@/components/withAdminAuth";
import AppShell from "@/components/shared/AppShell";
import Link from "next/link"; // Import Link for navigation
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"; // Import Card components

// Define the structure for each admin section
const adminSections = [
    {
        title: "Products",
        description: "Manage product listings, details, and categories.",
        href: "/admin/products",
    },
    {
        title: "Orders",
        description: "View and manage customer orders, track statuses.",
        href: "/admin/orders",
    },
    {
        title: "Inventory",
        description: "Track stock levels and manage product variants.",
        href: "/admin/inventory",
    },
    {
        title: "Categories",
        description: "Manage limited edition product drops.",
        href: "/admin/categories",
    },
    {
        title: "User Roles",
        description: "Manage user permissions and roles.",
        href: "/admin/userRole",
    },
    {
        title: "Reports",
        description: "Access sales and inventory reports.",
        href: "/admin/reports",
    },
];

function Admin() {
    return (
        <AppShell>
            {/* FIX: Changed background and text colors for white mode */}
            <div className="min-h-[calc(100vh-5rem)] w-full p-8 bg-white text-black">
                <h1 className="text-4xl font-bold text-gray-800 mb-10 text-center">Admin Dashboard</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {adminSections.map((section) => (
                        <Link href={section.href} key={section.title}>
                            {/* FIX: Adjusted card background, border, text, and hover for white mode */}
                            <Card className="bg-white border-gray-200 text-gray-900 hover:bg-gray-50 transition-colors duration-200 cursor-pointer h-full flex flex-col">
                                <CardHeader>
                                    <CardTitle className="text-2xl font-semibold text-gray-800">{section.title}</CardTitle>
                                    <CardDescription className="text-gray-600">{section.description}</CardDescription>
                                </CardHeader>
                                <CardContent className="flex-grow flex items-end">
                                    <span className="text-blue-600">Explore &rarr;</span> {/* Changed link color for visibility */}
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>
        </AppShell>
    );
}

export default withAdminAuth(Admin);