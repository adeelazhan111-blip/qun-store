"use client";

import { useCallback, useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function WishlistButton({
  productId,
}: {
  productId: string;
}) {
  const supabase = createClient();
  const router = useRouter();

  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkWishlist = useCallback(async () => {
    setLoading(true);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setSaved(false);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("wishlists")
      .select("id")
      .eq("product_id", productId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      console.error("Failed to check wishlist:", error.message);
    }

    setSaved(Boolean(data));
    setLoading(false);
  }, [productId, supabase]);

  useEffect(() => {
    void checkWishlist();
  }, [checkWishlist]);

  async function toggleWishlist(
    event: React.MouseEvent<HTMLButtonElement>
  ) {
    event.preventDefault();
    event.stopPropagation();

    if (loading) return;

    setLoading(true);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setLoading(false);
      router.push(
        `/account/login?redirect=${encodeURIComponent(
          window.location.pathname
        )}`
      );
      return;
    }

    if (saved) {
      const { error } = await supabase
        .from("wishlists")
        .delete()
        .eq("product_id", productId)
        .eq("user_id", user.id);

      if (error) {
        console.error("Failed to remove wishlist item:", error.message);
        setLoading(false);
        return;
      }

      setSaved(false);
    } else {
      const { error } = await supabase.from("wishlists").insert({
        product_id: productId,
        user_id: user.id,
      });

      if (error) {
        console.error("Failed to add wishlist item:", error.message);
        setLoading(false);
        return;
      }

      setSaved(true);
    }

    setLoading(false);
  }

  return (
    <button
      type="button"
      onClick={toggleWishlist}
      disabled={loading}
      className="
        absolute right-3 top-3 z-20
        rounded-full border border-black/10
        bg-white/95 p-3 shadow-md
        transition duration-200
        hover:scale-105 hover:shadow-lg
        disabled:cursor-not-allowed disabled:opacity-60
      "
      aria-label={
        saved ? "Remove from wishlist" : "Add to wishlist"
      }
      aria-pressed={saved}
    >
      <Heart
        size={22}
        className={
          saved
            ? "fill-red-500 text-red-500"
            : "text-black"
        }
      />
    </button>
  );
}