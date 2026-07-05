import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Background Image */}
      <Image
        src="/images/hero.png"
        alt="QUN Hero Banner"
        fill
        priority
        className="object-cover"
      />

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/45" />

      {/* Content */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="max-w-4xl px-6 text-center text-white">
          <p className="mb-5 text-sm uppercase tracking-[0.45em] text-gray-200 md:text-base">
            PREMIUM STREETWEAR • NEW ARRIVALS
          </p>

          <h1 className="text-5xl font-light leading-tight md:text-7xl lg:text-8xl">
            WEAR
            <br />
            CONFIDENCE.
          </h1>

          <p className="mx-auto mt-8 max-w-2xl text-lg text-gray-200 md:text-xl">
            Premium oversized essentials crafted with comfort, quality, and
            timeless style for everyday wear.
          </p>

          <div className="mt-12 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/products"
              className="rounded-full bg-white px-10 py-4 font-semibold uppercase tracking-widest text-black transition hover:bg-gray-200"
            >
              Shop Collection
            </Link>

            <Link
              href="/cart"
              className="rounded-full border border-white px-10 py-4 font-semibold uppercase tracking-widest transition hover:bg-white hover:text-black"
            >
              View Cart
            </Link>
          </div>

          <div className="mt-16 text-sm uppercase tracking-[0.35em] text-gray-300">
            French Terry • Premium Fit • Everyday Comfort
          </div>
        </div>
      </div>
    </section>
  );
}