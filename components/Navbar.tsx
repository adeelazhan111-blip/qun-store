import Link from "next/link";
import { ShoppingBag } from "lucide-react";

export default function Navbar() {
  return (
    <header className="fixed top-0 left-0 w-full bg-white/90 backdrop-blur-md border-b border-gray-200 z-50">
      <nav className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link
          href="/"
          className="text-2xl font-extrabold tracking-[0.4em]"
        >
          QUN
        </Link>

        {/* Navigation */}
        <div className="hidden md:flex gap-8 font-medium">
          <Link href="/">Home</Link>
          <Link href="/products">Shop</Link>
          <Link href="/">Collections</Link>
          <Link href="/">About</Link>
          <Link href="/">Contact</Link>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-4">
          <Link
            href="/cart"
            className="p-2 rounded-full hover:bg-gray-100 transition"
          >
            <ShoppingBag size={24} />
          </Link>

          <Link
            href="/products"
            className="border border-black px-5 py-2 rounded-full hover:bg-black hover:text-white transition"
          >
            Shop Now
          </Link>
        </div>
      </nav>
    </header>
  );
}