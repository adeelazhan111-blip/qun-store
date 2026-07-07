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

    const name = String(formData.get("name") || "").trim();
    const price = Number(formData.get("price"));
    const description = String(formData.get("description") || "").trim();
    const imageFile = formData.get("image") as File;

    const stockS = Number(formData.get("stock_s"));
    const stockM = Number(formData.get("stock_m"));
    const stockL = Number(formData.get("stock_l"));
    const stockXL = Number(formData.get("stock_xl"));

    if (!name || !price || !description || !imageFile?.name) {
      setMessage("❌ Please fill all fields.");
      setLoading(false);
      return;
    }

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

    const { data: publicUrlData } = supabase.storage
      .from("products")
      .getPublicUrl(fileName);

    const image = publicUrlData.publicUrl;

    const { error: productError } = await supabase.from("products").insert({
      id: slug,
      name,
      price,
      description,
      image,
    });

    if (productError) {
      setMessage("❌ Product error: " + productError.message);
      setLoading(false);
      return;
    }

    const { error: sizeError } = await supabase.from("product_sizes").insert([
      { product_id: slug, size: "S", stock: stockS },
      { product_id: slug, size: "M", stock: stockM },
      { product_id: slug, size: "L", stock: stockL },
      { product_id: slug, size: "XL", stock: stockXL },
    ]);

    if (sizeError) {
      setMessage("❌ Size stock error: " + sizeError.message);
      setLoading(false);
      return;
    }

    setMessage("✅ Product saved successfully!");
    form.reset();
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
          rows={4}
          className="w-full border p-3 rounded-lg"
        />

        <input
          name="image"
          type="file"
          accept="image/*"
          required
          className="w-full border p-3 rounded-lg"
        />

        <h2 className="text-2xl font-bold">Size Stock</h2>

        <input
          name="stock_s"
          type="number"
          placeholder="S Stock"
          required
          min="0"
          className="w-full border p-3 rounded-lg"
        />

        <input
          name="stock_m"
          type="number"
          placeholder="M Stock"
          required
          min="0"
          className="w-full border p-3 rounded-lg"
        />

        <input
          name="stock_l"
          type="number"
          placeholder="L Stock"
          required
          min="0"
          className="w-full border p-3 rounded-lg"
        />

        <input
          name="stock_xl"
          type="number"
          placeholder="XL Stock"
          required
          min="0"
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