import { Fragment, useEffect, useState } from "react"
import Link from "next/link"
import { Menu } from "lucide-react"
import { type TUser, User } from "@/db/user"
import { Cart } from "@/db/cart"
import { useCartStore } from "@/utils/cartStore"
import UserNavItem from "../nav/user"
import CartNavItem from "../nav/cart"
import UserMobileNavItem from "../nav/userMobile"
import DropsMobileNavItem from "../nav/dropsMobile"
import DropsNavItem from "../nav/drops"

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { NavigationMenu, NavigationMenuList, NavigationMenuItem } from "@/components/ui/navigation-menu"
import { COMPANY_NAME } from "@/utils/constants"
import { useDropsStore } from "@/utils/dropsStore"
import { SearchBar } from "./SearchBar"
import { useProductStore } from "@/utils/productStore" // <-- This import will now work
// FIX: Import getAuth and onAuthStateChanged
import { getAuth, onAuthStateChanged } from "firebase/auth";
import app from "@/firebase/app"; // Import your Firebase app instance


export default function Nav() {
  const [currentUser, setCurrentUser] = useState<TUser | null>(null)
  const [isScrolled, setIsScrolled] = useState(false)
  const { itemsCount, setItemsCount } = useCartStore()
  const { categories, initialize: initializeDropsStore } = useDropsStore()
  
  // Use the new product store
  const { products, initialize: initializeProductStore } = useProductStore()

  // FIX: Add state to track admin status
  const [isAdmin, setIsAdmin] = useState(false);

  const navHeight = "64px"

  useEffect(() => {
    // Initialize both stores when the Nav component mounts
    initializeDropsStore()
    initializeProductStore()

    // FIX: Add auth state listener to check for admin claims
    const auth = getAuth(app); // Get the auth instance
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
            // User is signed in, check for admin custom claim
            const idTokenResult = await user.getIdTokenResult();
            setIsAdmin(idTokenResult.claims.admin === true);
        } else {
            // User is signed out
            setIsAdmin(false);
        }
    });

    // Clean up the subscription on unmount
    return () => unsubscribe();

  }, [initializeDropsStore, initializeProductStore])

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY
      setIsScrolled(scrollPosition > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    const fetchUserAndCart = async () => {
      const user = await User.getCurrentUser()
      setCurrentUser(user)
      if (user) {
        await Cart.ensureCartExists(user.uid); 
        const cart = await Cart.getCart(user.uid)
        if (cart) {
          const count = cart.items.reduce((acc, item) => acc + item.quantity, 0)
          setItemsCount(count)
        }
      }
    }
    fetchUserAndCart()
  }, [setItemsCount])

  // The Nav component now uses the 'products' variable from the useProductStore hook.
  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 w-full bg-black transition-all duration-300 z-40 ${
          isScrolled ? "py-1 bg-black/90" : "py-4"
        }`}
      >
        <nav aria-label="Top" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div
            className={`flex items-center justify-between transition-all duration-300 ${isScrolled ? "h-12" : "h-16"}`}
          >
            {/* Mobile Menu Trigger */}
            <Sheet>
              <SheetTrigger asChild>
                <button type="button" className="relative rounded-md bg-transparent p-2 text-gray-100 lg:hidden">
                  <span className="sr-only">Open menu</span>
                  <Menu className="h-6 w-6" />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[400px] bg-foreground text-black overflow-scroll">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col space-y-4 mt-4">
                  <DropsMobileNavItem Fragment={Fragment} products={products} navigation={{categories: categories}} />
                  <UserMobileNavItem currentUser={currentUser} />
                  {/* FIX: Add conditional Admin Panel link to mobile menu */}
                  {isAdmin && (
                    <Link href="/admin" className="text-gray-700 hover:text-gray-900 block px-4 py-2 text-sm font-medium">
                      Admin Panel
                    </Link>
                  )}
                </div>
              </SheetContent>
            </Sheet>

            {/* Logo */}
            <div className="flex items-center space-x-16">
                <div className="flex lg:ml-0">
                  <Link href="/">
                    <span className="sr-only">{COMPANY_NAME}</span>
                    <img
                      className={`w-auto transition-all duration-300 ${isScrolled ? "h-10" : "h-16"}`}
                      src="/logo.png"
                      alt=""
                    />
                  </Link>
                </div>
                {/* Desktop Navigation */}
                <NavigationMenu className="hidden lg:flex " >
                  <NavigationMenuList>
                    <NavigationMenuItem>
                      <DropsNavItem products={products} navigation={{categories : categories}} />
                    </NavigationMenuItem>
                    {/* FIX: Add conditional Admin Panel link to desktop navigation */}
                    {isAdmin && (
                      <NavigationMenuItem>
                        <Link href="/admin" className="text-gray-100 hover:text-white px-4 py-2 rounded-md text-sm font-medium">
                          Admin Panel
                        </Link>
                      </NavigationMenuItem>
                    )}
                  </NavigationMenuList>
                </NavigationMenu>
            </div>

            {/* User and Cart */}
            <div className="flex items-center space-x-1 md:space-x-4 justify-end">
              <SearchBar></SearchBar>
              <UserNavItem currentUser={currentUser} />
              <CartNavItem itemsCount={itemsCount} />
            </div>
          </div>
        </nav>
      </header>
      <div
        style={{
          height: `calc(${navHeight} + 32px)`,
        }}
        className="transition-all duration-300"
      />
    </>
  )
}