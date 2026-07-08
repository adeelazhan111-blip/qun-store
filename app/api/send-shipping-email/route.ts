import { NextResponse } from "next/server";
import { resend } from "@/lib/resend";

export async function POST(req: Request) {
  try {
    const { orderId } = await req.json();

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/orders?id=eq.${orderId}&select=*`,
      {
        headers: {
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
        },
      }
    );

    const orders = await response.json();
    const order = orders[0];

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    const { error } = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: order.email,
      subject: `Your QUN Order #${order.id} has Shipped`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; color: #111;">
          <h1 style="letter-spacing: 6px; text-align: center;">QUN</h1>
          <h2>Your order has shipped 🚚</h2>
          <p>Hi ${order.customer_name},</p>
          <p>Your QUN order is now on the way.</p>
          <p><strong>Order ID:</strong> ${order.id}</p>
          <p>We’ll update you again once your order is delivered.</p>
          <p>Thanks for choosing QUN.</p>
          <p><strong>Team QUN</strong></p>
        </div>
      `,
    });

    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to send shipping email" },
      { status: 500 }
    );
  }
}