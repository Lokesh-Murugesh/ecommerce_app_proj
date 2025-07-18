"use client"

import { useState } from "react"
import toast from "react-hot-toast"
import { Minus, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useCartStore } from "@/utils/cartStore"
import { Cart } from "@/db/cart"
import { TProduct, Product } from "@/db/products"
import { User } from "@/db/user"

interface ProductDetailsProps {
  product: TProduct
}

export default function ProductDetails({ product }: ProductDetailsProps) {
  const [selectedSize, setSelectedSize] = useState(() => {
    const availableVariant = product.variants.find((v) => v.available > 0)
    return availableVariant ? availableVariant.size : ""
  })
  const [quantity, setQuantity] = useState(1)
  const [addingToCart, setAddingToCart] = useState(false)
  const { incrementItemsCount } = useCartStore()

  const handleAddToCart = async () => {
    if (!product) return
    if (!selectedSize) return
    if (quantity < 1) return

    setAddingToCart(true)
    try {
      const user = await User.getCurrentUserWithRedirect()
      if (!user) {
        setAddingToCart(false)
        return
      }

      const item = {
        image: product.images[0],
        itemId: product.id,
        itemName: product.name, // <--- ENSURE THIS LINE IS CORRECTLY `product.name`
        itemPrice: product.salePriceEUR === -1 ? product.priceEUR : product.salePriceEUR,
        categorySlug: product.categories[0],
        productSlug: product.slug,
        quantity,
        size: selectedSize,
      }

      let cart = await Cart.getCart(user.uid)
      if (!cart) {
        await Cart.createCart(user.uid)
        cart = await Cart.getCart(user.uid)
      }

      if (!cart) {
        throw new Error("Cart not found")
      }

      const currentItemIndex = cart.items.findIndex((i) => i.itemId === item.itemId && i.size === item.size)

      if (currentItemIndex !== -1) {
        const availableQuantity = product.variants.find((variant) => variant.size === selectedSize)?.available ?? 0

        if (cart.items[currentItemIndex].quantity + quantity > availableQuantity) {
          toast.error(`Only ${availableQuantity} appointments are available for this service.`)
          setAddingToCart(false)
          return
        }
      }

      await Cart.addItemToCart(user.uid, item)
      incrementItemsCount(quantity)
      toast.success("Service added to cart successfully!")
    } catch (error) {
      console.error("Error adding service to cart:", error)
      toast.error("Failed to add service to cart. Please try again.")
    } finally {
      setAddingToCart(false)
    }
  }

  return (
    <div className="flex flex-col w-full">
      <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">{product.name}</h1>

      <div className="mt-3">
        {product.salePriceEUR !== -1 ? (
          <div>
            <span className="line-through text-zinc-400 text-sm md:text-base">EUR {product.priceEUR}</span>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-1">
              <span className="text-2xl md:text-3xl font-bold text-white">EUR {product.salePriceEUR}</span>
              <span className="text-zinc-400 text-sm">
                ({Math.floor(((product.priceEUR - product.salePriceEUR) * 100) / product.priceEUR)}% discount)
              </span>
            </div>
          </div>
        ) : (
          <p className="text-2xl md:text-3xl font-bold text-white">EUR {product.priceEUR.toString()}</p>
        )}
      </div>

      <div className="mt-4 md:mt-6">
        <div
          dangerouslySetInnerHTML={{ __html: product.description.short }}
          className="text-sm md:text-base text-zinc-300 break-words"
        />
      </div>

      <div className="mt-6">
        <RadioGroup onValueChange={setSelectedSize} className="mt-2" defaultValue={selectedSize}>
          <div className="flex items-center space-x-4 pb-2">
            {product.variants.map(({ size, available }) => (
              <div key={size} className="relative shrink-0">
                <RadioGroupItem value={size} id={`size-${size}`} disabled={available === 0} className="sr-only" />
                <Label
                  htmlFor={`size-${size}`}
                  className={cn(
                    "flex h-10 w-16 items-center justify-center rounded-full text-sm",
                    "border border-zinc-700 transition-colors",
                    selectedSize === size && "bg-pink-900 text-white border-pink-500",
                    available === 0 && "opacity-50 cursor-not-allowed",
                  )}
                >
                  {size}
                </Label>
                {available === 0 && (
                  <span className="absolute text-xs text-pink-400 top-full left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                    Booked
                  </span>
                )}
              </div>
            ))}
          </div>
        </RadioGroup>

        <div className="mt-6">
          <QuantitySelector
            quantity={quantity}
            setQuantity={setQuantity}
            available={product.variants.find((v) => v.size === selectedSize)?.available ?? 0}
          />
        </div>

        <div className="mt-6">
          <button
            onClick={handleAddToCart}
            className="w-full rounded-md bg-pink-600 px-4 py-3 text-sm font-medium text-white transition-all hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={selectedSize === "" || addingToCart}
          >
            {addingToCart ? "Booking..." : "Book this service"}
          </button>
        </div>
      </div>

      <MoreProductDetails product={product} />
    </div>
  )
}

function QuantitySelector({
  quantity,
  setQuantity,
  available,
}: { quantity: number; setQuantity: (value: number) => void; available: number }) {
  const increment = () => {
    if (quantity < available) {
      setQuantity(quantity + 1)
    }
  }

  const decrement = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1)
    }
  }

  return (
    <div className="flex items-center">
      <button
        type="button"
        onClick={decrement}
        disabled={quantity <= 1}
        className="p-2 border border-zinc-700 rounded-l-md bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50"
      >
        <Minus className="h-4 w-4" />
      </button>
      <div className="px-4 py-2 border-t border-b border-zinc-700 bg-zinc-800 text-center min-w-[3rem]">{quantity}</div>
      <button
        type="button"
        onClick={increment}
        disabled={quantity >= available}
        className="p-2 border border-zinc-700 rounded-r-md bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50"
      >
        <Plus className="h-4 w-4" />
      </button>
      <span className="ml-4 text-sm text-zinc-400">{available} available</span>
    </div>
  )
}

function MoreProductDetails({ product }: { product: TProduct }) {
  return (
    <div className="mt-8 border-t border-zinc-800 pt-8">
      <div
        dangerouslySetInnerHTML={{ __html: product.description.long }}
        className="prose prose-invert prose-sm max-w-none text-zinc-300"
      />
    </div>
  )
}
