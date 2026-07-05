import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default async function AdminPage() {
  const { data: products, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <main className="max-w-6xl mx-auto p-10">
        <h1 className="text-3xl font-bold text-red-600">
          Failed to load products
        </h1>
        <p>{error.message}</p>
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto p-10">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-bold">
          QUN Admin
        </h1>

        <Link
  href="/admin/add"
  className="bg-black text-white px-6 py-3 rounded-lg"
>
  Add Product
</Link>
      </div>

      <div className="space-y-4">
        {products?.map((product) => (
          <div
            key={product.id}
            className="border rounded-xl p-6 flex justify-between items-center"
          >
            <div>
              <h2 className="text-xl font-semibold">
                {product.name}
              </h2>

              <p>₹{product.price}</p>

              <p className="text-gray-500">
                Stock: {product.stock}
              </p>
            </div>

            <div className="flex gap-3">
              <button className="border px-4 py-2 rounded-lg">
                Edit
              </button>

              <button className="bg-red-600 text-white px-4 py-2 rounded-lg">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}