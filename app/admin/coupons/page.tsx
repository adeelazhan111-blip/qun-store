import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default async function AdminCouponsPage() {
  const { data: coupons, error } = await supabase
    .from("coupons")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return <main className="p-10">Failed to load coupons.</main>;
  }

  return (
    <main className="p-6 md:p-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Coupons</h1>
          <p className="text-gray-500 mt-1">
            Create and manage discount codes for QUN.
          </p>
        </div>

        <Link
          href="/admin/coupons/new"
          className="bg-black text-white px-5 py-3 rounded-xl font-medium"
        >
          Add Coupon
        </Link>
      </div>

      <div className="bg-white border rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-4">Code</th>
              <th className="p-4">Type</th>
              <th className="p-4">Value</th>
              <th className="p-4">Min Order</th>
              <th className="p-4">Expiry</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>

          <tbody>
            {coupons?.length === 0 && (
              <tr>
                <td className="p-4 text-gray-500" colSpan={6}>
                  No coupons created yet.
                </td>
              </tr>
            )}

            {coupons?.map((coupon) => (
              <tr key={coupon.id} className="border-t">
                <td className="p-4 font-semibold">{coupon.code}</td>
                <td className="p-4 capitalize">{coupon.discount_type}</td>
                <td className="p-4">
                  {coupon.discount_type === "percentage"
                    ? `${coupon.discount_value}%`
                    : `₹${coupon.discount_value}`}
                </td>
                <td className="p-4">₹{coupon.min_order}</td>
                <td className="p-4">
                  {coupon.expires_at
                    ? new Date(coupon.expires_at).toLocaleDateString()
                    : "No expiry"}
                </td>
                <td className="p-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      coupon.active
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {coupon.active ? "Active" : "Inactive"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}