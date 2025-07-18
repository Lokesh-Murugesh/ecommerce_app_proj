import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { useState } from "react";

export default function MoreProductDetails({ categoryProduct }: { categoryProduct: any }) {
    const [open, setOpen] = useState(false);
    return (
        <Accordion type="multiple" className="rounded-lg ">
            {Object.entries(categoryProduct.details).map(([title, features]: [any, any], index) => (
                <AccordionItem key={index} value={`item-${index}`} className="">
                    <AccordionTrigger onClick={()=>{setOpen(!open)}}>
                        <span className='text-sm font-medium'>
                            {title}
                        </span>
                    </AccordionTrigger>
                    <AccordionContent className="">
                        <ul role="list" className="font-mono font-semibold text-white">
                            {features.map((item: any) => (
                                <li key={item}>{item}</li>
                            ))}
                        </ul>
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
    );
};