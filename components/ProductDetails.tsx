"use client";

import { useState } from "react";
import { useCart } from "./CartContext";

type Product = {
  id: string;
  name: string;
  price: string;
  image: string;
  description: string;
};

export default function ProductDetails({
  product,
}: {
  product: Product;
}) {
  const { addToCart } = useCart();

  const [size, setSize] = useState("M");
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      size,
      quantity,
    });

    alert("Product added to cart!");
  };

  return (
    <>
      <div className="mb-6">
        <h3 className="font-semibold mb-3">Select Size</h3>

        <div className="flex gap-3">
          {["S", "M", "L", "XL"].map((item) => (
            <button
              key={item}
              onClick={() => setSize(item)}
              className={`border px-4 py-2 rounded-lg transition ${
                size === item ? "bg-black text-white" : "hover:bg-black hover:text-white"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <h3 className="font-semibold mb-3">Quantity</h3>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="border rounded-lg px-4 py-2"
          >
            -
          </button>

          <span className="text-xl font-semibold">{quantity}</span>

          <button
            onClick={() => setQuantity(quantity + 1)}
            className="border rounded-lg px-4 py-2"
          >
            +
          </button>
        </div>
      </div>

      <button
        onClick={handleAddToCart}
        className="bg-black text-white px-8 py-3 rounded-full"
      >
        Add to Cart
      </button>
    </>
  );
}