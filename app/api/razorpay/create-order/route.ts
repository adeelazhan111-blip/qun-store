import { NextResponse } from "next/server";
import { razorpay } from "@/lib/razorpay";

export async function POST(request: Request) {
  try {
    const { amount } = await request.json();

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid amount" },
        { status: 400 }
      );
    }

    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error("Razorpay create order error:", error);

    return NextResponse.json(
      { error: "Could not create Razorpay order" },
      { status: 500 }
    );
  }
}