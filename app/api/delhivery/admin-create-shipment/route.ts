import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { POST as createShipmentPOST } from "../create-shipment/route";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RequestBody = {
  orderId?: string;
  confirmLiveShipment?: boolean;
};

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: "You must be signed in as an admin",
        },
        { status: 401 }
      );
    }

    let body: RequestBody;

    try {
      body = (await request.json()) as RequestBody;
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid JSON request body",
        },
        { status: 400 }
      );
    }

    const orderId = String(body.orderId ?? "").trim();

    if (!orderId) {
      return NextResponse.json(
        {
          success: false,
          error: "orderId is required",
        },
        { status: 400 }
      );
    }

    if (body.confirmLiveShipment !== true) {
      return NextResponse.json(
        {
          success: false,
          error: "Live shipment confirmation is required",
        },
        { status: 400 }
      );
    }

    const secret =
      process.env.DELHIVERY_SHIPMENT_SECRET?.trim();

    if (!secret) {
      return NextResponse.json(
        {
          success: false,
          error:
            "DELHIVERY_SHIPMENT_SECRET is missing from .env.local",
        },
        { status: 500 }
      );
    }

    const internalRequest = new Request(
      new URL("/api/delhivery/create-shipment", request.url),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-delhivery-shipment-secret": secret,

          // Preserve the signed-in user's cookies.
          cookie: request.headers.get("cookie") ?? "",
        },
        body: JSON.stringify({
          orderId,
          confirmLiveShipment: true,
        }),
      }
    );

    return await createShipmentPOST(internalRequest);
  } catch (error) {
    console.error(
      "Admin Delhivery shipment request failed:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to create shipment",
      },
      { status: 500 }
    );
  }
}