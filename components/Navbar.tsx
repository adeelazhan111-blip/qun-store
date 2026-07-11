"use client";
import Image from "next/image";
import Link from "next/link";
import {
  ShoppingBag,
  Menu,
  X,
  Heart,
} from "lucide-react";
import { useCart } from "@/components/CartContext";
import { useEffect, useState } from "react";

export default function Navbar() {
  const { cart } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
const [scrolled, setScrolled] = useState(false);

useEffect(() => {
  const handleScroll = () => {
    setScrolled(window.scrollY > 40);
  };

  window.addEventListener("scroll", handleScroll);

  return () =>
    window.removeEventListener("scroll", handleScroll);
}, []);
  const cartCount = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  return (
    <header
  className={`fixed left-0 top-0 z-50 w-full transition-all duration-500 ${
    scrolled
      ? "border-b border-gray-200 bg-white/95 shadow-sm backdrop-blur-md"
      : "bg-transparent"
  }`}
>
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-3 md:px-6">
        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center">
  <Image
    src="/images/qun-logo-horizontal.png"
    alt="QUN — Since 2025"
    width={220}
    height={82}
    priority
    className="h-12 w-auto object-contain md:h-14"
  />
</Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-6 font-medium lg:flex">
          <Link
            href="/"
            className="relative transition duration-300 after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-0 after:bg-current after:transition-all after:duration-300 hover:after:w-full"
          >
            Home
          </Link>

          <Link
            href="/products"
            className="relative transition duration-300 after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-0 after:bg-current after:transition-all after:duration-300 hover:after:w-full"
          >
            Shop
          </Link>

          <Link
            href="/wishlist"
            className="relative transition duration-300 after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-0 after:bg-current after:transition-all after:duration-300 hover:after:w-full"
          >
            Wishlist
          </Link>

          <Link
            href="/"
            className="relative transition duration-300 after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-0 after:bg-current after:transition-all after:duration-300 hover:after:w-full"
          >
            Collections
          </Link>

          <Link
            href="/"
            className="relative transition duration-300 after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-0 after:bg-current after:transition-all after:duration-300 hover:after:w-full"
          >
            About
          </Link>

          <Link
            href="/"
            className="relative transition duration-300 after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-0 after:bg-current after:transition-all after:duration-300 hover:after:w-full"
          >
            Contact
          </Link>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-5">
          {/* Wishlist */}
          <Link
            href="/wishlist"
            className="p-2 rounded-full hover:bg-gray-100 transition"
          >
            <Heart size={23} />
          </Link>

          {/* Cart */}
          <Link
            href="/cart"
            className="relative p-2 rounded-full hover:bg-gray-100 transition"
          >
            <ShoppingBag size={24} />

            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-black text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Shop Button */}
          <Link
            href="/products"
            className="hidden rounded-full bg-black px-6 py-3 font-medium text-white transition duration-300 hover:scale-105 hover:bg-gray-900 lg:block"
          >
            Shop Now
          </Link>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden border-t bg-white">
          <div className="flex flex-col px-6 py-4 gap-4 font-medium">
            <Link
              href="/"
              onClick={() => setMenuOpen(false)}
            >
              Home
            </Link>

            <Link
              href="/products"
              onClick={() => setMenuOpen(false)}
            >
              Shop
            </Link>

            <Link
              href="/wishlist"
              onClick={() => setMenuOpen(false)}
            >
              Wishlist
            </Link>

            <Link
              href="/"
              onClick={() => setMenuOpen(false)}
            >
              Collections
            </Link>

            <Link
              href="/"
              onClick={() => setMenuOpen(false)}
            >
              About
            </Link>

            <Link
              href="/"
              onClick={() => setMenuOpen(false)}
            >
              Contact
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}