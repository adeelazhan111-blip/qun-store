import ProductDetails from "@/components/ProductDetails";
import Image from "next/image";

const products: Record<string, any> = {
  "oversized-cream": {
    id: "oversized-cream",
    name: "Oversized Cream Tee",
    price: "₹799",
    image: "/images/oversized-cream.png",
    description: "Premium oversized fit made with soft French Terry fabric.",
  },
  "polo-black": {
    id: "polo-black",
    name: "Polo Black Tee",
    price: "₹899",
    image: "/images/polo-black.png",
    description: "Minimal black polo for everyday premium styling.",
  },
  "polo-white": {
    id: "polo-white",
    name: "Polo White Tee",
    price: "₹899",
    image: "/images/polo-white.png",
    description: "Clean white polo designed for a timeless look.",
  },
};

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = products[slug];

  if (!product) {
    return <div className="p-10">Product not found</div>;
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
        <p className="text-xl font-semibold mb-4">{product.price}</p>
        <p className="text-gray-600 mb-6">{product.description}</p>

        <ProductDetails product={product} />

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