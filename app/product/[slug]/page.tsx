import Image from "next/image";

const products: Record<string, any> = {
  "oversized-cream": {
    name: "Oversized Cream Tee",
    price: "₹799",
    image: "/images/oversized-cream.png",
    description: "Premium oversized fit made with soft French Terry fabric.",
  },
  "polo-black": {
    name: "Polo Black Tee",
    price: "₹899",
    image: "/images/polo-black.png",
    description: "Minimal black polo for everyday premium styling.",
  },
  "polo-white": {
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
<div className="mb-6">
  <h3 className="font-semibold mb-3">Select Size</h3>

  <div className="flex gap-3">
    <button className="border px-4 py-2 rounded-lg hover:bg-black hover:text-white transition">
      S
    </button>

    <button className="border px-4 py-2 rounded-lg hover:bg-black hover:text-white transition">
      M
    </button>

    <button className="border px-4 py-2 rounded-lg hover:bg-black hover:text-white transition">
      L
    </button>

    <button className="border px-4 py-2 rounded-lg hover:bg-black hover:text-white transition">
      XL
    </button>
  </div>
</div>

<div className="mb-6">
  <h3 className="font-semibold mb-3">Quantity</h3>

  <div className="flex items-center gap-4">
    <button className="border rounded-lg px-4 py-2">
      -
    </button>

    <span className="text-xl font-semibold">
      1
    </span>

    <button className="border rounded-lg px-4 py-2">
      +
    </button>
  </div>
</div>

<button className="bg-black text-white px-8 py-3 rounded-full">
  Add to Cart
</button>

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