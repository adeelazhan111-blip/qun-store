import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AddressesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/account/login");
  }

  const { data: addresses, error } = await supabase
    .from("addresses")
    .select("*")
    .eq("user_id", user.id)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false });

  return (
    <main className="mx-auto max-w-5xl px-6 py-24">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-4xl font-bold">Saved Addresses</h1>

          <p className="mt-2 text-gray-500">
            Manage your delivery addresses.
          </p>
        </div>

        <Link
          href="/account/addresses/add"
          className="rounded-xl bg-black px-5 py-3 text-center font-semibold text-white"
        >
          Add New Address
        </Link>
      </div>

      <Link
        href="/account"
        className="mb-8 inline-block text-sm underline"
      >
        ← Back to My Account
      </Link>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-red-700">
          Unable to load your addresses.
        </div>
      ) : !addresses || addresses.length === 0 ? (
        <div className="rounded-2xl border p-8 text-center">
          <p className="text-gray-500">
            You have not saved any addresses yet.
          </p>

          <Link
            href="/account/addresses/add"
            className="mt-5 inline-block underline"
          >
            Add your first address
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {addresses.map((address) => (
            <div
              key={address.id}
              className="rounded-2xl border p-6"
            >
              <div className="mb-4 flex items-start justify-between gap-4">
                <h2 className="text-xl font-semibold">
                  {address.full_name || "Delivery Address"}
                </h2>

                {address.is_default && (
                  <span className="rounded-full bg-black px-3 py-1 text-xs text-white">
                    Default
                  </span>
                )}
              </div>

              <div className="space-y-1 text-sm text-gray-700">
                <p>{address.phone}</p>
                <p>{address.address}</p>
                <p>
                  {address.city}, {address.state}
                </p>
                <p>PIN: {address.pincode}</p>
              </div>

              <div className="mt-6 flex gap-4">
                <Link
                  href={`/account/addresses/${address.id}/edit`}
                  className="text-sm underline"
                >
                  Edit
                </Link>

                <Link
                  href={`/account/addresses/${address.id}/delete`}
                  className="text-sm text-red-600 underline"
                >
                  Delete
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}