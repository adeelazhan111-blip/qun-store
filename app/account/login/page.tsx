"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AccountLoginPage() {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    const { error } = await supabase.auth.signInWithPassword({
      email: String(formData.get("email")),
      password: String(formData.get("password")),
    });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    router.push("/account");
    router.refresh();
  }

  return (
    <main className="min-h-screen px-6 py-24 flex items-center justify-center">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-md border rounded-2xl p-8 space-y-5"
      >
        <h1 className="text-3xl font-bold">Login</h1>

        <input name="email" type="email" placeholder="Email" required className="w-full border rounded-xl p-4" />
        <input name="password" type="password" placeholder="Password" required className="w-full border rounded-xl p-4" />

        <button disabled={loading} className="w-full bg-black text-white py-4 rounded-xl">
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="text-sm text-gray-500">
          New to QUN?{" "}
          <Link href="/account/signup" className="underline">
            Create account
          </Link>
        </p>
      </form>
    </main>
  );
}