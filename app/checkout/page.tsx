"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "@/components/CartContext";
import { createClient } from "@/lib/supabase/client";
type CheckoutItem = {
  id: string;
  name: string;
  price: string;
  image: string;
  size: string;
  quantity: number;
};
declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CheckoutPage() {
  const { cart, clearCart } = useCart();
  const [checkoutItems, setCheckoutItems] =
  useState<CheckoutItem[]>(cart);
const [isBuyNow, setIsBuyNow] = useState(false);
  const supabase = createClient();
const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
const [defaultAddress, setDefaultAddress] = useState<any>(null);
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponLoading, setCouponLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [addresses, setAddresses] = useState<any[]>([]);
const [selectedAddress, setSelectedAddress] = useState<any>(null);

  const total = checkoutItems.reduce(
  (sum, item) =>
    sum + Number(item.price.replace("₹", "")) * item.quantity,
  0
);

  const finalTotal = Math.max(total - discount, 0);
  useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const buyNowMode = params.get("mode") === "buy-now";

  if (!buyNowMode) {
    setCheckoutItems(cart);
    setIsBuyNow(false);
    return;
  }

  const savedItem = sessionStorage.getItem("qun-buy-now-item");

  if (!savedItem) {
    setCheckoutItems(cart);
    return;
  }

  try {
    const parsedItem = JSON.parse(savedItem);

    setCheckoutItems([parsedItem]);
    setIsBuyNow(true);
  } catch {
    sessionStorage.removeItem("qun-buy-now-item");
    setCheckoutItems(cart);
  }
}, [cart]);
useEffect(() => {
  async function loadAddresses() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data, error } = await supabase
      .from("addresses")
      .select("*")
      .eq("user_id", user.id)
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: false });

    if (error || !data) return;

    setAddresses(data);

    const preferredAddress =
      data.find((address) => address.is_default) || data[0] || null;

    setSelectedAddress(preferredAddress);
    setDefaultAddress(preferredAddress);
  }

  loadAddresses();
}, []);

  async function loadRazorpayScript() {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }

  async function checkStock() {
    for (const item of checkoutItems) {
      const { data: sizeRow, error } = await supabase
        .from("product_sizes")
        .select("stock")
        .eq("product_id", item.id)
        .eq("size", item.size)
        .single();

      if (error || !sizeRow) {
        throw new Error(`Stock not found for ${item.name} size ${item.size}`);
      }

      if (sizeRow.stock < item.quantity) {
        throw new Error(
          `Only ${sizeRow.stock} left for ${item.name} size ${item.size}`
        );
      }
    }
  }

  async function applyCoupon() {
    if (!couponCode.trim()) {
      alert("Enter a coupon code");
      return;
    }

    setCouponLoading(true);

    const { data: coupon, error } = await supabase
      .from("coupons")
      .select("*")
      .eq("code", couponCode.trim().toUpperCase())
      .eq("active", true)
      .single();

    setCouponLoading(false);

    if (error || !coupon) {
      alert("Invalid coupon");
      return;
    }

    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      alert("Coupon has expired");
      return;
    }

    if (total < coupon.min_order) {
      alert(`Minimum order value is ₹${coupon.min_order}`);
      return;
    }

    let amount = 0;

    if (coupon.discount_type === "percentage") {
      amount = Math.round((total * coupon.discount_value) / 100);
    } else {
      amount = Number(coupon.discount_value);
    }

    if (amount > total) {
      amount = total;
    }

    setDiscount(amount);
    setAppliedCoupon(coupon);
    setCouponCode(coupon.code);

    alert("Coupon applied successfully!");
  }

  async function sendOrderEmail(formData: FormData, orderId: string) {
    await fetch("/api/send-order-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        customerName: String(formData.get("name")),
        email: String(formData.get("email")),
        orderId,
        items: checkoutItems.map((item) => ({
          name: item.name,
          size: item.size,
          quantity: item.quantity,
          price: Number(item.price.replace("₹", "")),
        })),
        total: finalTotal,
        discount,
        couponCode: appliedCoupon?.code ?? null,
      }),
    });
  }

  async function saveOrder(
  formData: FormData,
  paymentStatus: string,
  razorpayPaymentId?: string
) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const customer_name = String(formData.get("name") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const email = String(formData.get("email") || "").trim();
    const address = `
${formData.get("house")}
${formData.get("street")}
${formData.get("city")}, ${formData.get("state")}
PIN: ${formData.get("pin")}
Notes: ${formData.get("notes") || "None"}
Payment Method: ${paymentMethod}
Razorpay Payment ID: ${razorpayPaymentId || "N/A"}
    `.trim();

    const { data: order, error: orderError } = await supabase
  .from("orders")
  .insert({
    user_id: user?.id ?? null,
    customer_name,
    phone,
    email,
    address,
    total: finalTotal,
    coupon_code: appliedCoupon?.code ?? null,
    discount_amount: discount,
    payment_status: paymentStatus,
    order_status: "Pending",
  })
  .select()
  .single();

    if (orderError || !order) {
      throw new Error(orderError?.message || "Order could not be created");
    }

    const orderItems = checkoutItems.map((item) => ({
      order_id: order.id,
      product_id: item.id,
      product_name: item.name,
      size: item.size,
      quantity: item.quantity,
      price: Number(item.price.replace("₹", "")),
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (itemsError) {
      throw new Error(itemsError.message);
    }

    for (const item of checkoutItems) {
      const { data: sizeRow, error } = await supabase
        .from("product_sizes")
        .select("stock")
        .eq("product_id", item.id)
        .eq("size", item.size)
        .single();

      if (error || !sizeRow) {
        throw new Error("Could not update stock for " + item.name);
      }

      const { error: stockError } = await supabase
        .from("product_sizes")
        .update({
          stock: sizeRow.stock - item.quantity,
        })
        .eq("product_id", item.id)
        .eq("size", item.size);

      if (stockError) {
        throw new Error(stockError.message);
      }
    }

    return order;
  }

  async function handlePlaceOrder(
  e: React.FormEvent<HTMLFormElement>
) {
  e.preventDefault();
  setLoading(true);
  setMessage("");

  const formData = new FormData(e.currentTarget);

  // ✅ Add the validation HERE
  const phone = String(formData.get("phone") || "").trim();

  if (!/^[6-9]\d{9}$/.test(phone)) {
    setMessage(
      "❌ Enter a valid 10-digit Indian mobile number."
    );
    setLoading(false);
    return;
  }


    try {
      await checkStock();

      if (paymentMethod === "cod") {
        const order = await saveOrder(formData, "Pending");

        await sendOrderEmail(formData, order.id);

        if (isBuyNow) {
  sessionStorage.removeItem("qun-buy-now-item");
  setCheckoutItems([]);
} else {
  clearCart();
}

router.push(
  `/order-success?orderId=${order.id}&payment=pending`
);

return;
      }

      const scriptLoaded = await loadRazorpayScript();

      if (!scriptLoaded) {
        throw new Error("Razorpay failed to load.");
      }

      const orderResponse = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount: finalTotal }),
      });

      const razorpayOrder = await orderResponse.json();

      if (!orderResponse.ok) {
        throw new Error(razorpayOrder.error || "Could not create payment order");
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: razorpayOrder.amount,
        currency: "INR",
        name: "QUN",
        description: "QUN Clothing Order",
        order_id: razorpayOrder.id,
        handler: async function (response: any) {
          const verifyResponse = await fetch("/api/razorpay/verify-payment", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(response),
          });

          const verifyData = await verifyResponse.json();

          if (!verifyResponse.ok || !verifyData.success) {
            setMessage("❌ Payment verification failed.");
            setLoading(false);
            return;
          }

          const order = await saveOrder(
            formData,
            "Paid",
            response.razorpay_payment_id
          );

          await sendOrderEmail(formData, order.id);

          if (isBuyNow) {
  sessionStorage.removeItem("qun-buy-now-item");
  setCheckoutItems([]);
} else {
  clearCart();
}

router.push(
  `/order-success?orderId=${order.id}&payment=paid`
);
        },
        prefill: {
          name: String(formData.get("name") || ""),
          email: String(formData.get("email") || ""),
          contact: String(formData.get("phone") || ""),
        },
        theme: {
          color: "#000000",
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error: any) {
      setMessage("❌ " + error.message);
      setLoading(false);
    }
  }

  return (

    <main className="min-h-screen bg-white px-6 py-24">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12">
        <div>
          <h1 className="text-4xl font-bold mb-8">Checkout</h1>

{message && <p className="mb-5 font-medium">{message}</p>}

{addresses.length > 0 && (
  <div className="mb-8">
    <h2 className="mb-4 text-xl font-semibold">
      Choose a saved address
    </h2>

    <div className="grid gap-4">
      {addresses.map((address) => (
        <button
          key={address.id}
          type="button"
          onClick={() => {
            setSelectedAddress(address);
            setDefaultAddress(address);
          }}
          className={`rounded-xl border p-4 text-left ${
            selectedAddress?.id === address.id
              ? "border-black ring-2 ring-black"
              : ""
          }`}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="font-semibold">{address.full_name}</p>
              <p>{address.phone}</p>
              <p>
                {address.address}, {address.city}, {address.state} -{" "}
                {address.pincode}
              </p>
            </div>

            {address.is_default && (
              <span className="rounded-full bg-black px-3 py-1 text-xs text-white">
                Default
              </span>
            )}
          </div>
        </button>
      ))}
    </div>
  </div>
)}

<form onSubmit={handlePlaceOrder} className="space-y-5">

  <input
    name="name"
    type="text"
    placeholder="Full Name"
    required
    defaultValue={defaultAddress?.full_name || ""}
    className="w-full border rounded-lg p-4"
  />

  <input
  name="phone"
  type="tel"
  placeholder="Phone Number"
  required
  inputMode="numeric"
  pattern="[6-9][0-9]{9}"
  minLength={10}
  maxLength={10}
  title="Enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9"
  defaultValue={defaultAddress?.phone || ""}
  className="w-full rounded-lg border p-4"
/>

  <input
    name="email"
    type="email"
    placeholder="Email Address"
    required
    className="w-full border rounded-lg p-4"
  />

  <input
    name="house"
    type="text"
    placeholder="House / Flat No."
    required
    className="w-full border rounded-lg p-4"
  />

  <input
    name="street"
    type="text"
    placeholder="Street / Area"
    required
    defaultValue={defaultAddress?.address || ""}
    className="w-full border rounded-lg p-4"
  />

  <div className="grid grid-cols-2 gap-4">

    <input
      name="city"
      type="text"
      placeholder="City"
      required
      defaultValue={defaultAddress?.city || ""}
      className="border rounded-lg p-4"
    />

    <input
      name="state"
      type="text"
      placeholder="State"
      required
      defaultValue={defaultAddress?.state || ""}
      className="border rounded-lg p-4"
    />

  </div>

  <input
    name="pin"
    type="text"
    placeholder="PIN Code"
    required
    defaultValue={defaultAddress?.pincode || ""}
    className="w-full border rounded-lg p-4"
  />

  <textarea
  name="notes"
  placeholder="Order Notes (Optional)"
  rows={4}
  className="w-full border rounded-lg p-4"
/>

<div className="border rounded-xl p-5 space-y-3">
  <h2 className="font-semibold text-lg">
    Payment Method
  </h2>

  <label className="flex items-center gap-3">
    <input
      type="radio"
      checked={paymentMethod === "cod"}
      onChange={() => setPaymentMethod("cod")}
    />
    Cash on Delivery
  </label>

  <label className="flex items-center gap-3">
    <input
      type="radio"
      checked={paymentMethod === "razorpay"}
      onChange={() => setPaymentMethod("razorpay")}
    />
    Razorpay
  </label>
</div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-4 rounded-xl text-lg disabled:opacity-50"
            >
              {loading
                ? "Processing..."
                : paymentMethod === "razorpay"
                ? `Pay ₹${finalTotal} with Razorpay`
                : `Place COD Order ₹${finalTotal}`}
            </button>
          </form>
        </div>

        <div className="bg-gray-50 rounded-2xl p-8 h-fit">
          <h2 className="text-2xl font-bold mb-6">Order Summary</h2>

          <div className="space-y-5">
            {checkoutItems.map((item) => (
              <div key={`${item.id}-${item.size}`} className="flex justify-between border-b pb-4">
                <div>
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-gray-500">
                    Size: {item.size} × {item.quantity}
                  </p>
                </div>

                <p className="font-semibold">
                  ₹{Number(item.price.replace("₹", "")) * item.quantity}
                </p>
              </div>
            ))}
          </div>

          <div className="border-t mt-6 pt-6 space-y-4">
            {appliedCoupon && (
  <div className="mb-4 rounded-xl bg-green-50 p-4 border border-green-200">
    <p className="font-semibold text-green-700">
      Coupon Applied
    </p>

    <p className="text-green-600">
      {appliedCoupon.code}
    </p>
  </div>
)}
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₹{total}</span>
            </div>

            {discount > 0 && (
              <div className="flex justify-between text-green-700">
                <span>Discount</span>
                <span>-₹{discount}</span>
              </div>
            )}

            <div className="flex justify-between text-2xl font-bold pt-4 border-t">
              <span>Total</span>
              <span>₹{finalTotal}</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}