"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, Menu, X, Heart } from "lucide-react";
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

    handleScroll();
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const cartCount = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const lightNavbar = scrolled || menuOpen;

  const navLinkClass =
    "relative transition duration-300 after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-0 after:bg-current after:transition-all after:duration-300 hover:after:w-full";

  return (
    <header
      className={`fixed left-0 top-0 z-50 w-full transition-all duration-500 ${
        lightNavbar
          ? "border-b border-gray-200 bg-white/95 text-[#07152f] shadow-sm backdrop-blur-md"
          : "bg-black/20 text-white backdrop-blur-sm"
      }`}
    >
      <nav
        className={`mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 transition-all duration-500 md:px-6 ${
          scrolled ? "py-2" : "py-3"
        }`}
      >
        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center">
          <Image
            src="/images/qun-logo-horizontal.png"
            alt="QUN"
            width={220}
            height={60}
            priority
            className={`h-12 w-auto object-contain transition-all duration-300 ${
              lightNavbar ? "" : "brightness-0 invert"
            }`}
          />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-6 font-medium lg:flex">
          <Link href="/" className={navLinkClass}>
            Home
          </Link>

          <Link href="/products" className={navLinkClass}>
            Shop
          </Link>

          <Link href="/wishlist" className={navLinkClass}>
            Wishlist
          </Link>

          <Link href="/#collections" className={navLinkClass}>
            Collections
          </Link>

          <Link href="/#about" className={navLinkClass}>
            About
          </Link>

          <Link href="/#contact" className={navLinkClass}>
            Contact
          </Link>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-3 sm:gap-4 lg:gap-5">
          <Link
            href="/wishlist"
            aria-label="Open wishlist"
            className={`rounded-full p-2 transition ${
              lightNavbar
                ? "hover:bg-gray-100"
                : "hover:bg-white/15"
            }`}
          >
            <Heart size={23} />
          </Link>

          <Link
            href="/cart"
            aria-label="Open shopping cart"
            className={`relative rounded-full p-2 transition ${
              lightNavbar
                ? "hover:bg-gray-100"
                : "hover:bg-white/15"
            }`}
          >
            <ShoppingBag size={24} />

            {cartCount > 0 && (
              <span
                className={`absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-xs ${
                  lightNavbar
                    ? "bg-black text-white"
                    : "bg-white text-black"
                }`}
              >
                {cartCount}
              </span>
            )}
          </Link>

          <Link
            href="/products"
            className={`hidden rounded-full px-6 py-3 font-medium transition duration-300 hover:scale-105 lg:block ${
              lightNavbar
                ? "bg-black text-white hover:bg-gray-900"
                : "bg-white text-black hover:bg-gray-100"
            }`}
          >
            Shop Now
          </Link>

          {/* Mobile Menu Button */}
          <button
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            className="rounded-full p-2 transition hover:bg-gray-100/20 lg:hidden"
            onClick={() => setMenuOpen((current) => !current)}
          >
            {menuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="border-t border-gray-200 bg-white text-[#07152f] lg:hidden">
          <div className="flex flex-col gap-4 px-6 py-5 font-medium">
            <Link href="/" onClick={() => setMenuOpen(false)}>
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
              href="/#collections"
              onClick={() => setMenuOpen(false)}
            >
              Collections
            </Link>

            <Link
              href="/#about"
              onClick={() => setMenuOpen(false)}
            >
              About
            </Link>

            <Link
              href="/#contact"
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