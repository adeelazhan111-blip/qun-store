import Image from "next/image";
import Link from "next/link";
import { Mail, Phone } from "lucide-react";

function InstagramIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path d="M13.5 22v-9h3l.5-3.5h-3.5V7.3c0-1 .3-1.8 1.8-1.8H17V2.4c-.4-.1-1.4-.2-2.7-.2-2.7 0-4.6 1.7-4.6 4.8v2.5H7V13h2.7v9h3.8Z" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="bg-black text-white">
      <div className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-14 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Image
              src="/images/qun-logo-horizontal.png"
              alt="QUN"
              width={180}
              height={60}
              className="mb-6 h-12 w-auto object-contain"
            />

            <p className="max-w-xs text-sm leading-7 text-gray-400">
              Premium streetwear crafted for everyday confidence. Timeless
              silhouettes, premium fabrics, and modern minimalism.
            </p>
          </div>

          <div>
            <h3 className="mb-5 text-lg font-semibold">Shop</h3>

            <ul className="space-y-3 text-gray-400">
              <li>
                <Link href="/products" className="transition hover:text-white">
                  All Products
                </Link>
              </li>

              <li>
                <Link href="/wishlist" className="transition hover:text-white">
                  Wishlist
                </Link>
              </li>

              <li>
                <Link href="/cart" className="transition hover:text-white">
                  Cart
                </Link>
              </li>

              <li>
                <Link href="/account" className="transition hover:text-white">
                  My Account
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-5 text-lg font-semibold">Company</h3>

            <ul className="space-y-3 text-gray-400">
              <li>
                <Link href="/" className="transition hover:text-white">
                  About Us
                </Link>
              </li>

              <li>
                <Link href="/" className="transition hover:text-white">
                  Contact
                </Link>
              </li>

              <li>
                <Link href="/" className="transition hover:text-white">
                  Shipping Policy
                </Link>
              </li>

              <li>
                <Link href="/" className="transition hover:text-white">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-5 text-lg font-semibold">Contact</h3>

            <div className="space-y-4 text-gray-400">
              <div className="flex items-center gap-3">
                <Mail size={18} />
                <span>support@qun.in</span>
              </div>

              <div className="flex items-center gap-3">
                <Phone size={18} />
                <span>+91 XXXXX XXXXX</span>
              </div>

              <div className="flex gap-3 pt-3">
                <Link
                  href="/"
                  aria-label="Instagram"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-700 transition hover:border-white hover:text-white"
                >
                  <InstagramIcon />
                </Link>

                <Link
                  href="/"
                  aria-label="Facebook"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-700 transition hover:border-white hover:text-white"
                >
                  <FacebookIcon />
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 border-t border-gray-800 pt-8">
          <div className="flex flex-col items-center justify-between gap-4 text-sm text-gray-500 md:flex-row">
            <p>© 2026 QUN. All rights reserved.</p>
            <p>Premium streetwear since 2025.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}