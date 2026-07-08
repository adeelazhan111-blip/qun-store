import { NextResponse } from "next/server";
import { resend } from "@/lib/resend";
import { orderConfirmationEmail } from "@/lib/emails/order-confirmation";

export async function POST(req: Request) {
  try {
    const {
      customerName,
      email,
      orderId,
      items,
      total,
    } = await req.json();

    const { error } = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: `Your QUN Order #${orderId} is Confirmed`,
      html: orderConfirmationEmail({
        customerName,
        orderId,
        items,
        total,
      }),
    });

    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}