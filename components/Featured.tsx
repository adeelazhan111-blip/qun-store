import Image from "next/image";
import Link from "next/link";

export default function Featured() {
  const products = [
    {
      slug: "oversized-cream",
      name: "Oversized Cream Tee",
      price: "₹799",
      image: "/images/oversized-cream.png",
    },
    {
      slug: "polo-black",
      name: "Polo Black Tee",
      price: "₹899",
      image: "/images/polo-black.png",
    },
    {
      slug: "polo-white",
      name: "Polo White Tee",
      price: "₹899",
      image: "/images/polo-white.png",
    },
  ];

  return (
    <section className="bg-white py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="uppercase tracking-[0.35em] text-sm text-gray-500 mb-3">
            QUN Collection
          </p>

          <h2 className="text-5xl font-black">
            Featured Collection
          </h2>
        </div>

        <div className="grid gap-10 md:grid-cols-3">
          {products.map((item) => (
            <div
              key={item.slug}
              className="group rounded-3xl overflow-hidden bg-white transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
            >
              {/* Product Image */}
              <div className="relative overflow-hidden bg-gray-100">
                <span className="absolute top-4 left-4 z-10 rounded-full bg-black px-3 py-1 text-xs font-semibold tracking-widest text-white">
                  NEW
                </span>

                <Image
                  src={item.image}
                  alt={item.name}
                  width={600}
                  height={700}
                  className="h-[430px] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                <div className="absolute inset-0 flex items-end justify-center bg-black/0 pb-6 opacity-0 transition-all duration-300 group-hover:bg-black/10 group-hover:opacity-100">
                  <Link
                    href={`/product/${item.slug}`}
                    className="rounded-full bg-white px-8 py-3 font-semibold transition hover:bg-black hover:text-white"
                  >
                    View Product
                  </Link>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">
                    {item.name}
                  </h3>

                  <span className="font-bold">
                    {item.price}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}