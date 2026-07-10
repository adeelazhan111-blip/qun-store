import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AccountPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/account/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
    const { data: orders } = await supabase
  .from("orders")
  .select("*")
  .eq("user_id", user.id)
  .order("created_at", { ascending: false });

  return (
    <main className="max-w-5xl mx-auto px-6 py-24">
      <h1 className="text-4xl font-bold mb-8">
        My Account
      </h1>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="border rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-4">
            Profile
          </h2>

          <p>
            <strong>Name:</strong>{" "}
            {profile?.full_name || "-"}
          </p>

          <p>
            <strong>Email:</strong>{" "}
            {user.email}
          </p>

          <p>
            <strong>Phone:</strong>{" "}
            {profile?.phone || "-"}
          </p>
        </div>

        <div className="border rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-4">
            Quick Links
          </h2>

          <div className="space-y-3">
            <a
              href="/wishlist"
              className="block underline"
            >
              ❤️ My Wishlist
            </a>

            <a
              href="/cart"
              className="block underline"
            >
              🛒 My Cart
            </a>

            <a
              href="/products"
              className="block underline"
            >
              🛍 Continue Shopping
            </a>
          </div>
        </div>
      </div>
      <div className="mt-12">
  <h2 className="text-3xl font-bold mb-6">
    My Orders
  </h2>

  {!orders || orders.length === 0 ? (
    <div className="border rounded-2xl p-8 text-gray-500">
      You haven't placed any orders yet.
    </div>
  ) : (
    <div className="space-y-6">
      {orders.map((order) => (
        <div
          key={order.id}
          className="border rounded-2xl p-6"
        >
          <div className="flex justify-between items-center">
            <div>
              <p className="font-semibold">
                Order #{order.id}
              </p>

              <p className="text-gray-500 text-sm">
                {new Date(order.created_at).toLocaleDateString()}
              </p>
            </div>

            <div className="text-right">
              <p className="font-semibold">
                ₹{order.total}
              </p>

              <p className="text-sm">
                {order.order_status}
              </p>
            </div>
          </div>

          <a
            href={`/account/orders/${order.id}`}
            className="inline-block mt-5 underline"
          >
            View Details →
          </a>
        </div>
      ))}
    </div>
  )}
</div>
    </main>
  );
}