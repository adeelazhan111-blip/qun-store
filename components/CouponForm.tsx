"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function CouponForm() {
  const router = useRouter();
  const supabase = createClient();

  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState("percentage");
  const [discountValue, setDiscountValue] = useState("");
  const [minOrder, setMinOrder] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [active, setActive] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.from("coupons").insert({
      code: code.trim().toUpperCase(),
      discount_type: discountType,
      discount_value: Number(discountValue),
      min_order: Number(minOrder || 0),
      expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
      active,
    });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Coupon created successfully!");
    router.push("/admin/coupons");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block font-medium mb-2">Coupon Code</label>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="QUN10"
          required
          className="w-full border rounded-xl px-4 py-3"
        />
      </div>

      <div>
        <label className="block font-medium mb-2">Discount Type</label>
        <select
          value={discountType}
          onChange={(e) => setDiscountType(e.target.value)}
          className="w-full border rounded-xl px-4 py-3"
        >
          <option value="percentage">Percentage</option>
          <option value="fixed">Fixed Amount</option>
        </select>
      </div>

      <div>
        <label className="block font-medium mb-2">Discount Value</label>
        <input
          type="number"
          value={discountValue}
          onChange={(e) => setDiscountValue(e.target.value)}
          placeholder={discountType === "percentage" ? "10" : "100"}
          required
          className="w-full border rounded-xl px-4 py-3"
        />
      </div>

      <div>
        <label className="block font-medium mb-2">Minimum Order Value</label>
        <input
          type="number"
          value={minOrder}
          onChange={(e) => setMinOrder(e.target.value)}
          placeholder="0"
          className="w-full border rounded-xl px-4 py-3"
        />
      </div>

      <div>
        <label className="block font-medium mb-2">Expiry Date</label>
        <input
          type="date"
          value={expiresAt}
          onChange={(e) => setExpiresAt(e.target.value)}
          className="w-full border rounded-xl px-4 py-3"
        />
      </div>

      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={active}
          onChange={(e) => setActive(e.target.checked)}
        />
        Active coupon
      </label>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-black text-white py-3 rounded-xl font-semibold disabled:opacity-50"
      >
        {loading ? "Saving..." : "Save Coupon"}
      </button>
    </form>
  );
}