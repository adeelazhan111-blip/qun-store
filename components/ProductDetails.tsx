"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Minus,
  Plus,
  ShieldCheck,
  Truck,
  RefreshCcw,
} from "lucide-react";
import { useCart } from "./CartContext";
import { useRouter } from "next/navigation";

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

export default function ProductDetails({
  product,
}: {
  product: Product;
}) {
  const { addToCart } = useCart();
const router = useRouter();
  const sizes = product.product_sizes || [];
  const availableSizes = sizes.filter((item) => item.stock > 0);

  const [size, setSize] = useState(availableSizes[0]?.size || "");
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const selectedSize = sizes.find((item) => item.size === size);
  const selectedStock = selectedSize?.stock || 0;

  function handleAddToCart() {
    if (!size || selectedStock <= 0) {
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

    setAdded(true);

    window.setTimeout(() => {
      setAdded(false);
    }, 2200);
  }
function handleBuyNow() {
  if (!size || selectedStock <= 0) {
    return;
  }

  if (quantity > selectedStock) {
    alert(`Only ${selectedStock} item(s) left in size ${size}.`);
    return;
  }

  const buyNowItem = {
    id: product.id,
    name: product.name,
    price: product.price,
    image: product.image,
    size,
    quantity,
  };

  sessionStorage.setItem(
    "qun-buy-now-item",
    JSON.stringify(buyNowItem)
  );

  router.push("/checkout?mode=buy-now");
}
  return (
    <div className="space-y-8">
      <section>
        <div className="mb-4 flex items-center justify-between gap-4">
          <h3 className="text-sm font-semibold uppercase tracking-[0.18em]">
            Select size
          </h3>

          <Link
            href="/"
            className="text-sm text-gray-500 underline underline-offset-4 transition hover:text-black"
          >
            Size guide
          </Link>
        </div>

        <div className="flex flex-wrap gap-3">
          {["S", "M", "L", "XL"].map((item) => {
            const sizeData = sizes.find((entry) => entry.size === item);
            const stock = sizeData?.stock || 0;
            const isOutOfStock = stock <= 0;
            const isSelected = size === item;

            return (
              <button
                key={item}
                type="button"
                disabled={isOutOfStock}
                onClick={() => {
                  setSize(item);
                  setQuantity(1);
                }}
                className={`relative flex h-12 min-w-14 items-center justify-center rounded-xl border px-4 text-sm font-semibold transition ${
                  isSelected
                    ? "border-[#07152f] bg-[#07152f] text-white"
                    : "border-gray-300 bg-white text-black hover:border-[#07152f]"
                } ${
                  isOutOfStock
                    ? "cursor-not-allowed opacity-35"
                    : ""
                }`}
              >
                {item}

                {isOutOfStock && (
                  <span className="absolute h-px w-9 rotate-[-35deg] bg-current" />
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-4 min-h-5">
          {!size ? (
            <p className="text-sm text-red-600">
              This product is currently out of stock.
            </p>
          ) : selectedStock <= 3 ? (
            <p className="text-sm font-medium text-orange-600">
              Only {selectedStock} left in size {size}
            </p>
          ) : (
            <p className="text-sm text-gray-500">
              Size {size} is available.
            </p>
          )}
        </div>
      </section>

      <section>
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em]">
          Quantity
        </h3>

        <div className="inline-flex items-center overflow-hidden rounded-xl border border-gray-300">
          <button
            type="button"
            aria-label="Decrease quantity"
            disabled={quantity <= 1}
            onClick={() =>
              setQuantity((current) => Math.max(1, current - 1))
            }
            className="flex h-12 w-12 items-center justify-center transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-35"
          >
            <Minus size={17} />
          </button>

          <span className="flex h-12 min-w-14 items-center justify-center border-x border-gray-300 text-base font-semibold">
            {quantity}
          </span>

          <button
            type="button"
            aria-label="Increase quantity"
            disabled={!size || quantity >= selectedStock}
            onClick={() =>
              setQuantity((current) =>
                Math.min(selectedStock, current + 1)
              )
            }
            className="flex h-12 w-12 items-center justify-center transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-35"
          >
            <Plus size={17} />
          </button>
        </div>
      </section>

      <div className="space-y-4">
  <div className="grid gap-3 sm:grid-cols-2">
    <button
      type="button"
      onClick={handleAddToCart}
      disabled={!size || selectedStock <= 0}
      className="w-full rounded-xl border-2 border-[#07152f] px-8 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-[#07152f] transition duration-300 hover:bg-[#07152f] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
    >
      {!size || selectedStock <= 0
        ? "Out of stock"
        : added
        ? "Added ✓"
        : "Add to Cart"}
    </button>

    <button
      type="button"
      onClick={handleBuyNow}
      disabled={!size || selectedStock <= 0}
      className="w-full rounded-xl bg-[#07152f] px-8 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-white transition duration-300 hover:bg-black disabled:cursor-not-allowed disabled:opacity-40"
    >
      Buy Now
    </button>
  </div>

  {added && (
    <Link
      href="/cart"
      className="block text-center text-sm font-medium underline underline-offset-4"
    >
      View Cart
    </Link>
  )}
</div>

      <div className="grid gap-3 border-t border-gray-200 pt-6 sm:grid-cols-3">
        <TrustItem
          icon={Truck}
          title="India-wide delivery"
          description="Tracked shipping"
        />

        <TrustItem
          icon={ShieldCheck}
          title="Secure checkout"
          description="COD and Razorpay"
        />

        <TrustItem
          icon={RefreshCcw}
          title="Easy support"
          description="Help with your order"
        />
      </div>
    </div>
  );
}

function TrustItem({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{
    size?: number;
    strokeWidth?: number;
  }>;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100">
        <Icon size={17} strokeWidth={1.8} />
      </div>

      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="mt-0.5 text-xs text-gray-500">
          {description}
        </p>
      </div>
    </div>
  );
}