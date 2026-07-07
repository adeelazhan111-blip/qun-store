"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function OrderStatus({
  id,
  currentStatus,
}: {
  id: string;
  currentStatus: string;
}) {
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const supabase = createClient();

  async function updateStatus(value: string) {
    setLoading(true);
    setStatus(value);

    const { error } = await supabase
      .from("orders")
      .update({ order_status: value })
      .eq("id", id);

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    router.refresh();
  }

  return (
    <div className="mt-4">
      <label className="block mb-2 font-semibold">Update Status</label>

      <select
        disabled={loading}
        value={status}
        onChange={(e) => updateStatus(e.target.value)}
        className="border rounded-lg px-4 py-2"
      >
        <option>Pending</option>
        <option>Processing</option>
        <option>Shipped</option>
        <option>Delivered</option>
        <option>Cancelled</option>
      </select>
    </div>
  );
}