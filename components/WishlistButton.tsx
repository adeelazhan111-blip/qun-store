"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function WishlistButton({
  productId,
}: {
  productId: string;
}) {
  const supabase = createClient();
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function checkWishlist() {
      const { data } = await supabase
        .from("wishlists")
        .select("id")
        .eq("product_id", productId)
        .maybeSingle();

      setSaved(!!data);
    }

    checkWishlist();
  }, [productId]);

  async function toggleWishlist(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();

    if (saved) {
      await supabase.from("wishlists").delete().eq("product_id", productId);
      setSaved(false);
    } else {
      await supabase.from("wishlists").insert({ product_id: productId });
      setSaved(true);
    }
  }

  return (
    <button
      type="button"
      onClick={toggleWishlist}
      className="absolute top-3 right-3 z-20 bg-white rounded-full p-3 shadow-md border"
      aria-label="Add to wishlist"
    >
      <Heart
        size={22}
        className={saved ? "fill-red-500 text-red-500" : "text-black"}
      />
    </button>
  );
}