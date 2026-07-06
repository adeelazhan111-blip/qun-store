import EditProductForm from "@/components/EditProductForm";
import { supabase } from "@/lib/supabase";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: product, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !product) {
    return <main className="p-10">Product not found</main>;
  }

  return (
    <main className="max-w-2xl mx-auto p-10">
      <h1 className="text-4xl font-bold mb-8">
        Edit Product
      </h1>

      <EditProductForm product={product} />
    </main>
  );
}