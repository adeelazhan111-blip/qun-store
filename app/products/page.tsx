import { supabase } from "@/lib/supabase";
import ProductsGrid from "@/components/ProductsGrid";

export default async function ProductsPage() {
  const { data: products, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <main className="mx-auto max-w-7xl px-6 py-20">
        <h1 className="text-3xl font-bold text-red-600">
          Failed to load products
        </h1>

        <p>{error.message}</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-6 py-20">
      <h1 className="mb-12 text-center text-5xl font-bold">
        Shop Collection
      </h1>

      <ProductsGrid products={products || []} />
    </main>
  );
}