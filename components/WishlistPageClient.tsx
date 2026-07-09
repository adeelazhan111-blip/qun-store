"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useCart } from "@/components/CartContext";

type WishlistProduct = {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
};

export default function WishlistPageClient() {
  const supabase = createClient();
  const { addToCart } = useCart();

  const [products, setProducts] = useState<WishlistProduct[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadWishlist() {
    setLoading(true);

    const { data, error } = await supabase
      .from("wishlists")
      .select("product_id, products(*)")
      .order("created_at", { ascending: false });

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    const wishlistProducts =
      data
        ?.map((item: any) => item.products)
        .filter(Boolean) || [];

    setProducts(wishlistProducts);
    setLoading(false);
  }

  async function removeFromWishlist(productId: string) {
    await supabase
      .from("wishlists")
      .delete()
      .eq("product_id", productId);

    setProducts((current) =>
      current.filter((product) => product.id !== productId)
    );
  }

  function moveToCart(product: WishlistProduct) {
    addToCart({
      id: product.id,
      name: product.name,
      price: `₹${product.price}`,
      image: product.image,
      size: "M",
      quantity: 1,
    });

    alert("Moved to cart with size M. You can change size from product page if needed.");
  }

  useEffect(() => {
    loadWishlist();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen px-6 py-24">
        <p className="text-center text-gray-500">Loading wishlist...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-6 py-24">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-10">My Wishlist</h1>

        {products.length === 0 ? (
          <div className="bg-gray-50 rounded-2xl p-10 text-center">
            <h2 className="text-2xl font-semibold mb-3">
              Your wishlist is empty
            </h2>
            <p className="text-gray-500 mb-6">
              Save your favourite QUN pieces and find them here later.
            </p>

            <Link
              href="/products"
              className="inline-block bg-black text-white px-6 py-3 rounded-xl"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {products.map((product) => (
              <div
                key={product.id}
                className="border rounded-2xl overflow-hidden bg-white"
              >
                <Link href={`/product/${product.id}`}>
                  <Image
                    src={product.image}
                    alt={product.name}
                    width={500}
                    height={500}
                    className="w-full"
                  />
                </Link>

                <div className="p-5">
                  <h2 className="text-xl font-semibold">{product.name}</h2>
                  <p className="text-gray-500 mb-5">₹{product.price}</p>

                  <div className="flex gap-3">
                    <button
                      onClick={() => moveToCart(product)}
                      className="flex-1 bg-black text-white py-3 rounded-xl"
                    >
                      Move to Cart
                    </button>

                    <button
                      onClick={() => removeFromWishlist(product.id)}
                      className="px-4 border rounded-xl"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}