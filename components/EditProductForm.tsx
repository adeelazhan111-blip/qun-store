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

type SizeStock = {
  size: string;
  stock: number;
};

export default function EditProductForm({
  product,
  sizes,
}: {
  product: Product;
  sizes: SizeStock[];
}) {
  const supabase = createClient();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const getStock = (size: string) =>
    sizes.find((item) => item.size === size)?.stock ?? 0;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const formData = new FormData(e.currentTarget);

    const name = formData.get("name") as string;
    const price = Number(formData.get("price"));
    const description = formData.get("description") as string;

    const stockS = Number(formData.get("stock_s"));
    const stockM = Number(formData.get("stock_m"));
    const stockL = Number(formData.get("stock_l"));
    const stockXL = Number(formData.get("stock_xl"));

    const { error: productError } = await supabase
      .from("products")
      .update({ name, price, description })
      .eq("id", product.id);

    if (productError) {
      setMessage("❌ Error: " + productError.message);
      setLoading(false);
      return;
    }

    await supabase.from("product_sizes").delete().eq("product_id", product.id);

    const { error: sizeError } = await supabase.from("product_sizes").insert([
      { product_id: product.id, size: "S", stock: stockS },
      { product_id: product.id, size: "M", stock: stockM },
      { product_id: product.id, size: "L", stock: stockL },
      { product_id: product.id, size: "XL", stock: stockXL },
    ]);

    if (sizeError) {
      setMessage("❌ Size error: " + sizeError.message);
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

      <input name="name" type="text" defaultValue={product.name} required className="w-full border p-3 rounded-lg" />

      <input name="price" type="number" defaultValue={product.price} required className="w-full border p-3 rounded-lg" />

      <textarea name="description" defaultValue={product.description} required className="w-full border p-3 rounded-lg" rows={4} />

      <h2 className="text-2xl font-bold">Size Stock</h2>

      <input name="stock_s" type="number" defaultValue={getStock("S")} required className="w-full border p-3 rounded-lg" />
      <input name="stock_m" type="number" defaultValue={getStock("M")} required className="w-full border p-3 rounded-lg" />
      <input name="stock_l" type="number" defaultValue={getStock("L")} required className="w-full border p-3 rounded-lg" />
      <input name="stock_xl" type="number" defaultValue={getStock("XL")} required className="w-full border p-3 rounded-lg" />

      <button type="submit" disabled={loading} className="bg-black text-white px-8 py-3 rounded-lg disabled:opacity-50">
        {loading ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
}