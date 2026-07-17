import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  createShipment,
  type ShipmentAddress,
  type ShipmentItem,
} from "@/lib/delhivery-shipment";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type CreateShipmentBody = {
  orderId?: string;
  confirmLiveShipment?: boolean;
};

type DatabaseOrder = {
  id: string;
  customer_name?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;

  address_line1?: string | null;
  address_line2?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;

  total?: number | string | null;
  payment_method?: string | null;
  payment_status?: string | null;

  delhivery_awb?: string | null;
  delhivery_shipment_id?: string | null;
  delhivery_status?: string | null;
  delhivery_tracking_url?: string | null;
};

type DatabaseOrderItem = {
  product_id?: string | null;
  product_name?: string | null;
  name?: string | null;
  size?: string | null;
  quantity?: number | string | null;
  price?: number | string | null;
};

function cleanText(value: unknown): string {
  return String(value ?? "").trim();
}

function numberValue(value: unknown, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function extractLegacyValue(address: string, label: string): string {
  const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const match = address.match(
    new RegExp(`^${escapedLabel}\\s*:\\s*(.+)$`, "im")
  );

  return match?.[1]?.trim() ?? "";
}

function getLegacyAddressLines(address: string): string[] {
  return address
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function cleanLegacyAddress(address: string): string {
  return getLegacyAddressLines(address)
    .filter(
      (line) =>
        !/^(pin|notes|payment method|razorpay payment id)\s*:/i.test(line)
    )
    .join(", ");
}

/*
 * Your older checkout stores the address like:
 *
 * House / Flat
 * Street / Area
 * City, State
 * PIN: 847211
 * Notes: ...
 * Payment Method: cod
 */
function parseLegacyCityAndState(address: string) {
  const visibleLines = getLegacyAddressLines(address).filter(
    (line) =>
      !/^(pin|notes|payment method|razorpay payment id)\s*:/i.test(line)
  );

  const possibleCityStateLine = visibleLines.find((line, index) => {
    return index >= 2 && line.includes(",");
  });

  if (!possibleCityStateLine) {
    return {
      city: "",
      state: "",
    };
  }

  const [city, ...stateParts] = possibleCityStateLine.split(",");

  return {
    city: cleanText(city),
    state: cleanText(stateParts.join(",")),
  };
}

function normalizePaymentMode(
  order: DatabaseOrder
): "COD" | "Pre-paid" {
  const legacyPaymentMethod = extractLegacyValue(
    cleanText(order.address),
    "Payment Method"
  );

  const paymentMethod =
    cleanText(order.payment_method) || legacyPaymentMethod;

  return paymentMethod.toLowerCase() === "cod"
    ? "COD"
    : "Pre-paid";
}

function buildShipmentAddress(
  order: DatabaseOrder
): ShipmentAddress {
  const legacyAddress = cleanText(order.address);
  const legacyLocation = parseLegacyCityAndState(legacyAddress);

  const structuredAddress = [
    cleanText(order.address_line1),
    cleanText(order.address_line2),
  ]
    .filter(Boolean)
    .join(", ");

  const pincode =
    cleanText(order.pincode) ||
    extractLegacyValue(legacyAddress, "PIN");

  return {
    name: cleanText(order.customer_name),
    phone: cleanText(order.phone),
    email: cleanText(order.email),

    address:
      structuredAddress ||
      cleanLegacyAddress(legacyAddress),

    city:
      cleanText(order.city) ||
      legacyLocation.city,

    state:
      cleanText(order.state) ||
      legacyLocation.state,

    pincode,
    country: "India",
  };
}

function buildShipmentItems(
  items: DatabaseOrderItem[]
): ShipmentItem[] {
  return items.map((item) => {
    const productName =
      cleanText(item.product_name) ||
      cleanText(item.name) ||
      "QUN Product";

    const size = cleanText(item.size);

    return {
      name: size
        ? `${productName} - Size ${size}`
        : productName,

      quantity: Math.max(
        1,
        numberValue(item.quantity, 1)
      ),

      price: Math.max(
        0,
        numberValue(item.price)
      ),

      sku: cleanText(item.product_id),
    };
  });
}

export async function POST(request: Request) {
  try {
    /*
     * Internal safety secret.
     *
     * Never expose this through a NEXT_PUBLIC variable.
     */
    const suppliedSecret = request.headers.get(
      "x-delhivery-shipment-secret"
    );

    const expectedSecret =
      process.env.DELHIVERY_SHIPMENT_SECRET?.trim();

    if (!expectedSecret) {
      return NextResponse.json(
        {
          success: false,
          error:
            "DELHIVERY_SHIPMENT_SECRET is missing from .env.local",
        },
        { status: 500 }
      );
    }

    if (suppliedSecret !== expectedSecret) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized shipment request",
        },
        { status: 401 }
      );
    }

    let body: CreateShipmentBody;

    try {
      body =
        (await request.json()) as CreateShipmentBody;
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid JSON request body",
        },
        { status: 400 }
      );
    }

    const orderId = cleanText(body.orderId);

    if (!orderId) {
      return NextResponse.json(
        {
          success: false,
          error: "orderId is required",
        },
        { status: 400 }
      );
    }

    /*
     * Prevent accidental live shipment creation.
     */
    if (body.confirmLiveShipment !== true) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Set confirmLiveShipment to true to create a live shipment",
        },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        {
          success: false,
          error:
            "You must be signed in before creating a shipment",
        },
        { status: 401 }
      );
    }

    const { data: orderData, error: orderError } =
      await supabase
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .single();

    if (orderError || !orderData) {
      console.error(
        "Delhivery order lookup failed:",
        orderError
      );

      return NextResponse.json(
        {
          success: false,
          error: "Order not found",
        },
        { status: 404 }
      );
    }

    const order = orderData as DatabaseOrder;

    /*
     * Duplicate protection.
     *
     * Never allocate another AWB when the order already
     * contains one.
     */
    if (cleanText(order.delhivery_awb)) {
      return NextResponse.json(
        {
          success: false,
          error:
            "A Delhivery shipment already exists for this order",

          existingShipment: {
            awb: order.delhivery_awb,
            shipmentId:
              order.delhivery_shipment_id,
            status: order.delhivery_status,
            trackingUrl:
              order.delhivery_tracking_url,
          },
        },
        { status: 409 }
      );
    }

    const { data: itemData, error: itemError } =
      await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", orderId)
        .order("id", { ascending: true });

    if (itemError) {
      console.error(
        "Delhivery order-items lookup failed:",
        itemError
      );

      return NextResponse.json(
        {
          success: false,
          error: "Unable to load order items",
        },
        { status: 500 }
      );
    }

    const databaseItems =
      (itemData ?? []) as DatabaseOrderItem[];

    if (!databaseItems.length) {
      return NextResponse.json(
        {
          success: false,
          error: "The order contains no items",
        },
        { status: 400 }
      );
    }

    const address = buildShipmentAddress(order);

    if (!address.name) {
      return NextResponse.json(
        {
          success: false,
          error: "Customer name is missing",
        },
        { status: 400 }
      );
    }

    if (!address.address) {
      return NextResponse.json(
        {
          success: false,
          error: "Delivery address is missing",
        },
        { status: 400 }
      );
    }

    if (!/^[6-9]\d{9}$/.test(
      address.phone.replace(/\D/g, "").slice(-10)
    )) {
      return NextResponse.json(
        {
          success: false,
          error:
            "A valid Indian customer phone number is required",
        },
        { status: 400 }
      );
    }

    if (!address.city || !address.state) {
      return NextResponse.json(
        {
          success: false,
          error:
            "City or state could not be read from the order",

          parsedAddress: address,
        },
        { status: 400 }
      );
    }

    if (!/^\d{6}$/.test(address.pincode)) {
      return NextResponse.json(
        {
          success: false,
          error:
            "A valid 6-digit delivery pincode is required",
        },
        { status: 400 }
      );
    }

    const items =
      buildShipmentItems(databaseItems);

    const paymentMode =
      normalizePaymentMode(order);

    const total = Math.max(
      0,
      numberValue(order.total)
    );

    const shipment = await createShipment({
      orderId: order.id,
      paymentMode,
      total,
      address,
      items,

      /*
       * Temporary default package measurements.
       * These can later be calculated per product.
       */
      weightKg: 0.5,
      lengthCm: 30,
      widthCm: 25,
      heightCm: 5,

      invoiceNumber: `QUN-${order.id
        .slice(0, 8)
        .toUpperCase()}`,
    });

    const { error: updateError } = await supabase
      .from("orders")
      .update({
        delhivery_awb: shipment.awb,

        delhivery_shipment_id:
          shipment.shipmentId,

        delhivery_status:
          shipment.status,

        delhivery_tracking_url:
          shipment.trackingUrl,

        delhivery_shipment_created_at:
          new Date().toISOString(),
      })
      .eq("id", order.id)
      .is("delhivery_awb", null);

    if (updateError) {
      /*
       * Delhivery may already have created the shipment.
       * Do not blindly retry if this happens.
       */
      console.error(
        "Delhivery shipment created but database update failed:",
        {
          updateError,
          shipment,
          orderId: order.id,
        }
      );

      return NextResponse.json(
        {
          success: false,

          error:
            "Shipment was created, but the AWB could not be saved. Do not retry until the Delhivery account is checked.",

          shipment,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message:
        "Delhivery shipment created successfully",

      shipment: {
        awb: shipment.awb,
        shipmentId: shipment.shipmentId,
        status: shipment.status,
        trackingUrl: shipment.trackingUrl,
        remarks: shipment.remarks,
      },
    });
  } catch (error) {
    console.error(
      "Delhivery shipment creation failed:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        error:
          error instanceof Error
            ? error.message
            : "Unable to create Delhivery shipment",
      },
      { status: 500 }
    );
  }
}