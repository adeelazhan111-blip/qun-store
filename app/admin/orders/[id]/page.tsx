import OrderStatus from "@/components/OrderStatus";
import { supabaseAdmin } from "@/lib/supabase/admin";
import Link from "next/link";
import CreateDelhiveryShipmentButton from "@/components/CreateDelhiveryShipmentButton";
export default async function OrderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: order, error } = await supabaseAdmin
  .from("orders")
  .select("*, order_items(*)")
  .eq("id", id)
  .single();

  if (error || !order) {
    return (
      <main className="p-10">
        <h1 className="text-3xl font-bold mb-4">Order not found</h1>
        <Link href="/admin/orders" className="text-blue-600 underline">
          Back to Orders
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto p-10">
      <Link href="/admin/orders" className="text-blue-600">
        ← Back to Orders
      </Link>

      <h1 className="text-4xl font-bold mt-6 mb-8">Order Details</h1>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="border rounded-xl p-6 bg-white">
          <h2 className="text-xl font-bold mb-4">Customer Information</h2>
          <p><strong>Name:</strong> {order.customer_name}</p>
          <p><strong>Email:</strong> {order.email}</p>
          <p><strong>Phone:</strong> {order.phone}</p>
          <p><strong>Address:</strong> {order.address}</p>
        </div>

        <div className="border rounded-xl p-6 bg-white">
          <h2 className="text-xl font-bold mb-4">Order Information</h2>
          <p><strong>Order ID:</strong> {order.id}</p>
          <p><strong>Payment:</strong> {order.payment_status}</p>

<div className="mt-4">
  <OrderStatus
    id={order.id}
    currentStatus={order.order_status}
  />

  <CreateDelhiveryShipmentButton
    orderId={order.id}
    existingAwb={order.delhivery_awb}
    trackingUrl={order.delhivery_tracking_url}
  />
</div>
          <p>
            <strong>Date:</strong>{" "}
            {new Date(order.created_at).toLocaleString("en-IN")}
          </p>
        </div>
      </div>

      <div className="border rounded-xl bg-white overflow-hidden">
        <h2 className="text-xl font-bold p-6 border-b">Products Ordered</h2>

        <table className="w-full text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-4">Product</th>
              <th className="p-4">Size</th>
              <th className="p-4">Quantity</th>
              <th className="p-4">Price</th>
              <th className="p-4">Total</th>
            </tr>
          </thead>

          <tbody>
            {order.order_items?.map((item: any) => (
              <tr key={item.id} className="border-t">
                <td className="p-4">{item.product_name}</td>
                <td className="p-4">{item.size}</td>
                <td className="p-4">{item.quantity}</td>
                <td className="p-4">₹{item.price}</td>
                <td className="p-4 font-semibold">
                  ₹{item.price * item.quantity}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="p-6 border-t text-right text-2xl font-bold">
          Total: ₹{order.total}
        </div>
      </div>
    </main>
  );
}