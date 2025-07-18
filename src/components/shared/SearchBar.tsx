"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useDebounce } from "use-debounce"
import { TProduct } from "@/db/products"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { Loader2, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useProductStore } from "@/utils/productStore" // <-- This import will now work

export function SearchBar() {
  const router = useRouter()
  const [isOpen, setIsOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const [debouncedQuery] = useDebounce(query, 300)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [inputWidth, setInputWidth] = React.useState<number>(0)
  
  // Get products and loading state from our shared store
  const { products, isLoading } = useProductStore()

  React.useEffect(() => {
    const updateWidth = () => {
      if (inputRef.current) {
        setInputWidth(inputRef.current.offsetWidth)
      }
    }
    updateWidth()
    window.addEventListener("resize", updateWidth)
    return () => window.removeEventListener("resize", updateWidth)
  }, [])

  const filteredProducts = React.useMemo(() => {
    if (!products) return []
    if (!debouncedQuery) return []

    return products
      .filter((product) => {
        const searchQuery = debouncedQuery.toLowerCase()
        return (
          product.name.toLowerCase().includes(searchQuery) ||
          product.description.short.toLowerCase().includes(searchQuery)
        )
      })
      .slice(0, 6)
  }, [products, debouncedQuery])

  const handleSelect = React.useCallback(
    (product: TProduct) => {
      const category = product.categories[0]
      router.push(`/${category}/${product.slug}`)
      setIsOpen(false)
      setQuery("")
    },
    [router],
  )

  const [selectedIndex, setSelectedIndex] = React.useState(0)
  
  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen) return

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault()
          setSelectedIndex((prev) => (prev < filteredProducts.length - 1 ? prev + 1 : prev))
          break
        case "ArrowUp":
          e.preventDefault()
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev))
          break
        case "Enter":
          e.preventDefault()
          if (filteredProducts[selectedIndex]) {
            handleSelect(filteredProducts[selectedIndex])
          }
          break
        case "Escape":
          setIsOpen(false)
          inputRef.current?.blur()
          break
      }
    },
    [filteredProducts, handleSelect, isOpen, selectedIndex],
  )
  
  return (
    <div className="relative w-1/3 max-w-[600px]">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search products..."
          className="w-full pl-9"
        />
      </div>

      {isOpen && (
        <>
          <div
            className="absolute left-0 top-[calc(100%+8px)] z-50 rounded-lg border bg-background shadow-md"
            style={{ width: inputWidth }}
          >
            {isLoading ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="max-h-[300px] overflow-auto">
                {filteredProducts.length === 0 ? (
                  <p className="p-4 text-center text-sm text-muted-foreground">No products found.</p>
                ) : (
                  filteredProducts.map((product, index) => (
                    <div
                      key={product.id}
                      onClick={() => handleSelect(product)}
                      className={cn(
                        "flex cursor-pointer items-center gap-4 p-2 rounded-md hover:bg-accent",
                        selectedIndex === index && "bg-accent",
                      )}
                    >
                      <div className="relative h-16 w-16 overflow-hidden rounded-md">
                        <Image
                          src={product.featuredImage || "/placeholder.svg"}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex flex-col rounded-md">
                        <span className="font-medium text-black">{product.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {product.salePriceEUR == -1 ?  product.priceEUR : product.salePriceEUR}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          <div
            className="fixed inset-0 z-40"
            onClick={() => {
              setIsOpen(false)
              setQuery("")
            }}
          />
        </>
      )}
    </div>
  )
}