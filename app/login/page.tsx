"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      return;
    }

    router.push("/admin");
    router.refresh();
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-md border rounded-2xl p-8 space-y-5"
      >
        <h1 className="text-3xl font-bold text-center">Admin Login</h1>

        <input
          type="email"
          placeholder="Admin Email"
          className="w-full border p-3 rounded-lg"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border p-3 rounded-lg"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="w-full bg-black text-white py-3 rounded-lg">
          Login
        </button>
      </form>
    </main>
  );
}