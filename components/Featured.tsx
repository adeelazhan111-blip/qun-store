import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

type Product = {
  id: string;
  name: string;
  price: number | string;
  image: string;
  category?: string | null;
};

export default function Featured({
  products,
}: {
  products: Product[];
}) {
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

        {products.length === 0 ? (
          <div className="rounded-3xl border border-gray-200 bg-[#f8f8f8] px-6 py-16 text-center">
            <h3 className="text-2xl font-semibold">
              New collection coming soon
            </h3>

            <p className="mt-3 text-gray-500">
              Add products from the admin panel to display them here.
            </p>
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <article key={product.id} className="group">
                <Link
                  href={`/product/${product.id}`}
                  className="block"
                >
                  <div className="relative overflow-hidden rounded-3xl bg-[#f8f8f8] shadow-sm transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-2xl">
                    <span className="absolute left-5 top-5 z-10 rounded-full bg-[#07152f] px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-white shadow-lg">
                      New
                    </span>

                    <div className="relative aspect-[4/5]">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="bg-[#f8f8f8] object-contain p-6 transition-transform duration-700 ease-out group-hover:scale-105"
                      />
                    </div>

                    <div className="absolute inset-x-4 bottom-4 translate-y-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                      <div className="rounded-full bg-[#07152f] px-6 py-3 text-center text-sm font-semibold text-white shadow-xl transition group-hover:bg-black">
                        View product
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 flex items-start justify-between gap-5">
                    <div>
                      {product.category && (
                        <p className="mb-1 text-xs uppercase tracking-[0.2em] text-gray-400">
                          {product.category}
                        </p>
                      )}

                      <h3 className="text-lg font-semibold transition-colors group-hover:text-gray-600">
                        {product.name}
                      </h3>
                    </div>

                    <p className="shrink-0 text-lg font-semibold">
                      ₹{Number(product.price).toLocaleString("en-IN")}
                    </p>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        )}

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