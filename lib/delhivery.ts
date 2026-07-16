const DELHIVERY_API_BASE_URL =
  process.env.DELHIVERY_API_BASE_URL?.trim() ||
  "https://staging-express.delhivery.com";

function getDelhiveryToken(): string {
  const token = process.env.DELHIVERY_API_TOKEN?.trim();

  if (!token) {
    throw new Error(
      "DELHIVERY_API_TOKEN is missing from your .env.local file"
    );
  }

  return token;
}

type DelhiveryPostalCode = {
  pin?: number | string;
  city?: string;
  district?: string;
  state_code?: string;
  country_code?: string;
  cod?: string;
  cash?: string;
  prepaid?: string;
  pickup?: string;
  [key: string]: unknown;
};

type DelhiveryPincodeResponse = {
  delivery_codes?: Array<{
    postal_code?: DelhiveryPostalCode;
    [key: string]: unknown;
  }>;
};

function isEnabled(value: unknown): boolean {
  return ["Y", "YES", "TRUE", "1"].includes(
    String(value ?? "").trim().toUpperCase()
  );
}

export async function checkDelhiveryPincode(pincode: string) {
  const normalizedPincode = pincode.trim();

  if (!/^\d{6}$/.test(normalizedPincode)) {
    throw new Error("A valid 6-digit pincode is required");
  }

  const url = new URL(
    "/c/api/pin-codes/json/",
    DELHIVERY_API_BASE_URL
  );

  url.searchParams.set("filter_codes", normalizedPincode);

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Token ${getDelhiveryToken()}`,
    },
    cache: "no-store",
  });

  const responseText = await response.text();

  let data: DelhiveryPincodeResponse;

  try {
    data = responseText
      ? (JSON.parse(responseText) as DelhiveryPincodeResponse)
      : {};
  } catch {
    throw new Error(
      `Delhivery returned an invalid response: ${responseText}`
    );
  }

  if (!response.ok) {
    console.error("Delhivery pincode API error:", {
      status: response.status,
      data,
    });

    if (response.status === 401 || response.status === 403) {
      throw new Error(
        "Delhivery authentication failed. Check DELHIVERY_API_TOKEN."
      );
    }

    throw new Error(
      `Delhivery request failed with status ${response.status}`
    );
  }

  const postalCode = data.delivery_codes?.[0]?.postal_code;

  if (!postalCode) {
    return {
      serviceable: false,
      codAvailable: false,
      prepaidAvailable: false,
      pincode: normalizedPincode,
      location: null,
    };
  }

  const codValue = postalCode.cod ?? postalCode.cash;
  const prepaidValue = postalCode.prepaid;

  return {
    serviceable: true,
    codAvailable: isEnabled(codValue),
    prepaidAvailable:
      prepaidValue === undefined ||
      prepaidValue === null ||
      String(prepaidValue).trim() === ""
        ? true
        : isEnabled(prepaidValue),
    pincode: normalizedPincode,
    location: {
      city: String(postalCode.city ?? ""),
      district: String(postalCode.district ?? ""),
      stateCode: String(postalCode.state_code ?? ""),
      countryCode: String(postalCode.country_code ?? "IN"),
    },
  };
}