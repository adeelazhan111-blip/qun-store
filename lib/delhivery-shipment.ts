const DELHIVERY_API_BASE_URL =
  process.env.DELHIVERY_API_BASE_URL?.trim() ||
  "https://track.delhivery.com";

function requireEnvironmentVariable(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`${name} is missing from .env.local`);
  }

  return value;
}

function cleanValue(value: unknown): string {
  return String(value ?? "")
    .replace(/[&#%;\\]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizePhone(value: string): string {
  const digits = value.replace(/\D/g, "");
  return digits.length > 10 ? digits.slice(-10) : digits;
}

function normalizePincode(value: string): string {
  return value.replace(/\D/g, "").slice(0, 6);
}

function roundMoney(value: number): number {
  return Math.round((Number(value) || 0) * 100) / 100;
}

function normalizeWeight(value?: number): number {
  const weight = Number(value);

  if (!Number.isFinite(weight) || weight <= 0) {
    return 0.5;
  }

  return weight;
}

export type ShipmentAddress = {
  name: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  country?: string;
};

export type ShipmentItem = {
  name: string;
  quantity: number;
  price: number;
  sku?: string;
  hsnCode?: string;
};

export type ShipmentRequest = {
  orderId: string;
  paymentMode: "COD" | "Pre-paid";
  total: number;
  address: ShipmentAddress;
  items: ShipmentItem[];

  /**
   * Weight in kilograms.
   * Example: 500 grams = 0.5
   */
  weightKg?: number;

  lengthCm?: number;
  widthCm?: number;
  heightCm?: number;

  invoiceNumber?: string;
  sellerGstin?: string;
  hsnCode?: string;
};

type DelhiveryShipmentPayload = {
  name: string;
  add: string;
  pin: string;
  city: string;
  state: string;
  country: string;
  phone: string;
  email: string;
  order: string;
  payment_mode: "COD" | "Pre-paid";
  cod_amount: number;
  total_amount: number;
  products_desc: string;
  quantity: number;
  weight: number;
  shipment_width: number;
  shipment_height: number;
  shipment_length: number;
  waybill: string;
  shipping_mode: string;
  seller_name: string;
  seller_add: string;
  seller_inv: string;
  seller_gst_tin?: string;
  hsn_code?: string;
};

type DelhiveryCreatePayload = {
  shipments: DelhiveryShipmentPayload[];
  pickup_location: {
    name: string;
  };
};

type DelhiveryPackageResponse = {
  waybill?: string;
  status?: string;
  remarks?: string[];
  refnum?: string;
  order?: string;
  client?: string;
  sort_code?: string;
  [key: string]: unknown;
};

type DelhiveryCreateResponse = {
  success?: boolean;
  upload_wbn?: string;
  package_count?: number;
  packages?: DelhiveryPackageResponse[];
  rmks?: string;
  remarks?: string[];
  error?: string | string[];
  [key: string]: unknown;
};

export type CreatedDelhiveryShipment = {
  success: true;
  awb: string;
  shipmentId: string;
  status: string;
  trackingUrl: string;
  remarks: string[];
  raw: DelhiveryCreateResponse;
};

function getErrorMessage(data: DelhiveryCreateResponse): string {
  if (Array.isArray(data.error)) {
    return data.error.join(", ");
  }

  if (typeof data.error === "string" && data.error) {
    return data.error;
  }

  if (Array.isArray(data.remarks) && data.remarks.length) {
    return data.remarks.join(", ");
  }

  if (typeof data.rmks === "string" && data.rmks) {
    return data.rmks;
  }

  const packageRemarks = data.packages
    ?.flatMap((item) => item.remarks ?? [])
    .filter(Boolean);

  if (packageRemarks?.length) {
    return packageRemarks.join(", ");
  }

  return "Delhivery could not create the shipment";
}

export async function createShipment(
  shipment: ShipmentRequest
): Promise<CreatedDelhiveryShipment> {
  const token = requireEnvironmentVariable("DELHIVERY_API_TOKEN");
  const pickupName = requireEnvironmentVariable("DELHIVERY_PICKUP_NAME");

  // Delhivery documentation also refers to this as the registered client name.
  const clientName =
    process.env.DELHIVERY_CLIENT_NAME?.trim() || pickupName;

  const phone = normalizePhone(shipment.address.phone);
  const pincode = normalizePincode(shipment.address.pincode);

  if (!/^[6-9]\d{9}$/.test(phone)) {
    throw new Error("Shipment requires a valid 10-digit Indian phone number");
  }

  if (!/^\d{6}$/.test(pincode)) {
    throw new Error("Shipment requires a valid 6-digit pincode");
  }

  if (!shipment.items.length) {
    throw new Error("At least one shipment item is required");
  }

  const totalQuantity = shipment.items.reduce(
    (sum, item) => sum + Math.max(1, Number(item.quantity) || 1),
    0
  );

  const productDescription = cleanValue(
    shipment.items
      .map((item) => {
        const quantity = Math.max(1, Number(item.quantity) || 1);
        return `${item.name} x ${quantity}`;
      })
      .join(", ")
  ).slice(0, 250);

  const itemHsnCodes = shipment.items
    .map((item) => cleanValue(item.hsnCode))
    .filter(Boolean);

  const hsnCode =
    cleanValue(shipment.hsnCode) ||
    itemHsnCodes.join(",") ||
    process.env.DELHIVERY_DEFAULT_HSN_CODE?.trim() ||
    "";

  const sellerAddress =
    process.env.DELHIVERY_SELLER_ADDRESS?.trim() || pickupName;

  const payload: DelhiveryCreatePayload = {
    pickup_location: {
      name: pickupName,
    },

    shipments: [
      {
        name: cleanValue(shipment.address.name),
        add: cleanValue(shipment.address.address),
        pin: pincode,
        city: cleanValue(shipment.address.city),
        state: cleanValue(shipment.address.state),
        country: cleanValue(shipment.address.country || "India"),
        phone,
        email: cleanValue(shipment.address.email),

        // Must be unique when Delhivery dynamically allocates the AWB.
        order: cleanValue(shipment.orderId),

        payment_mode: shipment.paymentMode,
        cod_amount:
          shipment.paymentMode === "COD"
            ? roundMoney(shipment.total)
            : 0,
        total_amount: roundMoney(shipment.total),

        products_desc: productDescription || "QUN clothing order",
        quantity: totalQuantity,

        weight: normalizeWeight(shipment.weightKg),
        shipment_length: Math.max(1, Number(shipment.lengthCm) || 30),
        shipment_width: Math.max(1, Number(shipment.widthCm) || 25),
        shipment_height: Math.max(1, Number(shipment.heightCm) || 5),

        // Empty waybill asks Delhivery to allocate one dynamically.
        waybill: "",
        shipping_mode: "Surface",

        seller_name: cleanValue(clientName),
        seller_add: cleanValue(sellerAddress),
        seller_inv: cleanValue(
          shipment.invoiceNumber || `QUN-${shipment.orderId.slice(0, 8)}`
        ),

        ...(shipment.sellerGstin
          ? { seller_gst_tin: cleanValue(shipment.sellerGstin) }
          : {}),

        ...(hsnCode ? { hsn_code: hsnCode } : {}),
      },
    ],
  };

  const body = new URLSearchParams();
  body.set("format", "json");
  body.set("data", JSON.stringify(payload));

  const response = await fetch(
    `${DELHIVERY_API_BASE_URL}/api/cmu/create.json`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Token ${token}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
      cache: "no-store",
    }
  );

  const responseText = await response.text();

  let data: DelhiveryCreateResponse;

  try {
    data = responseText
      ? (JSON.parse(responseText) as DelhiveryCreateResponse)
      : {};
  } catch {
    throw new Error(
      `Delhivery returned an invalid response: ${responseText.slice(0, 300)}`
    );
  }

  if (!response.ok) {
    throw new Error(
      `Delhivery request failed (${response.status}): ${getErrorMessage(data)}`
    );
  }

  const firstPackage = data.packages?.[0];

  const awb = cleanValue(
    firstPackage?.waybill || data.upload_wbn
  );

  const packageRemarks = firstPackage?.remarks ?? [];
  const successfulResponse =
    data.success === true ||
    Boolean(awb) ||
    firstPackage?.status?.toLowerCase() === "success";

  if (!successfulResponse || !awb) {
    console.error("Delhivery shipment creation failed:", data);
    throw new Error(getErrorMessage(data));
  }

  return {
    success: true,
    awb,
    shipmentId: cleanValue(
      firstPackage?.refnum ||
        firstPackage?.order ||
        shipment.orderId
    ),
    status: cleanValue(firstPackage?.status || "Manifested"),
    trackingUrl: `https://www.delhivery.com/track/package/${encodeURIComponent(
      awb
    )}`,
    remarks: packageRemarks,
    raw: data,
  };
}