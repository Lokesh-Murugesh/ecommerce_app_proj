import { useState } from "react"
import { registerWithEmailPassword } from "@/firebase/auth"
import Image from "next/image"
import Link from "next/link"
import { toast } from "react-hot-toast"
import { Cart } from "@/db/cart" // <-- IMPORT THE NEW CLASS

export default function Register() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!email || !password || !confirmPassword) {
            toast.error("Please fill in all fields")
            return
        }

        if (password !== confirmPassword) {
            toast.error("Passwords do not match")
            return
        }

        if (password.length < 6) {
            toast.error("Password must be at least 6 characters")
            return
        }

        setIsLoading(true)
        try {
            const result = await registerWithEmailPassword(email, password)
            if (result.success && result.user) {
                // --- ADD THIS CRITICAL STEP ---
                // After successful registration, create a cart for the new user.
                await Cart.ensureCartExists(result.user.uid);
                // --- END OF CRITICAL STEP ---

                toast.success("Registration successful!")
                window.location.href = "/"
            } else {
                result.error && toast.error(result.error)
            }
        } catch (error) {
            console.error(error)
            toast.error("Failed to register")
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
                            Create your account
                        </h2>
                    </div>

                    <div className="mt-10">
                        <form onSubmit={handleRegister} className="space-y-6">
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

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium leading-6 text-neutral-200">
                                    Password
                                </label>
                                <div className="mt-2">
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="block w-full rounded-md border-0 py-1.5 px-3 bg-neutral-800 text-neutral-200 shadow-sm ring-1 ring-inset ring-neutral-700 placeholder:text-neutral-400 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm sm:leading-6"
                                        placeholder="Create a password"
                                    />
            <p className="mt-1 text-xs text-neutral-400">Password must be at least 8 characters and include a special character.</p>
                                </div>
                            </div>

                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium leading-6 text-neutral-200">
                                    Confirm Password
                                </label>
                                <div className="mt-2">
                                    <input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type="password"
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="block w-full rounded-md border-0 py-1.5 px-3 bg-neutral-800 text-neutral-200 shadow-sm ring-1 ring-inset ring-neutral-700 placeholder:text-neutral-400 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm sm:leading-6"
                                        placeholder="Confirm your password"
                                    />
                                </div>
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="flex w-full justify-center rounded-md bg-blue-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? "Creating account..." : "Create account"}
                                </button>
                            </div>
                        </form>

                        <p className="mt-6 text-center text-sm text-neutral-400">
                            Already have an account?{" "}
                            <Link href="/auth/login" className="text-blue-500 hover:text-blue-400">
                                Sign in
                            </Link>
                        </p>

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