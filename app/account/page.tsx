import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default async function AccountPage() {
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
    </main>
  );
}