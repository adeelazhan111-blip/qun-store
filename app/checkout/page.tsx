"use client";

import { useState } from "react";
import { useCart } from "@/components/CartContext";
import { createClient } from "@/lib/supabase/client";

export default function CheckoutPage() {
  const { cart } = useCart();
  const supabase = createClient();

  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const total = cart.reduce(
    (sum, item) => sum + Number(item.price.replace("₹", "")) * item.quantity,
    0
  );

  async function handlePlaceOrder(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (cart.length === 0) {
      setMessage("❌ Your cart is empty.");
      return;
    }

    setLoading(true);
    setMessage("");

    const formData = new FormData(e.currentTarget);

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
    `.trim();

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        customer_name,
        phone,
        email,
        address,
        total,
        payment_status: paymentMethod === "cod" ? "Pending" : "Pending",
        order_status: "Pending",
      })
      .select()
      .single();

    if (orderError || !order) {
      setMessage("❌ Order error: " + orderError?.message);
      setLoading(false);
      return;
    }

    const orderItems = cart.map((item) => ({
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
      setMessage("❌ Order item error: " + itemsError.message);
      setLoading(false);
      return;
    }
    for (const item of cart) {
      
  const { data: sizeRow, error: fetchError } = await supabase
    .from("product_sizes")
    .select("stock")
    .eq("product_id", item.id)
    .eq("size", item.size)
    .single();

  if (fetchError || !sizeRow) {
    setMessage("❌ Stock error: Could not find stock for " + item.name);
    setLoading(false);
    return;
  }

  if (sizeRow.stock < item.quantity) {
    setMessage(`❌ Not enough stock for ${item.name} size ${item.size}`);
    setLoading(false);
    return;
  }

  const { error: stockError } = await supabase
    .from("product_sizes")
    .update({
      stock: sizeRow.stock - item.quantity,
    })
    .eq("product_id", item.id)
    .eq("size", item.size);

  if (stockError) {
    setMessage("❌ Stock update error: " + stockError.message);
    setLoading(false);
    return;
  }
}

    setMessage("✅ Order placed successfully!");
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-white px-6 py-24">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12">
        <div>
          <h1 className="text-4xl font-bold mb-8">Checkout</h1>

          {message && <p className="mb-5 font-medium">{message}</p>}

          <form onSubmit={handlePlaceOrder} className="space-y-5">
            <input name="name" type="text" placeholder="Full Name" required className="w-full border rounded-lg p-4" />
            <input name="phone" type="tel" placeholder="Phone Number" required className="w-full border rounded-lg p-4" />
            <input name="email" type="email" placeholder="Email Address" required className="w-full border rounded-lg p-4" />
            <input name="house" type="text" placeholder="House / Flat No." required className="w-full border rounded-lg p-4" />
            <input name="street" type="text" placeholder="Street / Area" required className="w-full border rounded-lg p-4" />

            <div className="grid grid-cols-2 gap-4">
              <input name="city" type="text" placeholder="City" required className="border rounded-lg p-4" />
              <input name="state" type="text" placeholder="State" required className="border rounded-lg p-4" />
            </div>

            <input name="pin" type="text" placeholder="PIN Code" required className="w-full border rounded-lg p-4" />
            <textarea name="notes" placeholder="Order Notes (Optional)" rows={4} className="w-full border rounded-lg p-4" />

            <div className="border rounded-xl p-5 space-y-3">
              <h2 className="font-semibold text-lg">Payment Method</h2>

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
              {loading ? "Placing Order..." : "Place Order"}
            </button>
          </form>
        </div>

        <div className="bg-gray-50 rounded-2xl p-8 h-fit">
          <h2 className="text-2xl font-bold mb-6">Order Summary</h2>

          <div className="space-y-5">
            {cart.map((item) => (
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

          <div className="flex justify-between text-2xl font-bold mt-8">
            <span>Total</span>
            <span>₹{total}</span>
          </div>
        </div>
      </div>
    </main>
  );
}