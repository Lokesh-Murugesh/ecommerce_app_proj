import { useState } from "react"
import auth, { signInWithGoogle, sendMagicLink, signInWithEmailPassword } from "@/firebase/auth"
import Image from "next/image"
import Link from "next/link"
import { toast } from "react-hot-toast"

export default function SignIn() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [isLinkSent, setIsLinkSent] = useState(false)
    const [useMagicLink, setUseMagicLink] = useState(false)

    const handleSigninWithGooglePopup = async () => {
        try {
            // This single function call now handles both authentication
            // and ensuring the user's cart exists in the database.
            await signInWithGoogle();
            
            // On success, redirect the user to the homepage.
            if (typeof window !== "undefined") {
                window.location.href = "/"
            }
        } catch (error) {
            console.error(error)
            toast.error("Failed to sign in with Google. Please try again.");
        }
    }

    const handleMagicLinkSignIn = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email) {
            toast.error("Please enter your email address")
            return
        }

        setIsLoading(true)
        try {
            const result = await sendMagicLink(email)
            if (result.success) {
                setIsLinkSent(true)
                toast.success("Magic link sent!")
            } else {
                toast.error("Error sending magic link. Please try again.")
            }
        } catch (error) {
            console.error(error)
            toast.error("Error sending magic link. Please try again.")
        }
        setIsLoading(false)
    }

    const handleEmailPasswordSignIn = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email || !password) {
            toast.error("Please enter both email and password")
            return
        }

        setIsLoading(true)
        try {
            await signInWithEmailPassword(
                email,
                password,
                () => toast.error("Invalid email or password"),
                () => {
                    toast.success("Signed in successfully!")
                    window.location.href = "/"
                }
            )
        } catch (error) {
            console.error(error)
            toast.error("Failed to sign in")
        }
        setIsLoading(false)
    }

    return (
        <div className="flex min-h-screen flex-1 bg-[#202020]">
            <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
                <div className="mx-auto w-full max-w-sm lg:w-96">
                    <div>
                        <img
                            className="h-10 w-auto mx-auto"
                            src="/logo-white.svg"
                            alt="Your Company"
                        />
                        <h2 className="mt-8 text-2xl font-bold leading-9 tracking-tight text-neutral-200 text-center">
                            Sign in to your account
                        </h2>
                    </div>

                    <div className="mt-10">
                        {isLinkSent ? (
                            <div className="space-y-4">
                                <div className="rounded-md bg-blue-900/50 p-4">
                                    <p className="text-sm text-neutral-200">
                                        Check the inbox of <span className="font-medium text-blue-400">{email}</span> and click on the sign in link to instantly sign in.
                                    </p>
                                </div>
                                <button
                                    onClick={() => {
                                        setIsLinkSent(false)
                                        setEmail("")
                                        setUseMagicLink(false)
                                    }}
                                    className="text-sm text-blue-500 hover:text-blue-400"
                                >
                                    Use a different email
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={useMagicLink ? handleMagicLinkSignIn : handleEmailPasswordSignIn} className="space-y-6">
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium leading-6 text-neutral-200">
                                        Email address
                                    </label>
                                    <div className="mt-2">
                                        <input
                                            id="email"
                                            name="email"
                                            type="email"
                                            autoComplete="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="block w-full rounded-md border-0 py-1.5 px-3 bg-neutral-800 text-neutral-200 shadow-sm ring-1 ring-inset ring-neutral-700 placeholder:text-neutral-400 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm sm:leading-6"
                                            placeholder="Enter your email"
                                        />
                                    </div>
                                </div>

                                {!useMagicLink && (
                                    <div>
                                        <label htmlFor="password" className="block text-sm font-medium leading-6 text-neutral-200">
                                            Password
                                        </label>
                                        <div className="mt-2">
                                            <input
                                                id="password"
                                                name="password"
                                                type="password"
                                                autoComplete="current-password"
                                                required
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="block w-full rounded-md border-0 py-1.5 px-3 bg-neutral-800 text-neutral-200 shadow-sm ring-1 ring-inset ring-neutral-700 placeholder:text-neutral-400 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm sm:leading-6"
                                                placeholder="Enter your password"
                                            />
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="flex w-full justify-center rounded-md bg-blue-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isLoading ? "Signing in..." : "Sign In"}
                                    </button>
                                </div>

                                <div className="flex items-center justify-center">
                                </div>
                            </form>
                        )}

                        {!isLinkSent && (
                            <>
                                <div className="mt-6">
                                    <div className="relative">
                                        <div className="absolute inset-0 flex items-center">
                                            <div className="w-full border-t border-gray-800" />
                                        </div>
                                        <div className="relative flex justify-center text-sm font-medium leading-6">
                                            <span className="bg-[#202020] px-6 text-neutral-200">Or continue with</span>
                                        </div>
                                    </div>

                                    <div className="mt-6">
                                        <button
                                            onClick={handleSigninWithGooglePopup}
                                            className="flex w-full items-center justify-center gap-3 rounded-md bg-[#333] px-3 py-2 text-sm font-semibold text-white shadow-sm ring-1 ring-inset ring-gray-500 hover:bg-[#444] focus-visible:ring-transparent"
                                        >
                                            <svg className="h-5 w-5" aria-hidden="true" viewBox="0 0 24 24">
                                                <path
                                                    d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60998L5.27028 9.70498C6.21525 6.86002 8.87028 4.75 12.0003 4.75Z"
                                                    fill="#EA4335"
                                                />
                                                <path
                                                    d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z"
                                                    fill="#4285F4"
                                                />
                                                <path
                                                    d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.275 6.60986C0.46 8.22986 0 10.0599 0 11.9999C0 13.9399 0.46 15.7699 1.28 17.3899L5.26498 14.2949Z"
                                                    fill="#FBBC05"
                                                />
                                                <path
                                                    d="M12.0004 24.0001C15.2404 24.0001 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.8704 19.245 6.21537 17.135 5.2654 14.29L1.27539 17.385C3.25539 21.31 7.3104 24.0001 12.0004 24.0001Z"
                                                    fill="#34A853"
                                                />
                                            </svg>
                                            <span className="text-sm font-semibold leading-6">Google</span>
                                        </button>
                                    </div>
                                </div>

                                <p className="mt-6 text-center text-sm text-neutral-400">
                                    Don't have an account?{" "}
                                    <Link href="/auth/register" className="text-blue-500 hover:text-blue-400">
                                        Create one
                                    </Link>
                                </p>
                            </>
                        )}
                    </div>
                </div>
            </div>
            <div className="relative hidden w-0 flex-1 lg:block">
                <Image
                    className="absolute inset-0 h-full w-full object-cover"
                    src="https://images.unsplash.com/photo-1605106702734-205df224ecce?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                    layout="fill"
                    alt=""
                />
            </div>
        </div>
    )
}