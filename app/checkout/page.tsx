"use client";

import { useState } from "react";
import { useCart } from "@/components/CartContext";

export default function CheckoutPage() {
  const { cart } = useCart();

  const [paymentMethod, setPaymentMethod] = useState("razorpay");

  const total = cart.reduce(
    (sum, item) =>
      sum + Number(item.price.replace("₹", "")) * item.quantity,
    0
  );

  return (
    <main className="min-h-screen bg-white px-6 py-24">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12">
        {/* Shipping Form */}
        <div>
          <h1 className="text-4xl font-bold mb-8">Checkout</h1>

          <form className="space-y-5">
            <input
              type="text"
              placeholder="Full Name"
              className="w-full border rounded-lg p-4"
            />

            <input
              type="tel"
              placeholder="Phone Number"
              className="w-full border rounded-lg p-4"
            />

            <input
              type="email"
              placeholder="Email Address"
              className="w-full border rounded-lg p-4"
            />

            <input
              type="text"
              placeholder="House / Flat No."
              className="w-full border rounded-lg p-4"
            />

            <input
              type="text"
              placeholder="Street / Area"
              className="w-full border rounded-lg p-4"
            />

            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="City"
                className="border rounded-lg p-4"
              />

              <input
                type="text"
                placeholder="State"
                className="border rounded-lg p-4"
              />
            </div>

            <input
              type="text"
              placeholder="PIN Code"
              className="w-full border rounded-lg p-4"
            />

            <textarea
              placeholder="Order Notes (Optional)"
              rows={4}
              className="w-full border rounded-lg p-4"
            />

            <div className="border rounded-xl p-5 space-y-3">
              <h2 className="font-semibold text-lg">Payment Method</h2>

              <label className="flex items-center gap-3">
                <input
                  type="radio"
                  checked={paymentMethod === "razorpay"}
                  onChange={() => setPaymentMethod("razorpay")}
                />
                Razorpay (UPI / Cards / Net Banking)
              </label>

              <label className="flex items-center gap-3">
                <input
                  type="radio"
                  checked={paymentMethod === "cod"}
                  onChange={() => setPaymentMethod("cod")}
                />
                Cash on Delivery
              </label>
            </div>

            <button
              type="button"
              className="w-full bg-black text-white py-4 rounded-xl text-lg hover:bg-gray-900 transition"
            >
              Place Order
            </button>
          </form>
        </div>

        {/* Order Summary */}
        <div className="bg-gray-50 rounded-2xl p-8 h-fit">
          <h2 className="text-2xl font-bold mb-6">Order Summary</h2>

          <div className="space-y-5">
            {cart.map((item) => (
              <div
                key={`${item.id}-${item.size}`}
                className="flex justify-between border-b pb-4"
              >
                <div>
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-gray-500">
                    Size: {item.size} × {item.quantity}
                  </p>
                </div>

                <p className="font-semibold">
                  ₹
                  {Number(item.price.replace("₹", "")) * item.quantity}
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