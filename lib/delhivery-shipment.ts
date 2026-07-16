const DELHIVERY_API_BASE_URL =
  process.env.DELHIVERY_API_BASE_URL!;

const DELHIVERY_API_TOKEN =
  process.env.DELHIVERY_API_TOKEN!;

const DELHIVERY_PICKUP_NAME =
  process.env.DELHIVERY_PICKUP_NAME!;

if (
  !DELHIVERY_API_BASE_URL ||
  !DELHIVERY_API_TOKEN ||
  !DELHIVERY_PICKUP_NAME
) {
  throw new Error(
    "Delhivery environment variables are missing."
  );
}

export type ShipmentAddress = {
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
};

export type ShipmentItem = {
  name: string;
  quantity: number;
  price: number;
};

export type ShipmentRequest = {
  orderId: string;
  paymentMode: "COD" | "Pre-paid";
  total: number;
  address: ShipmentAddress;
  items: ShipmentItem[];
};

export async function createShipment(
  shipment: ShipmentRequest
) {
  // Delhivery API implementation will go here
  return shipment;
}