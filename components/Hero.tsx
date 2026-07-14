import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative w-full overflow-hidden bg-black pt-20">
      {/* Hero image */}
      <Image
        src="/images/hero.png"
        alt="QUN Premium Streetwear"
        width={1536}
        height={1024}
        priority
        className="relative z-0 h-auto w-full"
      />

      {/* Explore Collection button */}
      <Link
        href="/products"
        className="
          absolute
          left-[6.3%]
          top-[66.5%]
          z-20
          flex
          items-center
          gap-3
          rounded-full
          border
          border-white/60
          bg-black/40
          px-6
          py-3
          text-sm
          font-medium
          tracking-[0.18em]
          text-white
          backdrop-blur-md
          transition-all
          duration-300
          hover:border-white
          hover:bg-white
          hover:text-black
          md:px-8
          md:py-4
        "
      >
        <span>EXPLORE COLLECTION</span>

        <ArrowRight
          size={18}
          className="transition-transform duration-300 group-hover:translate-x-1"
        />
      </Link>
    </section>
  );
}