import { X } from 'lucide-react'
import React from 'react'
import QuantitySelector from './CartQuantity'
import Link from 'next/link'

interface CartItemsProps {
    cart: any,
    handleRemoveItem: any,
    handleQuantityChange: any,
    allProducts: any,
}

export default function CartItems({ cart, handleRemoveItem, handleQuantityChange, allProducts }: CartItemsProps) {
    return (
        <section aria-labelledby="cart-heading" className="lg:col-span-7 rounded-sm p-4 px-0">
            <h2 id="cart-heading" className="sr-only">
                Items in your shopping cart
            </h2>

            <ul role="list" className="space-y-4">
                {cart?.items.length === 0 && (
                    <h1 className="text-2xl font-bold text-center text-pink-200">
                        No items in your cart.
                    </h1>
                )}
                {cart?.items.map((product: any, productIdx: any) => (
                    <li key={product.productSlug} className="flex border-2 bg-foreground p-4 border-black rounded-lg shadow-dark shadow-black ">
                        <div className="flex-shrink-0 border-2 border-black rounded-lg shadow-dark shadow-black ">
                            <img
                                src={product.image}
                                className="h-full w-24 rounded-md object-cover object-center sm:h-48 sm:w-48"
                            />
                        </div>

                        <div className="ml-4 flex flex-1 flex-col justify-between sm:ml-6">
                            <div className="relative pr-9 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:pr-0">
                                <div>
                                    <div className="flex justify-between">
                                        <h3 className="text-sm">
                                            <Link href={`/${product.categorySlug}/${product.productSlug}`} className="font-bold text-3xl text-black hover:text-outlaw-blue hover:underline">
                                                {product.itemName}
                                            </Link>
                                        </h3>
                                    </div>
                                    <div className="mt-1 flex text-md text-black font-black">
                                        <p className="text-black">{product.size}</p>
                                    </div>
                                    <div>
                                        <p className="mt-1 font-bold text-xl text-black">EUR {product.itemPrice}</p>
                                        <QuantitySelector
                                        productIdx={productIdx}
                                        product={product}
                                        allProducts={allProducts}
                                        handleQuantityChange={handleQuantityChange}
                                    />
                                    </div>
                                </div>

                                <div className="mt-4 sm:mt-0 sm:pr-9">
                                    <label htmlFor={`quantity-${productIdx}`} className="sr-only">
                                        Quantity, {product.itemName}
                                    </label>

                                    <div className="absolute right-0 top-0">
                                        <button type="button" className="-m-2 inline-flex p-2 text-black hover:text-outlaw-blue"
                                            onClick={(e) => {
                                                handleRemoveItem(product.itemId, product.size)
                                            }
                                            }>
                                            <span className="sr-only">Remove</span>
                                            <X className="h-5 w-5" aria-hidden="true" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* <p className="mt-4 flex space-x-2 text-sm text-gray-700">
                        {product.inStock ? (
                            <CheckIcon className="h-5 w-5 flex-shrink-0 text-green-500" aria-hidden="true" />
                        ) : (
                            <ClockIcon className="h-5 w-5 flex-shrink-0 text-gray-300" aria-hidden="true" />
                        )}

                        <span>{product.inStock ? 'In stock' : `Ships in ${product.leadTime}`}</span>
                    </p> */}
                        </div>
                    </li>
                ))}
            </ul>
        </section>)
}