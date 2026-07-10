"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type UserData = {
  id: string;
  email?: string;
};

type ProfileData = {
  full_name?: string | null;
  phone?: string | null;
} | null;

export default function EditProfileForm({
  user,
  profile,
}: {
  user: UserData;
  profile: ProfileData;
}) {
  const supabase = createClient();
  const router = useRouter();

  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setLoading(true);
    setMessage("");
    setErrorMessage("");

    const { error } = await supabase.from("profiles").upsert(
      {
        id: user.id,
        full_name: fullName.trim(),
        phone: phone.trim(),
      },
      {
        onConflict: "id",
      }
    );

    setLoading(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setMessage("Profile updated successfully.");
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-2xl border p-8"
    >
      <div>
        <label
          htmlFor="fullName"
          className="mb-2 block text-sm font-medium"
        >
          Full name
        </label>

        <input
          id="fullName"
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Your full name"
          className="w-full rounded-xl border p-4"
        />
      </div>

      <div>
        <label
          htmlFor="email"
          className="mb-2 block text-sm font-medium"
        >
          Email
        </label>

        <input
          id="email"
          type="email"
          value={user.email || ""}
          disabled
          className="w-full cursor-not-allowed rounded-xl border bg-gray-100 p-4 text-gray-500"
        />

        <p className="mt-2 text-xs text-gray-500">
          Email cannot be changed from this page.
        </p>
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
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Your phone number"
          className="w-full rounded-xl border p-4"
        />
      </div>

      {errorMessage && (
        <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      {message && (
        <div className="rounded-xl bg-green-50 p-4 text-sm text-green-700">
          {message}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-black py-4 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Saving..." : "Save changes"}
      </button>
    </form>
  );
}