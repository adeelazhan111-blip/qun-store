"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AccountLoginPage() {
  const supabase = createClient();
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  async function handleLogin(
    e: React.FormEvent<HTMLFormElement>
  ) {
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
    <main className="flex min-h-screen items-center justify-center px-6 py-24">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-md space-y-5 rounded-2xl border p-8"
      >
        <h1 className="text-3xl font-bold">
          Login
        </h1>

        <input
          name="email"
          type="email"
          placeholder="Email"
          required
          className="w-full rounded-xl border p-4"
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          required
          className="w-full rounded-xl border p-4"
        />

        <div className="text-right">
          <Link
            href="/account/forgot-password"
            className="text-sm underline"
          >
            Forgot password?
          </Link>
        </div>

        <button
          disabled={loading}
          className="w-full rounded-xl bg-black py-4 text-white"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="text-sm text-gray-500">
          New to QUN?{" "}
          <Link
            href="/account/signup"
            className="underline"
          >
            Create account
          </Link>
        </p>
      </form>
    </main>
  );
}