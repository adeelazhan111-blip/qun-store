"use client";

import { useState } from "react";
import { useCart } from "@/components/CartContext";
import { createClient } from "@/lib/supabase/client";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CheckoutPage() {
  const { cart, clearCart } = useCart();
  const supabase = createClient();

  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const total = cart.reduce(
    (sum, item) => sum + Number(item.price.replace("₹", "")) * item.quantity,
    0
  );

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
    for (const item of cart) {
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

  async function sendOrderEmail(
    formData: FormData,
    orderId: string
  ) {
    await fetch("/api/send-order-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        customerName: String(formData.get("name")),
        email: String(formData.get("email")),
        orderId,
        items: cart.map((item) => ({
          name: item.name,
          size: item.size,
          quantity: item.quantity,
          price: Number(item.price.replace("₹", "")),
        })),
        total,
      }),
    });
  }

  async function saveOrder(
    formData: FormData,
    paymentStatus: string,
    razorpayPaymentId?: string
  ) {
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
        customer_name,
        phone,
        email,
        address,
        total,
        payment_status: paymentStatus,
        order_status: "Pending",
      })
      .select()
      .single();

    if (orderError || !order) {
      throw new Error(orderError?.message || "Order could not be created");
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
      throw new Error(itemsError.message);
    }

    for (const item of cart) {
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

  async function handlePlaceOrder(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (cart.length === 0) {
      setMessage("❌ Your cart is empty.");
      return;
    }

    setLoading(true);
    setMessage("");

    const formData = new FormData(e.currentTarget);

    try {
      await checkStock();

      if (paymentMethod === "cod") {
        const order = await saveOrder(formData, "Pending");

        await sendOrderEmail(formData, order.id);

        clearCart();
        setMessage("✅ COD order placed successfully! Confirmation email sent.");
        setLoading(false);
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
        body: JSON.stringify({ amount: total }),
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

          clearCart();
          setMessage("✅ Payment successful! Order placed and email sent.");
          setLoading(false);
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
              {loading
                ? "Processing..."
                : paymentMethod === "razorpay"
                ? "Pay with Razorpay"
                : "Place COD Order"}
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