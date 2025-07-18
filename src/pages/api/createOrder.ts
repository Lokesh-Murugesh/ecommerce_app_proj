import makeRazorPayCreateOrderHandler from "@/utils/Payment";

export default makeRazorPayCreateOrderHandler(process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, process.env.RAZORPAY_SECRET)
