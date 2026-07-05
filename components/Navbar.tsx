"use client";

import Link from "next/link";
import { ShoppingBag, Menu, X } from "lucide-react";
import { useCart } from "@/components/CartContext";
import { useState } from "react";

export default function Navbar() {
  const { cart } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  const cartCount = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

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

        {/* Desktop Navigation */}
        <div className="hidden md:flex gap-8 font-medium">
          <Link href="/" className="hover:text-gray-500 transition">
            Home
          </Link>

          <Link
            href="/products"
            className="hover:text-gray-500 transition"
          >
            Shop
          </Link>

          <Link href="/" className="hover:text-gray-500 transition">
            Collections
          </Link>

          <Link href="/" className="hover:text-gray-500 transition">
            About
          </Link>

          <Link href="/" className="hover:text-gray-500 transition">
            Contact
          </Link>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-4">
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

          <Link
            href="/products"
            className="hidden md:block border border-black px-5 py-2 rounded-full hover:bg-black hover:text-white transition"
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
            <Link href="/" onClick={() => setMenuOpen(false)}>
              Home
            </Link>

            <Link href="/products" onClick={() => setMenuOpen(false)}>
              Shop
            </Link>

            <Link href="/" onClick={() => setMenuOpen(false)}>
              Collections
            </Link>

            <Link href="/" onClick={() => setMenuOpen(false)}>
              About
            </Link>

            <Link href="/" onClick={() => setMenuOpen(false)}>
              Contact
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}