import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  return NextResponse.json({
    success: true,
    message: "Delhivery shipment route is working",
    received: body,
  });
}