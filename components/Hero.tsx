import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative w-full bg-black pt-20">
      <Image
        src="/images/hero.png"
        alt="QUN Premium Streetwear"
        width={1536}
        height={1024}
        priority
        className="w-full h-auto"
      />

      {/* Animated Explore Button */}
      <Link
        href="/products"
        className="
        absolute
        left-[6.3%]
        top-[66.5%]
        group
      "
      >
        <div
          className="
          flex items-center gap-3
          border border-white/60
          px-9 py-5
          text-white
          uppercase
          tracking-[0.22em]
          backdrop-blur-sm
          transition-all
          duration-500
          hover:bg-white
          hover:text-black
          hover:scale-105
          hover:shadow-2xl
        "
        >
          <span className="font-medium">
            Explore Collection
          </span>

          <ArrowRight
            size={18}
            className="transition-transform duration-500 group-hover:translate-x-2"
          />
        </div>
      </Link>
    </section>
  );
}