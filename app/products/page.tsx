import Link from "next/link";
import Image from "next/image";
import { products } from "@/lib/products";

export default function ProductsPage() {
  return (
    <main className="max-w-7xl mx-auto px-6 py-20">
      <h1 className="text-5xl font-bold mb-12 text-center">
        Shop Collection
      </h1>

      <div className="grid md:grid-cols-3 gap-10">
        {Object.values(products).map((product) => (
          <Link
            key={product.id}
            href={`/product/${product.id}`}
            className="group"
          >
            <div className="overflow-hidden rounded-2xl bg-gray-100">
              <Image
                src={product.image}
                alt={product.name}
                width={500}
                height={500}
                className="group-hover:scale-105 transition duration-500"
              />
            </div>

            <h2 className="mt-4 text-xl font-semibold">
              {product.name}
            </h2>

            <p className="text-gray-500">
              {product.price}
            </p>
          </Link>
        ))}
      </div>
    </main>
  );
}