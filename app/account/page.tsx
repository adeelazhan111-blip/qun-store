import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AccountPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/account/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, phone")
    .eq("id", user.id)
    .maybeSingle();

  const { data: orders, error: ordersError } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <main className="mx-auto max-w-5xl px-6 py-24">
      <h1 className="mb-8 text-4xl font-bold">My Account</h1>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="rounded-2xl border p-6">
          <h2 className="mb-4 text-xl font-semibold">Profile</h2>

          <div className="space-y-2">
            <p>
              <strong>Name:</strong> {profile?.full_name || "-"}
            </p>

            <p>
              <strong>Email:</strong> {user.email || "-"}
            </p>

            <p>
              <strong>Phone:</strong> {profile?.phone || "-"}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border p-6">
          <h2 className="mb-4 text-xl font-semibold">Quick Links</h2>

          <div className="space-y-3">
            <Link href="/wishlist" className="block underline">
              ❤️ My Wishlist
            </Link>

            <Link href="/cart" className="block underline">
              🛒 My Cart
            </Link>

            <Link href="/products" className="block underline">
              🛍 Continue Shopping
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-12">
        <h2 className="mb-6 text-3xl font-bold">My Orders</h2>

        {ordersError ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-red-700">
            Unable to load your orders.
          </div>
        ) : !orders || orders.length === 0 ? (
          <div className="rounded-2xl border p-8 text-gray-500">
            You haven&apos;t placed any orders yet.
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const totalAmount = Number(order.total || 0);

              return (
                <div key={order.id} className="rounded-2xl border p-6">
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                      <p className="font-semibold">
                        Order #{order.id}
                      </p>

                      <p className="text-sm text-gray-500">
                        {new Date(order.created_at).toLocaleDateString(
                          "en-IN",
                          {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          }
                        )}
                      </p>
                    </div>

                    <div className="sm:text-right">
                      <p className="font-semibold">
                        ₹{totalAmount.toLocaleString("en-IN")}
                      </p>

                      <p className="text-sm">
                        {order.order_status || "Pending"}
                      </p>

                      <p className="text-sm text-gray-500">
                        Payment: {order.payment_status || "Pending"}
                      </p>
                    </div>
                  </div>

                  <Link
                    href={`/account/orders/${order.id}`}
                    className="mt-5 inline-block underline"
                  >
                    View Details →
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}