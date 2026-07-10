"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function ProductReviewForm({
  productId,
}: {
  productId: string;
}) {
  const supabase = createClient();
  const router = useRouter();

  const [rating, setRating] = useState(5);
  const [review, setReview] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [needsLogin, setNeedsLogin] = useState(false);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoading(true);
    setMessage("");
    setNeedsLogin(false);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setLoading(false);
      setNeedsLogin(true);
      return;
    }

    const { error } = await supabase.from("reviews").insert({
      product_id: productId,
      user_id: user.id,
      rating,
      review: review.trim(),
    });

    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setRating(5);
    setReview("");
    setMessage("Review submitted successfully.");
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-8 space-y-5 rounded-2xl border p-6"
    >
      <div>
        <h3 className="text-xl font-semibold">
          Write a Review
        </h3>

        <p className="mt-1 text-sm text-gray-500">
          Share your experience with this product.
        </p>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">
          Rating
        </label>

        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRating(value)}
              className="text-3xl"
              aria-label={`${value} star rating`}
            >
              {value <= rating ? "★" : "☆"}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label
          htmlFor="review"
          className="mb-2 block text-sm font-medium"
        >
          Review
        </label>

        <textarea
          id="review"
          value={review}
          onChange={(event) => setReview(event.target.value)}
          rows={4}
          required
          maxLength={1000}
          placeholder="What did you like about this product?"
          className="w-full rounded-xl border p-4"
        />
      </div>

      {needsLogin && (
        <div className="rounded-xl bg-yellow-50 p-4 text-sm text-yellow-800">
          Please{" "}
          <Link
            href="/account/login"
            className="font-medium underline"
          >
            log in
          </Link>{" "}
          before submitting a review.
        </div>
      )}

      {message && (
        <div className="rounded-xl bg-gray-50 p-4 text-sm">
          {message}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="rounded-xl bg-black px-6 py-3 font-semibold text-white disabled:opacity-60"
      >
        {loading ? "Submitting..." : "Submit Review"}
      </button>
    </form>
  );
}