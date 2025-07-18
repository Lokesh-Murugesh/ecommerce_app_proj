

export default function ImageCell({ src, alt }: { src: string, alt?: string }) {
    return <img src={src} alt={alt} className="h-10 w-10 object-cover rounded-md" />
}