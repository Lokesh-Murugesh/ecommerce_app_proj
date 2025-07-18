import { Fragment, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import {
    Bars3Icon,
    CalendarIcon,
    ChartPieIcon,
    CubeIcon,
    ListBulletIcon,
    XMarkIcon,
    ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import Image from 'next/image'
import { NewspaperIcon, ShoppingBasket, ShoppingBasketIcon, Users2Icon } from 'lucide-react'

const navigation = [
    { name: 'Products', href: '/admin/products', icon: CubeIcon, current: false },
    // FIX: Changed 'Drops' to 'Categories' and updated href
    { name: 'Categories', href: '/admin/categories', icon: ListBulletIcon, current: false },
    { name: 'Orders', href: '/admin/orders', icon: CalendarIcon, current: false },
    { name: 'Reports', href: '/admin/reports', icon: ChartPieIcon, current: false },
    { name: "Inventory", href: "/admin/inventory", icon: ShoppingBasketIcon, current: false },
    { name: "Add admin", href: "/admin/userRole", icon: Users2Icon, current: false }
]

function classNames(...classes: any) {
    return classes.filter(Boolean).join(' ')
}

interface AppShellProps {
    children: React.ReactNode | React.ReactNode[]
    active?: string
}

export default function AppShell({ children, active }: AppShellProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false)

    const renderSidebarContent = () => (
        <>
            <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-blue-600 px-6">
                <div className="flex h-16 shrink-0 items-center">
                    <Image
                        height={32}
                        width={32}
                        className="h-8 w-auto"
                        src="/logo-white.svg"
                        alt="Logo"
                    />
                </div>
                <nav className="flex flex-1 flex-col">
                    <ul role="list" className="flex flex-1 flex-col gap-y-7">
                        <li>
                            <ul role="list" className="-mx-2 space-y-1">
                                {navigation.map((item) => (
                                    <li key={item.name}>
                                        <Link
                                            href={item.href}
                                            className={classNames(
                                                item.name === active
                                                    ? 'bg-blue-700 text-white'
                                                    : 'text-blue-200 hover:text-white hover:bg-blue-700',
                                                'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
                                            )}
                                        >
                                            <item.icon
                                                className={classNames(
                                                    item.name === active ? 'text-white' : 'text-blue-200 group-hover:text-white',
                                                    'h-6 w-6 shrink-0'
                                                )}
                                                aria-hidden="true"
                                            />
                                            {item.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </li>
                        <li className="mt-auto">
                            <Link
                                href="/auth/logout"
                                className="group -mx-2 flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-blue-200 hover:bg-blue-700 hover:text-white"
                            >
                                <ArrowRightOnRectangleIcon
                                    className="h-6 w-6 shrink-0 text-blue-200 group-hover:text-white"
                                    aria-hidden="true"
                                />
                                Logout
                            </Link>
                        </li>
                    </ul>
                </nav>
            </div>
        </>
    )

    return (
        <>
            <div>
                <Transition.Root show={sidebarOpen} as={Fragment}>
                    <Dialog as="div" className="relative z-50 lg:hidden" onClose={setSidebarOpen}>
                        <Transition.Child
                            as={Fragment}
                            enter="transition-opacity ease-linear duration-300"
                            enterFrom="opacity-0"
                            enterTo="opacity-100"
                            leave="transition-opacity ease-linear duration-300"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                        >
                            <div className="fixed inset-0 bg-gray-900/80" />
                        </Transition.Child>

                        <div className="fixed inset-0 flex">
                            <Transition.Child
                                as={Fragment}
                                enter="transition ease-in-out duration-300 transform"
                                enterFrom="-translate-x-full"
                                enterTo="translate-x-0"
                                leave="transition ease-in-out duration-300 transform"
                                leaveFrom="translate-x-0"
                                leaveTo="-translate-x-full"
                            >
                                <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                                    <Transition.Child
                                        as={Fragment}
                                        enter="ease-in-out duration-300"
                                        enterFrom="opacity-0"
                                        enterTo="opacity-100"
                                        leave="ease-in-out duration-300"
                                        leaveFrom="opacity-100"
                                        leaveTo="opacity-0"
                                    >
                                        <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                                            <button type="button" className="-m-2.5 p-2.5" onClick={() => setSidebarOpen(false)}>
                                                <span className="sr-only">Close sidebar</span>
                                                <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                                            </button>
                                        </div>
                                    </Transition.Child>
                                    {renderSidebarContent()}
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </Dialog>
                </Transition.Root>

                {/* Static sidebar for desktop */}
                <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
                    {renderSidebarContent()}
                </div>

                <div className="sticky top-0 z-40 flex items-center gap-x-6 bg-blue-600 px-4 py-4 shadow-sm sm:px-6 lg:hidden">
                    <button type="button" className="-m-2.5 p-2.5 text-blue-200 lg:hidden" onClick={() => setSidebarOpen(true)}>
                        <span className="sr-only">Open sidebar</span>
                        <Bars3Icon className="h-6 w-6" aria-hidden="true" />
                    </button>
                    <div className="flex-1 text-sm font-semibold leading-6 text-white">Dashboard</div>
                </div>

                <main className="py-10 lg:pl-72 bg-white min-h-screen">
                    <div className="px-4 sm:px-6 lg:px-8">{children}</div>
                </main>
            </div>
        </>
    )
}