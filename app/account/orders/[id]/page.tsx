import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function CustomerOrderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/account/login");
  }

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (orderError || !order) {
    notFound();
  }

  const { data: items, error: itemsError } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", order.id);

  const totalAmount = Number(order.total || 0);

  return (
    <main className="mx-auto max-w-4xl px-6 py-24">
      <Link
        href="/account"
        className="mb-8 inline-block text-sm underline"
      >
        ← Back to My Account
      </Link>

      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <h1 className="text-3xl font-bold">Order Details</h1>

          <p className="mt-2 break-all text-sm text-gray-500">
            Order #{order.id}
          </p>

          <p className="mt-1 text-sm text-gray-500">
            Placed on{" "}
            {new Date(order.created_at).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>

        <div className="sm:text-right">
          <p className="text-xl font-bold">
            ₹{totalAmount.toLocaleString("en-IN")}
          </p>

          <p className="mt-1 text-sm">
            Status: {order.order_status || "Pending"}
          </p>

          <p className="text-sm text-gray-500">
            Payment: {order.payment_status || "Pending"}
          </p>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <section className="rounded-2xl border p-6">
          <h2 className="mb-4 text-xl font-semibold">Delivery Address</h2>

          <div className="space-y-1 text-sm">
            <p className="font-medium">{order.customer_name}</p>
            <p>{order.phone}</p>
            <p>{order.email}</p>
            <p>{order.address}</p>
            <p>
              {order.city}, {order.state}
            </p>
            <p>{order.pincode}</p>
          </div>
        </section>

        <section className="rounded-2xl border p-6">
          <h2 className="mb-4 text-xl font-semibold">Payment</h2>

          <div className="space-y-2 text-sm">
            <p>
              <strong>Method:</strong>{" "}
              {String(order.payment_method || "-").toUpperCase()}
            </p>

            <p>
              <strong>Status:</strong>{" "}
              {order.payment_status || "Pending"}
            </p>

            <p>
              <strong>Order status:</strong>{" "}
              {order.order_status || "Pending"}
            </p>
          </div>
        </section>
      </div>

      <section className="mt-8 rounded-2xl border p-6">
        <h2 className="mb-5 text-xl font-semibold">Items</h2>

        {itemsError ? (
          <p className="text-red-600">Unable to load order items.</p>
        ) : !items || items.length === 0 ? (
          <p className="text-gray-500">No items found for this order.</p>
        ) : (
          <div className="divide-y">
            {items.map((item) => {
              const itemPrice = Number(item.price || 0);
              const quantity = Number(item.quantity || 0);
              const lineTotal = itemPrice * quantity;

              return (
                <div
                  key={item.id}
                  className="flex flex-col justify-between gap-3 py-4 sm:flex-row"
                >
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-500">
                      Size: {item.size} · Quantity: {quantity}
                    </p>
                  </div>

                  <p className="font-semibold">
                    ₹{lineTotal.toLocaleString("en-IN")}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}