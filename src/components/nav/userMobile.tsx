import React from 'react'
import auth from "@/firebase/auth"
import Link from 'next/link'


export default function UserMobileNavItem({currentUser}: {currentUser: any}) {
    return (
        !currentUser ? (
            <div className="space-y-6 border-t border-gray-200 px-4 py-6 mt-auto">
                <div className="flow-root">
                    <Link href="/auth/login" className="-m-2 block p-2 font-medium text-gray-900">
                        Sign in
                    </Link>
                </div>
                <div className="flow-root">
                    <Link href="/auth/login" className="-m-2 block p-2 font-medium text-gray-900">
                        Create account
                    </Link>
                </div>
            </div>
        ) : (
            <div className="space-y-6 border-t border-gray-200 px-4 py-6 mt-auto">
                <div className="flex items-center">
                    {currentUser.photoURL && <div className="flow-root">
                        <img className="h-10 w-10 rounded-full" src={currentUser.photoURL} alt="" />
                    </div>}
                    <div className="ml-4 text-neutral-600">
                        {currentUser.displayName}
                    </div>
                </div>
                <div className="flow-root">
                    <button
                        onClick={() => {
                            auth.signOut().then(() => {
                                if (typeof window !== "undefined") {
                                    window.location.reload()
                                }
                            })
                        }}
                        className="-m-2 block p-2 font-medium text-gray-900"
                    >
                        Logout
                    </button>
                </div>
            </div>
        )
    )
}
