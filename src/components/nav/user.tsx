import React from 'react'
import auth from "@/firebase/auth"
import Link from 'next/link'

export default function UserNavItem({currentUser}: {currentUser: any}) {
    return (
        !currentUser ? (
            <div className="hidden lg:flex lg:flex-1 lg:items-center lg:justify-end lg:space-x-2">
                <Link href="/auth/login" className="text-sm font-medium text-foreground hover:text-blue-300">
                    Sign in
                </Link>
                <span className="h-6 w-px bg-gray-200" aria-hidden="true" />
                <Link href="/auth/login" className="text-sm font-medium text-foreground hover:text-blue-300">
                    Create account
                </Link>
            </div>
        ) : (
            <div className="hidden lg:flex lg:flex-1 lg:items-center lg:justify-end lg:space-x-2">
                <div className="text-sm font-medium text-foreground hover:text-blue-80 flex items-center">
                    {currentUser.photoURL && <img className="h-8 w-8 rounded-full" src={currentUser.photoURL} />}
                    <span className="ml-2">{currentUser.displayName}</span>
                </div>
                <span className="h-6 w-px bg-gray-200" aria-hidden="true" />
                <Link href="/orders" className="text-sm font-medium text-foreground hover:text-blue-300">
                    Orders
                </Link>
                <button onClick={() => {
                    auth.signOut().then(() => {
                        if (typeof window !== "undefined") {
                            window.location.reload()
                        }
                    })
                }} className="text-sm font-medium text-foreground hover:text-blue-300">
                    Logout
                </button>
            </div>
        )
    )
}
