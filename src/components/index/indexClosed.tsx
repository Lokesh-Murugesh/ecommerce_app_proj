'use client'

import React from 'react'

import { ProductCard } from './ProductCard'
import Link from 'next/link'


export default function IndexClosed({ allDrops, products }: { allDrops: any, products: any }) {
  return (
    <section className='bg-slate-100'>
      <div className=" space-y-16 bg-slate-900">
        <h1 className="text-4xl font-bold text-center px-8 pt-8">Check out our latest drops</h1>
        <div className="flex h-full space-x-4 justify-center items-center px-2 w-full bg-slate-900">
          {allDrops.categories.map((category: any) => (
            <div className="col-start-2 grid grid-cols-3 gap-x-4" key={category.id}>
              {products.filter((p: any) => p.categories.map((c: any) => c.toLocaleLowerCase()).includes(category.id.toLocaleLowerCase())).splice(0, 2).map((item: any) => (
                <ProductCard product={item} category={category.id} key={item.id} />
              ))}
              <Link href={`/${category.id}`}
                className="group relative flex max-w-full w-64 flex-col overflow-hidden shadow-light shadow-outlaw-blue hover:shadow-none hover:translate-x-1 hover:translate-y-1 rounded-lg border-4 border-outlaw-blue bg-foreground"
              >
                <div className="h-full w-full rounded-lg bg-slate-100 group-hover:opacity-75 flex items-center justify-center">
                  <div className="my-auto flex text-center text-black">
                    Explore the full drop
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
