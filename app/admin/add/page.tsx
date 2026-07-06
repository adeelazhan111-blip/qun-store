"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AddProductPage() {
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const form = e.currentTarget;
    const formData = new FormData(form);

    const name = formData.get("name") as string;
    const price = Number(formData.get("price"));
    const description = formData.get("description") as string;
    const imageFile = formData.get("image") as File;

    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    const fileExt = imageFile.name.split(".").pop();
    const fileName = `${slug}-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("products")
      .upload(fileName, imageFile);

    if (uploadError) {
      setMessage("❌ Image upload error: " + uploadError.message);
      setLoading(false);
      return;
    }

    const { data } = supabase.storage
      .from("products")
      .getPublicUrl(fileName);

    const image = data.publicUrl;

    const { error } = await supabase.from("products").insert({
      id: slug,
      name,
      price,
      description,
      image,
    });

    if (error) {
      setMessage("❌ Error: " + error.message);
    } else {
      setMessage("✅ Product saved successfully!");
      form.reset();
    }

    setLoading(false);
  }

  return (
    <main className="max-w-2xl mx-auto p-10">
      <h1 className="text-4xl font-bold mb-8">Add Product</h1>

      {message && <p className="mb-6 font-medium">{message}</p>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <input
          name="name"
          type="text"
          placeholder="Product Name"
          required
          className="w-full border p-3 rounded-lg"
        />

        <input
          name="price"
          type="number"
          placeholder="Price"
          required
          className="w-full border p-3 rounded-lg"
        />

        <textarea
          name="description"
          placeholder="Description"
          required
          className="w-full border p-3 rounded-lg"
          rows={4}
        />

        <input
          name="image"
          type="file"
          accept="image/*"
          required
          className="w-full border p-3 rounded-lg"
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-black text-white px-8 py-3 rounded-lg disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Product"}
        </button>
      </form>
    </main>
  );
}