"use client"

import { cn } from "@/lib/utils"
import { Tab } from "@headlessui/react"

interface ProductGalleryProps {
  images: string[]
}

export default function ProductGallery({ images }: ProductGalleryProps) {
  return (
    <Tab.Group as="div" className="flex flex-col-reverse">
      <div className="mx-auto mt-6 w-full max-w-xl block lg:max-w-none">
        <Tab.List className="grid grid-cols-4 gap-4">
          {images.map((image, index) => (
            <Tab
              key={index}
              className="relative flex h-24 cursor-pointer items-center justify-center rounded-md bg-zinc-800"
            >
              {({ selected }) => (
                <>
                  <span className="sr-only">{`Image ${index + 1}`}</span>
                  <span className="absolute inset-0 overflow-hidden rounded-md">
                    <img
                      src={image || "/placeholder.svg"}
                      alt={`Thumbnail ${index + 1}`}
                      className="h-full w-full object-cover object-center"
                    />
                  </span>
                  <span
                    className={cn(
                      selected ? "ring-pink-500" : "ring-transparent",
                      "pointer-events-none absolute inset-0 rounded-md ring-2 ring-offset-2 ring-offset-zinc-900",
                    )}
                    aria-hidden="true"
                  />
                </>
              )}
            </Tab>
          ))}
        </Tab.List>
      </div>

      <Tab.Panels className="aspect-w-1 aspect-h-1 w-full">
        {images.map((image, index) => (
          <Tab.Panel key={index}>
            <img
              src={image || "/placeholder.svg"}
              alt={`Full-size image ${index + 1}`}
              className="h-full w-full object-cover object-center sm:rounded-lg"
            />
          </Tab.Panel>
        ))}
      </Tab.Panels>
    </Tab.Group>
  )
}
