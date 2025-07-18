'use client'

import * as React from 'react'
import Link from 'next/link'
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface TCategory {
    id: string
    name: string
}

interface TNavigation {
    categories: TCategory[]
}

interface TProduct {
    name: string
    slug: string
    featuredImage?: string
    categories: string[]
}

export default function DropsNavItem({ navigation, products }: { navigation: TNavigation; products: TProduct[] }) {
    return (
        <div className="hidden md:flex md:space-x-8">
            {navigation.categories.map((category) => (
                <Popover key={category.name}>
                    <PopoverTrigger asChild>
                        <button className="relative z-10 -mb-px flex items-center pt-px text-sm font-medium transition-colors duration-200 ease-out hover:text-blue-400 focus:outline-none">
                            {category.name}
                        </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-screen max-w-none p-0">
                        <div className="w-full max-w-7xl mx-auto">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4">
                                {products
                                    .filter((p) =>
                                        p.categories.map((c) => c.toLowerCase()).includes(category.id.toLowerCase())
                                    )
                                    .slice(0, 3)
                                    .map((item) => (
                                        <Link
                                            href={`/${category.id}/${item.slug}`}
                                            key={item.name} className="group relative">
                                            <div className="aspect-w-1 aspect-h-1 overflow-hidden rounded-lg bg-gray-100 group-hover:opacity-75">
                                                <img
                                                    src={item.featuredImage || "/placeholder.svg"}
                                                    alt={item.name}
                                                    className="object-cover object-center w-full h-full"
                                                />
                                            </div>
                                            <div
                                                className="mt-4 block font-medium text-gray-900"
                                            >
                                                {item.name}
                                            </div>
                                            <p className="mt-1 text-sm text-gray-500">Shop now</p>
                                        </Link>
                                    ))}
                                <div className="group relative flex items-center justify-center">
                                    <Link
                                        href={`/${category.id}`}
                                        className="text-lg font-semibold text-blue-600 hover:text-blue-800"
                                    >
                                        Explore full drop
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </PopoverContent>
                </Popover>
            ))}
        </div>
    )
}
