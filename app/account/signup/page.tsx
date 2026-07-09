"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AccountSignupPage() {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    const fullName = String(formData.get("fullName"));
    const phone = String(formData.get("phone"));
    const email = String(formData.get("email"));
    const password = String(formData.get("password"));

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setLoading(false);
      alert(error.message);
      return;
    }

    if (data.user) {
      await supabase.from("profiles").insert({
        id: data.user.id,
        full_name: fullName,
        phone,
      });
    }

    setLoading(false);
    alert("Account created successfully!");
    router.push("/account");
    router.refresh();
  }

  return (
    <main className="min-h-screen px-6 py-24 flex items-center justify-center">
      <form onSubmit={handleSignup} className="w-full max-w-md border rounded-2xl p-8 space-y-5">
        <h1 className="text-3xl font-bold">Create Account</h1>

        <input name="fullName" type="text" placeholder="Full Name" required className="w-full border rounded-xl p-4" />
        <input name="phone" type="tel" placeholder="Phone Number" required className="w-full border rounded-xl p-4" />
        <input name="email" type="email" placeholder="Email" required className="w-full border rounded-xl p-4" />
        <input name="password" type="password" placeholder="Password" required className="w-full border rounded-xl p-4" />

        <button disabled={loading} className="w-full bg-black text-white py-4 rounded-xl">
          {loading ? "Creating..." : "Create Account"}
        </button>

        <p className="text-sm text-gray-500">
          Already have an account? <Link href="/account/login" className="underline">Login</Link>
        </p>
      </form>
    </main>
  );
}