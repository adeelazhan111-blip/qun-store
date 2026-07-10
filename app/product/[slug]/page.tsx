import Image from "next/image";
import { supabase } from "@/lib/supabase";
import ProductDetails from "@/components/ProductDetails";
import ProductReviewForm from "@/components/ProductReviewForm";

type Review = {
  id: string;
  rating: number;
  review: string | null;
  created_at: string;
};

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const { data: product, error: productError } = await supabase
    .from("products")
    .select("*")
    .eq("id", slug)
    .single();

  const { data: sizes } = await supabase
    .from("product_sizes")
    .select("*")
    .eq("product_id", slug)
    .order("size");

  const { data: reviews, error: reviewsError } = await supabase
    .from("reviews")
    .select("id, rating, review, created_at")
    .eq("product_id", slug)
    .order("created_at", { ascending: false });

  if (productError || !product) {
    return (
      <main className="p-10 text-center">
        <h1 className="text-3xl font-bold">Product not found</h1>
      </main>
    );
  }

  const reviewList = (reviews || []) as Review[];

  const averageRating =
    reviewList.length > 0
      ? reviewList.reduce(
          (total, review) => total + Number(review.rating),
          0
        ) / reviewList.length
      : 0;

  return (
    <main className="mx-auto max-w-6xl px-6 py-20">
      <div className="grid gap-10 md:grid-cols-2">
        <div>
          <Image
            src={product.image}
            alt={product.name}
            width={600}
            height={600}
            priority
            className="aspect-square w-full rounded-2xl object-cover"
          />
        </div>

        <div>
          <h1 className="mb-4 text-4xl font-bold">
            {product.name}
          </h1>

          <div className="mb-4 flex flex-wrap items-center gap-3">
            <p className="text-xl font-semibold">
              ₹{Number(product.price).toLocaleString("en-IN")}
            </p>

            {reviewList.length > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-lg text-yellow-500">
                  ★
                </span>

                <span className="font-semibold">
                  {averageRating.toFixed(1)}
                </span>

                <span className="text-gray-500">
                  ({reviewList.length}{" "}
                  {reviewList.length === 1 ? "review" : "reviews"})
                </span>
              </div>
            )}
          </div>

          <p className="mb-6 text-gray-600">
            {product.description}
          </p>

          <ProductDetails
            product={{
              id: product.id,
              name: product.name,
              price: `₹${product.price}`,
              image: product.image,
              description: product.description,
              product_sizes: sizes || [],
            }}
          />

          <div className="mt-10 border-t pt-8">
            <h2 className="mb-4 text-2xl font-bold">
              Product Details
            </h2>

            <ul className="space-y-2 text-gray-600">
              <li>• Premium French Terry Fabric</li>
              <li>• Oversized Relaxed Fit</li>
              <li>• Soft &amp; Breathable</li>
              <li>• Durable Stitching</li>
              <li>• Perfect for Everyday Wear</li>
            </ul>
          </div>

          <div className="mt-10 border-t pt-8">
            <h2 className="mb-4 text-2xl font-bold">
              Wash Care
            </h2>

            <ul className="space-y-2 text-gray-600">
              <li>• Machine wash cold</li>
              <li>• Do not bleach</li>
              <li>• Iron inside out</li>
              <li>• Dry in shade</li>
            </ul>
          </div>
        </div>
      </div>

      <section className="mt-16 border-t pt-12">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h2 className="text-3xl font-bold">
              Customer Reviews
            </h2>

            {reviewList.length > 0 ? (
              <p className="mt-2 text-gray-500">
                {averageRating.toFixed(1)} out of 5 from{" "}
                {reviewList.length}{" "}
                {reviewList.length === 1 ? "review" : "reviews"}
              </p>
            ) : (
              <p className="mt-2 text-gray-500">
                This product has no reviews yet.
              </p>
            )}
          </div>

          {reviewList.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-3xl text-yellow-500">★</span>
              <span className="text-3xl font-bold">
                {averageRating.toFixed(1)}
              </span>
            </div>
          )}
        </div>

        {reviewsError ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
            Reviews could not be loaded.
          </div>
        ) : reviewList.length === 0 ? (
          <div className="rounded-2xl border p-8 text-gray-500">
            Be the first customer to review this product.
          </div>
        ) : (
          <div className="space-y-5">
            {reviewList.map((review) => (
              <article
                key={review.id}
                className="rounded-2xl border p-6"
              >
                <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                  <div>
                    <p className="font-semibold">QUN Customer</p>

                    <p
                      className="text-lg text-yellow-500"
                      aria-label={`${review.rating} out of 5 stars`}
                    >
                      {"★".repeat(review.rating)}
                      <span className="text-gray-300">
                        {"★".repeat(5 - review.rating)}
                      </span>
                    </p>
                  </div>

                  <time className="text-sm text-gray-500">
                    {new Date(review.created_at).toLocaleDateString(
                      "en-IN",
                      {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      }
                    )}
                  </time>
                </div>

                {review.review && (
                  <p className="mt-4 whitespace-pre-line text-gray-700">
                    {review.review}
                  </p>
                )}
              </article>
            ))}
          </div>
        )}

        <ProductReviewForm productId={product.id} />
      </section>
    </main>
  );
}