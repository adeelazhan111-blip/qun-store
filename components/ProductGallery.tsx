"use client";

import Image from "next/image";
import { useState } from "react";

type ProductImage = {
  id?: string;
  image_url: string;
  sort_order?: number | null;
};

export default function ProductGallery({
  productName,
  images,
}: {
  productName: string;
  images: ProductImage[];
}) {
  const [selectedImage, setSelectedImage] = useState(
    images[0]?.image_url || ""
  );

  if (!selectedImage) {
    return (
      <div className="aspect-square rounded-3xl bg-gray-100" />
    );
  }

  return (
    <div>
      <div className="group relative aspect-square overflow-hidden rounded-3xl bg-[#f7f7f7]">
        <Image
          key={selectedImage}
          src={selectedImage}
          alt={productName}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-contain p-6 transition-transform duration-700 group-hover:scale-105"
        />
      </div>

      {images.length > 1 && (
        <div className="mt-4 grid grid-cols-4 gap-3">
          {images.map((image, index) => {
            const isSelected =
              selectedImage === image.image_url;

            return (
              <button
                key={image.id || `${image.image_url}-${index}`}
                type="button"
                aria-label={`View product image ${index + 1}`}
                onClick={() =>
                  setSelectedImage(image.image_url)
                }
                className={`relative aspect-square overflow-hidden rounded-xl border-2 bg-[#f7f7f7] transition ${
                  isSelected
                    ? "border-[#07152f]"
                    : "border-transparent hover:border-gray-300"
                }`}
              >
                <Image
                  src={image.image_url}
                  alt={`${productName} view ${index + 1}`}
                  fill
                  sizes="120px"
                  className="object-contain p-2"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}