"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import WishlistButton from "@/components/WishlistButton";

type Product = {
  id: string;
  name: string;
  price: number | string;
  image: string;
  description?: string | null;
  category?: string | null;
};

export default function ProductsGrid({
  products,
}: {
  products: Product[];
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [priceFilter, setPriceFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const categories = useMemo(() => {
    return Array.from(
      new Set(
        products
          .map((product) => product.category)
          .filter((category): category is string => Boolean(category))
      )
    ).sort();
  }, [products]);

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const result = products.filter((product) => {
      const matchesSearch =
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.category?.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query);

      if (!matchesSearch) {
        return false;
      }

      if (
        categoryFilter !== "all" &&
        product.category !== categoryFilter
      ) {
        return false;
      }

      const price = Number(product.price);

      if (priceFilter === "under1000") {
        return price < 1000;
      }

      if (priceFilter === "1000to2000") {
        return price >= 1000 && price <= 2000;
      }

      if (priceFilter === "above2000") {
        return price > 2000;
      }

      return true;
    });

    if (sortBy === "low") {
      result.sort((a, b) => Number(a.price) - Number(b.price));
    }

    if (sortBy === "high") {
      result.sort((a, b) => Number(b.price) - Number(a.price));
    }

    return result;
  }, [
    products,
    searchQuery,
    priceFilter,
    categoryFilter,
    sortBy,
  ]);

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
        <select
          value={categoryFilter}
          onChange={(event) => setCategoryFilter(event.target.value)}
          className="rounded-xl border px-4 py-3"
        >
          <option value="all">All Categories</option>

          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

        <select
          value={priceFilter}
          onChange={(event) => setPriceFilter(event.target.value)}
          className="rounded-xl border px-4 py-3"
        >
          <option value="all">All Prices</option>
          <option value="under1000">Under ₹1000</option>
          <option value="1000to2000">₹1000 - ₹2000</option>
          <option value="above2000">Above ₹2000</option>
        </select>

        <select
          value={sortBy}
          onChange={(event) => setSortBy(event.target.value)}
          className="rounded-xl border px-4 py-3"
        >
          <option value="newest">Newest</option>
          <option value="low">Price: Low → High</option>
          <option value="high">Price: High → Low</option>
        </select>
      </div>

      <div className="mx-auto mb-12 max-w-xl">
        <label htmlFor="product-search" className="sr-only">
          Search products
        </label>

        <input
          id="product-search"
          type="search"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search products..."
          className="w-full rounded-xl border px-5 py-4 outline-none focus:ring-2 focus:ring-black"
        />
      </div>

      {filteredProducts.length === 0 ? (
        <div className="rounded-2xl border p-10 text-center">
          <h2 className="text-xl font-semibold">
            No products found
          </h2>

          <p className="mt-2 text-gray-500">
            Try changing your search or filters.
          </p>
        </div>
      ) : (
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-3">
          {filteredProducts.map((product) => (
            <div key={product.id} className="group">
              <div className="relative overflow-hidden rounded-2xl bg-gray-100">
                <div className="absolute right-3 top-3 z-10">
                  <WishlistButton productId={product.id} />
                </div>

                <Link href={`/product/${product.id}`}>
  <Image
    src={product.image}
    alt={product.name}
    width={500}
    height={500}
    unoptimized
    className="aspect-square w-full object-cover transition duration-500 group-hover:scale-105"
  />
</Link>
              </div>

              <Link href={`/product/${product.id}`}>
                <h2 className="mt-4 text-xl font-semibold">
                  {product.name}
                </h2>

                {product.category && (
                  <p className="text-sm text-gray-400">
                    {product.category}
                  </p>
                )}

                <p className="text-gray-500">
                  ₹{Number(product.price).toLocaleString("en-IN")}
                </p>
              </Link>
            </div>
          ))}
        </div>
      )}
    </>
  );
}