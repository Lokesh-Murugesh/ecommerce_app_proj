import type { TProduct } from "@/db/products"
import Link from "next/link"

interface TCategory {
  id: string
  name: string
}

interface TNavigation {
  categories: TCategory[]
}

export default function DropsMobileNavItem({
  Fragment,
  navigation,
  products,
}: { Fragment: any; navigation: TNavigation; products: TProduct[] }) {
  return (
    <div className="space-y-10 px-4 pb-8 pt-10 overflow-scroll">
      {navigation.categories.map((category) => (
        <div key={category.name}>
          <h3 className="text-lg font-medium text-gray-900 mb-4">{category.name}</h3>
          <div className="grid grid-cols-2 gap-x-4 gap-y-8">
            {products
              .filter((p) => p.categories.map((c) => c.toLocaleLowerCase()).includes(category.id.toLocaleLowerCase()))
              .splice(0, 3)
              .map((item) => (
                <div key={item.name} className="group relative">
                  <div className="aspect-w-1 aspect-h-1 overflow-hidden rounded-lg bg-gray-100 group-hover:opacity-75">
                    <img
                      src={item.featuredImage || "/placeholder.svg"}
                      alt={item.name}
                      className="object-cover object-center w-full h-full"
                    />
                  </div>
                  <Link href={`/${category.id}/${item.slug}`} className="mt-2 block text-sm font-medium text-gray-900">
                    {item.name}
                  </Link>
                  <p className="mt-1 text-sm text-gray-500">Shop now</p>
                </div>
              ))}
          </div>
          <Link href={`/${category.id}`} className="mt-6 block text-sm font-semibold text-blue-600 hover:text-blue-800">
          Explore all {category.name} Services
          </Link>
        </div>
      ))}
    </div>
  )
}

