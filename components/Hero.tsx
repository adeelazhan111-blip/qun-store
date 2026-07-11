import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative w-full overflow-hidden bg-black pt-20">
      <div className="relative aspect-[2/1] w-full md:aspect-[16/7]">
        <Image
          src="/images/hero.png"
          alt="QUN Premium Streetwear"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />

        <Link
          href="/products"
          aria-label="Shop QUN collection"
          className="absolute inset-0"
        />
      </div>
    </section>
  );
}