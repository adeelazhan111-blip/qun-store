"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Address = {
  id: string;
  user_id: string;
  full_name: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  is_default: boolean | null;
};

export default function EditAddressForm({
  address,
}: {
  address: Address;
}) {
  const supabase = createClient();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoading(true);
    setErrorMessage("");

    const formData = new FormData(event.currentTarget);
    const isDefault = formData.get("is_default") === "on";

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setLoading(false);
      setErrorMessage("Please log in again.");
      return;
    }

    if (isDefault) {
      const { error: defaultError } = await supabase
        .from("addresses")
        .update({ is_default: false })
        .eq("user_id", user.id)
        .neq("id", address.id);

      if (defaultError) {
        setLoading(false);
        setErrorMessage(defaultError.message);
        return;
      }
    }

    const { error } = await supabase
      .from("addresses")
      .update({
        full_name: String(formData.get("full_name") || "").trim(),
        phone: String(formData.get("phone") || "").trim(),
        address: String(formData.get("address") || "").trim(),
        city: String(formData.get("city") || "").trim(),
        state: String(formData.get("state") || "").trim(),
        pincode: String(formData.get("pincode") || "").trim(),
        is_default: isDefault,
      })
      .eq("id", address.id)
      .eq("user_id", user.id);

    setLoading(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    router.push("/account/addresses");
    router.refresh();
  }

  return (
    <>
      <Link
        href="/account/addresses"
        className="mb-8 inline-block text-sm underline"
      >
        ← Back to Saved Addresses
      </Link>

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
            defaultValue={address.full_name || ""}
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
            defaultValue={address.phone || ""}
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
            defaultValue={address.address || ""}
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
              defaultValue={address.city || ""}
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
              defaultValue={address.state || ""}
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
            defaultValue={address.pincode || ""}
            className="w-full rounded-xl border p-4"
          />
        </div>

        <label className="flex items-center gap-3">
          <input
            name="is_default"
            type="checkbox"
            defaultChecked={Boolean(address.is_default)}
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
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </>
  );
}