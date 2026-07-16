import { NextResponse } from "next/server";
import { checkDelhiveryPincode } from "@/lib/delhivery";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pincode = searchParams.get("pincode")?.trim() ?? "";

    if (!/^\d{6}$/.test(pincode)) {
      return NextResponse.json(
        {
          success: false,
          error: "Enter a valid 6-digit pincode",
        },
        { status: 400 }
      );
    }

    const result = await checkDelhiveryPincode(pincode);

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Delhivery pincode check failed:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to check delivery availability",
      },
      { status: 500 }
    );
  }
}