import ProductDetails from "@/components/ProductDetails";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const { data: product, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", slug)
    .single();

  const { data: sizes } = await supabase
    .from("product_sizes")
    .select("*")
    .eq("product_id", slug)
    .order("size");

  if (error || !product) {
    return (
      <div className="p-10 text-center">
        <h1 className="text-3xl font-bold">Product not found</h1>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-10 grid md:grid-cols-2 gap-10">
      <Image
        src={product.image}
        alt={product.name}
        width={600}
        height={600}
        className="rounded-2xl"
      />

      <div>
        <h1 className="text-4xl font-bold mb-4">{product.name}</h1>

        <p className="text-xl font-semibold mb-4">₹{product.price}</p>

        <p className="text-gray-600 mb-6">{product.description}</p>

        <ProductDetails
          product={{
            id: product.id,
            name: product.name,
            price: `₹${product.price}`,
            image: product.image,
            description: product.description,
          }}
          sizes={sizes || []}
        />

        <div className="mt-10 border-t pt-8">
          <h2 className="text-2xl font-bold mb-4">Product Details</h2>

          <ul className="space-y-2 text-gray-600">
            <li>• Premium French Terry Fabric</li>
            <li>• Oversized Relaxed Fit</li>
            <li>• Soft & Breathable</li>
            <li>• Durable Stitching</li>
            <li>• Perfect for Everyday Wear</li>
          </ul>
        </div>

        <div className="mt-10 border-t pt-8">
          <h2 className="text-2xl font-bold mb-4">Wash Care</h2>

          <ul className="space-y-2 text-gray-600">
            <li>• Machine wash cold</li>
            <li>• Do not bleach</li>
            <li>• Iron inside out</li>
            <li>• Dry in shade</li>
          </ul>
        </div>
      </div>
    </div>
  );
}