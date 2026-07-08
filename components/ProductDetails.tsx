"use client";

import { useState } from "react";
import { useCart } from "./CartContext";

type ProductSize = {
  size: string;
  stock: number;
};

type Product = {
  id: string;
  name: string;
  price: string;
  image: string;
  description: string;
  product_sizes?: ProductSize[];
};

export default function ProductDetails({ product }: { product: Product }) {
  const { addToCart } = useCart();

  const sizes = product.product_sizes || [];
  const availableSizes = sizes.filter((item) => item.stock > 0);

  const [size, setSize] = useState(availableSizes[0]?.size || "");
  const [quantity, setQuantity] = useState(1);

  const selectedSize = sizes.find((item) => item.size === size);
  const selectedStock = selectedSize?.stock || 0;

  const handleAddToCart = () => {
    if (!size) {
      alert("This product is out of stock.");
      return;
    }

    if (quantity > selectedStock) {
      alert(`Only ${selectedStock} item(s) left in size ${size}.`);
      return;
    }

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
          {["S", "M", "L", "XL"].map((item) => {
            const sizeData = sizes.find((s) => s.size === item);
            const stock = sizeData?.stock || 0;
            const isOutOfStock = stock <= 0;

            return (
              <button
                key={item}
                disabled={isOutOfStock}
                onClick={() => {
                  setSize(item);
                  setQuantity(1);
                }}
                className={`border px-4 py-2 rounded-lg transition ${
                  size === item
                    ? "bg-black text-white"
                    : "hover:bg-black hover:text-white"
                } ${
                  isOutOfStock
                    ? "opacity-40 cursor-not-allowed hover:bg-white hover:text-black"
                    : ""
                }`}
              >
                {item}
              </button>
            );
          })}
        </div>

        {size && (
          <p className="text-sm text-gray-600 mt-3">
            {selectedStock > 0
              ? `${selectedStock} left in size ${size}`
              : "Out of stock"}
          </p>
        )}
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
            disabled={quantity >= selectedStock}
            onClick={() => setQuantity(quantity + 1)}
            className="border rounded-lg px-4 py-2 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            +
          </button>
        </div>
      </div>

      <button
        onClick={handleAddToCart}
        disabled={!size || selectedStock <= 0}
        className="bg-black text-white px-8 py-3 rounded-full disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {!size || selectedStock <= 0 ? "Out of Stock" : "Add to Cart"}
      </button>
    </>
  );
}