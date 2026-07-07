import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default async function AdminDashboard() {
  const [{ count: productCount }, { count: orderCount }, { data: orders }] =
    await Promise.all([
      supabase
        .from("products")
        .select("*", { count: "exact", head: true }),

      supabase
        .from("orders")
        .select("*", { count: "exact", head: true }),

      supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

  const revenue =
    orders?.reduce((sum, order) => sum + Number(order.total), 0) ?? 0;

  return (
    <main className="space-y-10">
      <div>
        <h1 className="text-4xl font-bold">Dashboard</h1>
        <p className="text-gray-500 mt-2">
          Welcome to the QUN Admin Panel
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow p-6">
          <p className="text-gray-500">Products</p>
          <h2 className="text-4xl font-bold mt-2">
            {productCount ?? 0}
          </h2>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <p className="text-gray-500">Orders</p>
          <h2 className="text-4xl font-bold mt-2">
            {orderCount ?? 0}
          </h2>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <p className="text-gray-500">Revenue</p>
          <h2 className="text-4xl font-bold mt-2">
            ₹{revenue}
          </h2>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl shadow">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold">
            Recent Orders
          </h2>

          <Link
            href="/admin/orders"
            className="text-blue-600 font-medium"
          >
            View All
          </Link>
        </div>

        <table className="w-full">
          <thead className="bg-gray-50">
            <tr className="text-left">
              <th className="p-4">Customer</th>
              <th className="p-4">Total</th>
              <th className="p-4">Status</th>
              <th className="p-4">Payment</th>
            </tr>
          </thead>

          <tbody>
            {orders?.map((order) => (
              <tr key={order.id} className="border-t">
                <td className="p-4">
                  {order.customer_name}
                </td>

                <td className="p-4">
                  ₹{order.total}
                </td>

                <td className="p-4">
                  {order.order_status}
                </td>

                <td className="p-4">
                  {order.payment_status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}