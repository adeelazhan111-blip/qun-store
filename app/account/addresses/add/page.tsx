"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AddAddressPage() {
  const supabase = createClient();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setLoading(true);
    setErrorMessage("");

    const formData = new FormData(e.currentTarget);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setLoading(false);
      setErrorMessage("Please log in before adding an address.");
      return;
    }

    const isDefault = formData.get("is_default") === "on";

    if (isDefault) {
      const { error: defaultError } = await supabase
        .from("addresses")
        .update({ is_default: false })
        .eq("user_id", user.id);

      if (defaultError) {
        setLoading(false);
        setErrorMessage(defaultError.message);
        return;
      }
    }

    const { error } = await supabase.from("addresses").insert({
      user_id: user.id,
      full_name: String(formData.get("full_name") || "").trim(),
      phone: String(formData.get("phone") || "").trim(),
      address: String(formData.get("address") || "").trim(),
      city: String(formData.get("city") || "").trim(),
      state: String(formData.get("state") || "").trim(),
      pincode: String(formData.get("pincode") || "").trim(),
      is_default: isDefault,
    });

    setLoading(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    router.push("/account/addresses");
    router.refresh();
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-24">
      <Link
        href="/account/addresses"
        className="mb-8 inline-block text-sm underline"
      >
        ← Back to Saved Addresses
      </Link>

      <h1 className="mb-8 text-4xl font-bold">Add New Address</h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-2xl border p-8"
      >
        <div>
          <label
            htmlFor="full_name"
            className="mb-2 block text-sm font-medium"
          >
            Full name
          </label>

          <input
            id="full_name"
            name="full_name"
            type="text"
            required
            className="w-full rounded-xl border p-4"
          />
        </div>

        <div>
          <label
            htmlFor="phone"
            className="mb-2 block text-sm font-medium"
          >
            Phone number
          </label>

          <input
            id="phone"
            name="phone"
            type="tel"
            required
            pattern="[0-9]{10}"
            inputMode="numeric"
            placeholder="10-digit mobile number"
            className="w-full rounded-xl border p-4"
          />
        </div>

        <div>
          <label
            htmlFor="address"
            className="mb-2 block text-sm font-medium"
          >
            Address
          </label>

          <textarea
            id="address"
            name="address"
            required
            rows={4}
            placeholder="House number, street, area and landmark"
            className="w-full rounded-xl border p-4"
          />
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label
              htmlFor="city"
              className="mb-2 block text-sm font-medium"
            >
              City
            </label>

            <input
              id="city"
              name="city"
              type="text"
              required
              className="w-full rounded-xl border p-4"
            />
          </div>

          <div>
            <label
              htmlFor="state"
              className="mb-2 block text-sm font-medium"
            >
              State
            </label>

            <input
              id="state"
              name="state"
              type="text"
              required
              className="w-full rounded-xl border p-4"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="pincode"
            className="mb-2 block text-sm font-medium"
          >
            PIN code
          </label>

          <input
            id="pincode"
            name="pincode"
            type="text"
            required
            pattern="[0-9]{6}"
            inputMode="numeric"
            placeholder="6-digit PIN code"
            className="w-full rounded-xl border p-4"
          />
        </div>

        <label className="flex items-center gap-3">
          <input
            name="is_default"
            type="checkbox"
            className="h-4 w-4"
          />

          <span className="text-sm">
            Make this my default delivery address
          </span>
        </label>

        {errorMessage && (
          <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-black py-4 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Saving..." : "Save Address"}
        </button>
      </form>
    </main>
  );
}