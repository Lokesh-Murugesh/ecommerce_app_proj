import { ShoppingBagIcon } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

export default function CartNavItem({ itemsCount }: { itemsCount: number }) {
    return (
        <div className="ml-4 flex flex-row lg:ml-6">
            <div className='lg:hidden md:mx-4 mx-1 flex gap-2 flex-row'>
                <Link href={"/orders"}>
                    <p>
                        Orders
                    </p>
                </Link>
            </div>
            <Link href="/cart" className="group -m-2 flex items-center p-2">
                <ShoppingBagIcon
                    className="h-6 w-6 flex-shrink-0 text-[#D2DCFF] group-hover:text-[#D2DCFF]"
                    aria-hidden="true"
                />
                <span className="ml-2 text-sm font-medium text-[#D2DCFF] group-hover:text-blue-300">
                    {itemsCount}
                </span>
                <span className="sr-only">items in cart, view bag</span>
            </Link>

        </div>
    )
}