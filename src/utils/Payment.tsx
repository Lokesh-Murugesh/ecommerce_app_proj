import useRazorpay, { RazorpayOptions } from "react-razorpay";

type PaymentSuccessResponse = {
    razorpay_signature: string;
    razorpay_order_id: string;
    razorpay_payment_id: string;
}

type PayOptions = {
    description?: string
    name: string
    onPaid(response: PaymentSuccessResponse): void
}

type Prefill = {
    name?: string
    email?: string
    contact?: string
    method?: "netbanking" | "upi" | "card" | "wallet" | "emi"
}

type Payment = {
    pay(amountInPaise: number, options: PayOptions, prefill?: Prefill, receipt?: string, notes?: Record<string, string>): void
}


function usePayment(paymentGateway: string) {
    const pay = async (amount: number, order: any, customer: any) => {
        if (paymentGateway === 'razorpay') {
            // --- SIMULATE RAZORPAY PAYMENT SUCCESS ---
            console.log("Simulating Razorpay payment success...");
            // Directly call onPaid with a dummy payment ID after a short delay
            setTimeout(() => {
                const dummyPaymentId = 'pay_dummySuccess12345'; // A dummy ID
                order.onPaid({ razorpay_payment_id: dummyPaymentId });
                console.log("Simulated payment successful with ID:", dummyPaymentId);
            }, 1000); // Simulate a 1-second delay for processing
            // --- END SIMULATION ---

            // Original Razorpay integration (commented out for simulation)
            /*
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: amount,
                currency: 'EUR', // Ensure this matches your currency
                name: order.name,
                description: order.description,
                image: '/logo.png', // Or your company logo
                handler: function (response: any) {
                    order.onPaid(response);
                },
                prefill: {
                    name: customer.name,
                    email: customer.email,
                    contact: customer.phone, // Assuming you have phone in customer object
                },
                notes: {
                    address: customer.address,
                },
                theme: {
                    color: '#F97316', // Orange color
                },
            };

            const rzp = new (window as any).Razorpay(options);
            rzp.open();
            */
        } else {
            console.error('Unsupported payment gateway:', paymentGateway);
            alert('Payment gateway not supported.');
        }
    };

    return { pay };
}

import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
export default function makeRazorPayCreateOrderHandler(key_id: string | undefined, key_secret: string | undefined): NextApiHandler {
    if (!(key_id && key_secret)) {
        throw Error("Must set NEXT_RAZORPAY_KEY_ID and RAZORPAY_SECRET before setting up orderCreate endpoint")
    }
    
    return async (req: NextApiRequest, res: NextApiResponse) => {
        if (!razorPayRequestBodyvalidate(req.body)) {
            res.status(400).send({ code: "BAD_REQUEST", message: "fields amount and currency are required" })
        }

        function generateAuthorizationHeader(keyId: string, keySecret: string): string {
            const base64token = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
            return `Basic ${base64token}`;
        }

        const response = await fetch("https://api.razorpay.com/v1/orders", {
            method: "POST",
            headers: {
                'Authorization': generateAuthorizationHeader(key_id, key_secret),
                'Content-Type': 'application/json',
                'User-Agent': `${key_id}:${key_secret}`
            },
            body: JSON.stringify({
                amount: req.body.amount,
                currency: req.body.currency,
                receipt: req.body.receipt ?? ""
            })
        })
        if (!response.ok) res.status(500).send({ code: "ORDER_ERROR", message: await response.text() })

        const data = await response.json()

        res.status(200).send({ orderId: data.id })
    }
}

function razorPayRequestBodyvalidate(body: any) {
    const required = ['amount', 'currency']

    required.forEach(key => {
        if (!Object.keys(body).includes(key)) {
            return false
        }
    })

    return true
}

export { usePayment, makeRazorPayCreateOrderHandler }