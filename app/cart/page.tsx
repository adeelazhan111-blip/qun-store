"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft,
  Check,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  Truck,
} from "lucide-react";

import { useCart } from "@/components/CartContext";
import { createClient } from "@/lib/supabase/client";

export default function CartPage() {
  const {
    cart,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
  } = useCart();

  const supabase = createClient();

  const [couponCode, setCouponCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponMessage, setCouponMessage] = useState("");
  const [discount, setDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(
    null
  );

  const freeShippingThreshold = 999;

  const subtotal = cart.reduce(
    (sum, item) =>
      sum +
      Number(item.price.replace(/[^\d.-]/g, "")) *
        item.quantity,
    0
  );

  const finalTotal = Math.max(subtotal - discount, 0);

  const amountRemaining = Math.max(
    freeShippingThreshold - subtotal,
    0
  );

  const shippingProgress = Math.min(
    (subtotal / freeShippingThreshold) * 100,
    100
  );

  async function applyCoupon() {
    const normalizedCode = couponCode.trim().toUpperCase();

    if (!normalizedCode) {
      setCouponMessage("Please enter a coupon code.");
      return;
    }

    setCouponLoading(true);
    setCouponMessage("");

    const { data: coupon, error } = await supabase
      .from("coupons")
      .select("*")
      .eq("code", normalizedCode)
      .eq("active", true)
      .maybeSingle();

    setCouponLoading(false);

    if (error || !coupon) {
      setDiscount(0);
      setAppliedCoupon(null);
      setCouponMessage("Invalid or inactive coupon code.");
      localStorage.removeItem("qun-checkout-coupon");
      return;
    }

    if (
      coupon.expires_at &&
      new Date(coupon.expires_at) < new Date()
    ) {
      setDiscount(0);
      setAppliedCoupon(null);
      setCouponMessage("This coupon has expired.");
      localStorage.removeItem("qun-checkout-coupon");
      return;
    }

    if (subtotal < Number(coupon.min_order || 0)) {
      setDiscount(0);
      setAppliedCoupon(null);
      setCouponMessage(
        `Minimum order value is ₹${Number(
          coupon.min_order
        ).toLocaleString("en-IN")}.`
      );
      localStorage.removeItem("qun-checkout-coupon");
      return;
    }

    let discountAmount = 0;

    if (coupon.discount_type === "percentage") {
      discountAmount = Math.round(
        (subtotal * Number(coupon.discount_value)) / 100
      );
    } else {
      discountAmount = Number(coupon.discount_value);
    }

    discountAmount = Math.min(discountAmount, subtotal);

    setDiscount(discountAmount);
    setAppliedCoupon(coupon.code);
    setCouponCode(coupon.code);
    setCouponMessage(
      `Coupon applied. You saved ₹${discountAmount.toLocaleString(
        "en-IN"
      )}.`
    );

    localStorage.setItem(
      "qun-checkout-coupon",
      JSON.stringify({
        code: coupon.code,
      })
    );
  }

  function removeCoupon() {
    setCouponCode("");
    setDiscount(0);
    setAppliedCoupon(null);
    setCouponMessage("");
    localStorage.removeItem("qun-checkout-coupon");
  }

  if (cart.length === 0) {
    return (
      <main className="mx-auto min-h-screen max-w-5xl px-6 pb-20 pt-32">
        <div className="mx-auto max-w-2xl rounded-3xl border border-gray-200 bg-white px-6 py-16 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#07152f]/5 text-[#07152f]">
            <ShoppingBag size={28} strokeWidth={1.6} />
          </div>

          <h1 className="mt-6 text-4xl font-semibold">
            Your cart is empty
          </h1>

          <p className="mx-auto mt-4 max-w-md leading-7 text-gray-500">
            Discover premium QUN pieces and add your favourites to
            continue shopping.
          </p>

          <Link
            href="/products"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#07152f] px-7 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-black"
          >
            Shop collection
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-5 pb-20 pt-28 md:px-6 md:pt-32">
      <div className="mb-10">
        <Link
          href="/products"
          className="mb-5 inline-flex items-center gap-2 text-sm text-gray-500 transition hover:text-black"
        >
          <ArrowLeft size={17} />
          Continue shopping
        </Link>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-400">
              Your selection
            </p>

            <h1 className="mt-2 text-4xl font-semibold md:text-5xl">
              Shopping Cart
            </h1>
          </div>

          <p className="text-sm text-gray-500">
            {cart.length} {cart.length === 1 ? "item" : "items"}
          </p>
        </div>
      </div>

      {/* Free-shipping progress */}
      <section className="mb-8 rounded-2xl border border-gray-200 bg-white p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#07152f]/5 text-[#07152f]">
            {amountRemaining === 0 ? (
              <Check size={19} />
            ) : (
              <Truck size={19} />
            )}
          </div>

          <div className="w-full">
            {amountRemaining === 0 ? (
              <p className="font-semibold text-[#07152f]">
                You have unlocked free shipping.
              </p>
            ) : (
              <p className="font-semibold">
                Add ₹{amountRemaining.toLocaleString("en-IN")} more
                to unlock free shipping.
              </p>
            )}

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full rounded-full bg-[#07152f] transition-all duration-500"
                style={{
                  width: `${shippingProgress}%`,
                }}
              />
            </div>

            <div className="mt-2 flex justify-between text-xs text-gray-400">
              <span>₹0</span>
              <span>₹{freeShippingThreshold}</span>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
        <section className="space-y-5">
          {cart.map((item) => {
            const unitPrice = Number(
              item.price.replace(/[^\d.-]/g, "")
            );

            const lineTotal = unitPrice * item.quantity;

            return (
              <article
                key={`${item.id}-${item.size}`}
                className="grid gap-5 rounded-3xl border border-gray-200 bg-white p-4 shadow-sm sm:grid-cols-[170px_1fr] sm:p-5"
              >
                <Link
                  href={`/product/${item.id}`}
                  className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-[#f7f7f7]"
                >
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="(max-width: 640px) 100vw, 170px"
                    className="object-contain p-4"
                  />
                </Link>

                <div className="flex min-w-0 flex-col justify-between gap-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <Link href={`/product/${item.id}`}>
                        <h2 className="truncate text-xl font-semibold transition hover:text-gray-600 md:text-2xl">
                          {item.name}
                        </h2>
                      </Link>

                      <p className="mt-2 text-sm text-gray-500">
                        Size:{" "}
                        <span className="font-medium text-black">
                          {item.size}
                        </span>
                      </p>

                      <p className="mt-3 text-base font-semibold">
                        ₹{unitPrice.toLocaleString("en-IN")}
                      </p>
                    </div>

                    <button
                      type="button"
                      aria-label={`Remove ${item.name} from cart`}
                      onClick={() =>
                        removeFromCart(item.id, item.size)
                      }
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <div className="flex flex-col gap-4 border-t border-gray-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="inline-flex w-fit items-center overflow-hidden rounded-xl border border-gray-300">
                      <button
                        type="button"
                        aria-label="Decrease quantity"
                        onClick={() =>
                          decreaseQuantity(item.id, item.size)
                        }
                        className="flex h-11 w-11 items-center justify-center transition hover:bg-gray-100"
                      >
                        <Minus size={16} />
                      </button>

                      <span className="flex h-11 min-w-12 items-center justify-center border-x border-gray-300 font-semibold">
                        {item.quantity}
                      </span>

                      <button
                        type="button"
                        aria-label="Increase quantity"
                        onClick={() =>
                          increaseQuantity(item.id, item.size)
                        }
                        className="flex h-11 w-11 items-center justify-center transition hover:bg-gray-100"
                      >
                        <Plus size={16} />
                      </button>
                    </div>

                    <div className="sm:text-right">
                      <p className="text-xs uppercase tracking-[0.16em] text-gray-400">
                        Item total
                      </p>

                      <p className="mt-1 text-xl font-semibold">
                        ₹{lineTotal.toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </section>

        <aside className="h-fit rounded-3xl bg-[#07152f] p-6 text-white shadow-xl md:p-8 lg:sticky lg:top-28">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/50">
            Order summary
          </p>

          <h2 className="mt-3 text-3xl font-semibold">
            Summary
          </h2>

          {/* Coupon */}
          <div className="mt-8 border-b border-white/15 pb-7">
            <label className="mb-3 block text-sm font-medium text-white/80">
              Have a coupon?
            </label>

            <div className="flex gap-2">
              <input
                type="text"
                value={couponCode}
                onChange={(event) =>
                  setCouponCode(event.target.value.toUpperCase())
                }
                disabled={Boolean(appliedCoupon)}
                placeholder="Enter code"
                className="min-w-0 flex-1 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm uppercase text-white outline-none placeholder:text-white/35 focus:border-white"
              />

              {appliedCoupon ? (
                <button
                  type="button"
                  onClick={removeCoupon}
                  className="rounded-xl border border-white/30 px-4 text-sm font-semibold transition hover:bg-white/10"
                >
                  Remove
                </button>
              ) : (
                <button
                  type="button"
                  onClick={applyCoupon}
                  disabled={couponLoading}
                  className="rounded-xl bg-white px-4 text-sm font-semibold text-[#07152f] disabled:opacity-50"
                >
                  {couponLoading ? "..." : "Apply"}
                </button>
              )}
            </div>

            {couponMessage && (
              <p
                className={`mt-3 text-xs ${
                  appliedCoupon
                    ? "text-green-300"
                    : "text-red-300"
                }`}
              >
                {couponMessage}
              </p>
            )}
          </div>

          <div className="mt-7 space-y-4 text-sm">
            <div className="flex items-center justify-between text-white/70">
              <span>Subtotal</span>
              <span>
                ₹{subtotal.toLocaleString("en-IN")}
              </span>
            </div>

            {discount > 0 && (
              <div className="flex items-center justify-between text-green-300">
                <span>Coupon discount</span>
                <span>
                  -₹{discount.toLocaleString("en-IN")}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between text-white/70">
              <span>Shipping</span>
              <span>
                {subtotal >= freeShippingThreshold
                  ? "Free"
                  : "Calculated at checkout"}
              </span>
            </div>
          </div>

          <div className="mt-8 border-t border-white/15 pt-6">
            <div className="flex items-end justify-between gap-5">
              <span className="text-sm text-white/65">
                Estimated total
              </span>

              <span className="text-3xl font-semibold">
                ₹{finalTotal.toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          <Link
            href="/checkout"
            className="mt-8 flex w-full items-center justify-center rounded-xl bg-white px-6 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-[#07152f] transition hover:bg-gray-100"
          >
            Proceed to checkout
          </Link>

          <div className="mt-7 space-y-4 border-t border-white/15 pt-6">
            <div className="flex items-center gap-3 text-sm text-white/70">
              <ShieldCheck size={18} strokeWidth={1.7} />
              Secure checkout with COD and Razorpay
            </div>

            <div className="flex items-center gap-3 text-sm text-white/70">
              <Truck size={18} strokeWidth={1.7} />
              Tracked delivery across India
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}