"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

type Product = {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
};

export default function EditProductForm({ product }: { product: Product }) {
  const supabase = createClient();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const formData = new FormData(e.currentTarget);

    const name = formData.get("name") as string;
    const price = Number(formData.get("price"));
    const description = formData.get("description") as string;

    const { error } = await supabase
      .from("products")
      .update({
        name,
        price,
        description,
      })
      .eq("id", product.id);

    if (error) {
      setMessage("❌ Error: " + error.message);
    } else {
      setMessage("✅ Product updated successfully!");
      router.refresh();
      router.push("/admin");
    }

    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {message && <p className="font-medium">{message}</p>}

      <input
        name="name"
        type="text"
        defaultValue={product.name}
        required
        className="w-full border p-3 rounded-lg"
      />

      <input
        name="price"
        type="number"
        defaultValue={product.price}
        required
        className="w-full border p-3 rounded-lg"
      />

      <textarea
        name="description"
        defaultValue={product.description}
        required
        className="w-full border p-3 rounded-lg"
        rows={4}
      />

      <button
        type="submit"
        disabled={loading}
        className="bg-black text-white px-8 py-3 rounded-lg disabled:opacity-50"
      >
        {loading ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
}