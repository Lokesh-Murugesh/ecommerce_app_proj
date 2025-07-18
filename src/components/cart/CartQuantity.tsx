import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";

export default function QuantitySelector({ productIdx, product, allProducts, handleQuantityChange }: { productIdx: number, product: any, allProducts: any[], handleQuantityChange: any }) {
    const availableQuantity = allProducts?.find((p: any) => p.id === product.itemId)?.variants.find((v: any) => v.size === product.size)?.available ?? 0;

    return (
        <Select
            onValueChange={(value) => handleQuantityChange(product.itemId, parseInt(value), product.size)}
            value={String(product.quantity)}
        >
            <SelectTrigger id={`quantity-${productIdx}`} className="max-w-fit gap-x-2 rounded-md border-black border-2 bg-transparent py-1.5 text-center font-bold text-xl leading-5 text-black shadow-sm focus:outline-none sm:text-sm">
                <SelectValue placeholder="Select quantity" className="w-4" />
            </SelectTrigger>
            <SelectContent className="bg-foreground font-medium border-black">
                {
                    Array.from({ length: availableQuantity }, (_, i) => i + 1).map(i => (
                        <SelectItem key={i} value={String(i)} className="max-w-fit focus:bg-outlaw-blue focus:text-white focus:border-black focus:border-2 focus:rounded-md">
                            {i}
                        </SelectItem>
                    ))
                }
            </SelectContent>
        </Select>
    );
};