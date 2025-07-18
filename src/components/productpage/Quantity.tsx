import React from 'react';
import { Button } from '@/components/ui/button';
import { Minus, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

const QuantitySelector = ({ quantity, setQuantity, available }: { quantity: number, setQuantity: any, available: number }) => {
    const handleIncrement = () => {
        if (quantity < available) {
            setQuantity(quantity + 1);
        } else {
            if (quantity == 1){
                toast.error("Select a size first!");
            }
            else {
                toast.error("Maximum quantity reached");
            }
            
        }
    };

    const handleDecrement = () => {
        if (quantity > 1) {
            setQuantity(quantity - 1);
        } else {
            toast.error("Minimum quantity is 1");
        }
    };

    return (
        <div className="flex items-center text-center">
            <Button
                onClick={handleDecrement}
                className="ml-2 bg-foreground text-black shadow-dark border-2 border-outlaw-blue hover:bg-foreground hover:shadow-none hover:translate-x-1 hover:translate-y-1"
            >
                <Minus className='w-4 p-0' strokeWidth={3}></Minus>
            </Button>
            <div className="w-16 ml-4 text-lg font-bold">
                {quantity}
            </div>
            <Button
                onClick={handleIncrement}
                className="ml-2 bg-foreground text-black shadow-dark border-2 border-outlaw-blue hover:bg-foreground hover:shadow-none hover:translate-x-1 hover:translate-y-1"
            >
                <Plus className='w-4 p-0' strokeWidth={3}></Plus>
            </Button>
        </div>
    );
};

export default QuantitySelector;
