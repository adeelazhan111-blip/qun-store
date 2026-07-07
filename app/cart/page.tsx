"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useCart,
} from "@/components/CartContext";

export default function CartPage() {
  const {
  cart,
  increaseQuantity,
  decreaseQuantity,
  removeFromCart,
} = useCart();

console.log("Cart:", cart);

  const total = cart.reduce(
    (sum, item) =>
      sum + Number(item.price.replace("₹", "")) * item.quantity,
    0
  );

  if (cart.length === 0) {
    return (
      <div className="max-w-5xl mx-auto py-20 px-6">
        <h1 className="text-4xl font-bold mb-8">Shopping Cart</h1>

        <div className="border rounded-2xl p-10 text-center">
          <p className="text-gray-500 mb-6">
            Your cart is empty.
          </p>

          <Link
            href="/products"
            className="bg-black text-white px-6 py-3 rounded-full inline-block"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-20 px-6">
      <h1 className="text-4xl font-bold mb-10">
        Shopping Cart
      </h1>

      <div className="space-y-8">
        {cart.map((item) => (
          <div
            key={item.id + item.size}
            className="flex gap-6 border rounded-2xl p-6"
          >
            <Image
              src={item.image}
              alt={item.name}
              width={140}
              height={140}
              className="rounded-xl"
            />

            <div className="flex-1">
              <h2 className="text-2xl font-semibold">
                {item.name}
              </h2>

              <p className="text-gray-500 mt-2">
                Size: {item.size}
              </p>

              <p className="font-semibold mt-2">
                {item.price}
              </p>

              <div className="flex items-center gap-4 mt-6">
                <button
                  onClick={() =>
                    decreaseQuantity(item.id, item.size)
                  }
                  className="w-10 h-10 border rounded-full"
                >
                  −
                </button>

                <span className="text-lg font-semibold">
                  {item.quantity}
                </span>

                <button
                  onClick={() =>
                    increaseQuantity(item.id, item.size)
                  }
                  className="w-10 h-10 border rounded-full"
                >
                  +
                </button>

                <button
                  onClick={() =>
                    removeFromCart(item.id, item.size)
                  }
                  className="ml-6 text-red-600"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}

        <div className="border-t pt-8 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold">
              Total: ₹{total}
            </h2>
          </div>

          <Link
  href="/checkout"
  className="bg-black text-white px-8 py-4 rounded-full"
>
  Proceed to Checkout
</Link>
        </div>
      </div>
    </div>
  );
}