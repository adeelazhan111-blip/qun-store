import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const products = [
  {
    slug: "oversized-cream",
    name: "Oversized Cream Tee",
    price: 799,
    image: "/images/oversized-cream.png",
    category: "Oversized",
  },
  {
    slug: "polo-black",
    name: "Polo Black Tee",
    price: 899,
    image: "/images/polo-black.png",
    category: "Polo",
  },
  {
    slug: "polo-white",
    name: "Polo White Tee",
    price: 899,
    image: "/images/polo-white.png",
    category: "Polo",
  },
];

export default function Featured() {
  return (
    <section className="bg-white px-6 py-20 md:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 flex flex-col gap-6 md:mb-16 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.35em] text-gray-500">
              QUN Collection
            </p>

            <h2 className="max-w-2xl text-4xl font-semibold tracking-tight md:text-6xl">
              Featured pieces for everyday confidence
            </h2>
          </div>

          <Link
            href="/products"
            className="group inline-flex w-fit items-center gap-2 border-b border-black pb-1 text-sm font-semibold uppercase tracking-widest"
          >
            Shop all
            <ArrowRight
              size={17}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <article key={product.slug} className="group">
              <Link
                href={`/product/${product.slug}`}
                className="block"
              >
                <div className="relative overflow-hidden rounded-2xl bg-gray-100">
                  <span className="absolute left-4 top-4 z-10 rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wider text-black shadow-sm">
                    New
                  </span>

                  <div className="relative aspect-[4/5]">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                  </div>

                  <div className="absolute inset-x-4 bottom-4 translate-y-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                    <div className="rounded-full bg-white px-5 py-3 text-center text-sm font-semibold shadow-lg">
                      View product
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex items-start justify-between gap-5">
                  <div>
                    <p className="mb-1 text-xs uppercase tracking-[0.2em] text-gray-400">
                      {product.category}
                    </p>

                    <h3 className="text-lg font-semibold transition-colors group-hover:text-gray-600">
                      {product.name}
                    </h3>
                  </div>

                  <p className="shrink-0 text-lg font-semibold">
                    ₹{product.price.toLocaleString("en-IN")}
                  </p>
                </div>
              </Link>
            </article>
          ))}
        </div>

        <div className="mt-12 text-center md:hidden">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 rounded-full bg-black px-7 py-4 text-sm font-semibold uppercase tracking-widest text-white"
          >
            View all products
            <ArrowRight size={17} />
          </Link>
        </div>
      </div>
    </section>
  );
}