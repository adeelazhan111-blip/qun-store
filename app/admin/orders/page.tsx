import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default async function OrdersPage() {
  const { data: orders, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <main className="p-10">
        <p className="text-red-600">
          Error loading orders: {error.message}
        </p>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto p-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Orders</h1>

        <Link
          href="/admin/inventory"
          className="bg-black text-white px-5 py-3 rounded-lg"
        >
          Inventory
        </Link>
      </div>

      <div className="overflow-x-auto border rounded-xl">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr className="text-left">
              <th className="p-4">Customer</th>
              <th className="p-4">Phone</th>
              <th className="p-4">Total</th>
              <th className="p-4">Payment</th>
              <th className="p-4">Status</th>
              <th className="p-4">Date</th>
              <th className="p-4">Details</th>
            </tr>
          </thead>

          <tbody>
            {orders?.map((order) => (
              <tr key={order.id} className="border-t">
                <td className="p-4">
                  <div className="font-semibold">
                    {order.customer_name}
                  </div>
                  <div className="text-gray-500 text-sm">
                    {order.email}
                  </div>
                </td>

                <td className="p-4">{order.phone}</td>

                <td className="p-4 font-semibold">
                  ₹{order.total}
                </td>

                <td className="p-4">
                  {order.payment_status}
                </td>

                <td className="p-4">
                  {order.order_status}
                </td>

                <td className="p-4">
                  {new Date(order.created_at).toLocaleString()}
                </td>

                <td className="p-4">
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="text-blue-600 font-medium"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}