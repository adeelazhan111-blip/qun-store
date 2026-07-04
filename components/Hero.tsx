import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-gradient-to-b from-black via-zinc-950 to-zinc-900 text-white">
      {/* Background Glow */}
      <div className="absolute -left-32 top-24 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
      <div className="absolute -right-32 bottom-20 h-96 w-96 rounded-full bg-gray-500/10 blur-3xl" />

      {/* Watermark */}
      <h1 className="absolute inset-0 flex items-center justify-center text-[22vw] font-black tracking-[0.35em] text-white/[0.03] select-none">
        QUN
      </h1>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-center px-6 lg:flex-row">
        {/* Left */}
        <div className="flex-1 text-center lg:text-left">
          <p className="mb-4 text-sm uppercase tracking-[0.5em] text-gray-400">
            Premium Streetwear
          </p>

          <h2 className="mb-6 text-5xl font-black leading-tight md:text-7xl">
            Built For
            <br />
            Everyday
            <span className="text-gray-300"> Confidence</span>
          </h2>

          <p className="mb-10 max-w-xl text-lg leading-8 text-gray-400">
            Minimal design. Premium French Terry fabric. Oversized silhouettes
            crafted for comfort, confidence, and effortless everyday style.
          </p>

          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start">
            <Link
              href="/product/oversized-cream"
              className="rounded-full bg-white px-8 py-4 font-semibold text-black transition hover:scale-105"
            >
              Shop Now
            </Link>

            <Link
              href="#featured"
              className="rounded-full border border-white/30 px-8 py-4 transition hover:border-white hover:bg-white hover:text-black"
            >
              Explore Collection
            </Link>
          </div>
        </div>

        {/* Right */}
        <div className="mt-16 flex flex-1 justify-center lg:mt-0">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-white/10 blur-3xl" />

            <Image
              src="/images/oversized-cream.png"
              alt="QUN Oversized Cream Tee"
              width={650}
              height={650}
              priority
              className="relative drop-shadow-[0_30px_60px_rgba(255,255,255,0.15)] transition duration-500 hover:-translate-y-3"
            />
          </div>
        </div>
      </div>
    </section>
  );
}