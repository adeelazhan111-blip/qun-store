"use client";

import { useRef, useState } from "react";
import { ImagePlus, Plus, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type SelectedImage = {
  file: File;
  previewUrl: string;
};

export default function AddProductPage() {
  const supabase = createClient();
  const imageInputRef = useRef<HTMLInputElement>(null);

  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [dragging, setDragging] = useState(false);

  function handleImageSelection(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const files = Array.from(event.target.files || []);

    if (files.length === 0) {
      return;
    }

    const validFiles = files.filter((file) =>
      file.type.startsWith("image/")
    );

    const newImages = validFiles.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    setSelectedImages((current) => [
      ...current,
      ...newImages,
    ]);

    // Allows selecting the same file again after removing it.
    event.target.value = "";
  }

  function removeImage(indexToRemove: number) {
    setSelectedImages((current) => {
      const imageToRemove = current[indexToRemove];

      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.previewUrl);
      }

      return current.filter(
        (_, index) => index !== indexToRemove
      );
    });
  }

  function clearSelectedImages() {
    selectedImages.forEach((image) => {
      URL.revokeObjectURL(image.previewUrl);
    });

    setSelectedImages([]);
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const form = event.currentTarget;
    const formData = new FormData(form);

    const name = String(formData.get("name") || "").trim();
    const price = Number(formData.get("price"));
    const category = String(
      formData.get("category") || ""
    ).trim();
    const description = String(
      formData.get("description") || ""
    ).trim();

    const stockS = Number(formData.get("stock_s"));
    const stockM = Number(formData.get("stock_m"));
    const stockL = Number(formData.get("stock_l"));
    const stockXL = Number(formData.get("stock_xl"));

    if (
      !name ||
      !price ||
      !description ||
      selectedImages.length === 0
    ) {
      setMessage(
        "❌ Fill all required fields and add at least one product image."
      );
      setLoading(false);
      return;
    }

    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    try {
      const uploadedImageUrls: string[] = [];

      for (
        let index = 0;
        index < selectedImages.length;
        index++
      ) {
        const imageFile = selectedImages[index].file;

        const fileExtension =
          imageFile.name.split(".").pop()?.toLowerCase() ||
          "png";

        const uniqueName =
          typeof crypto !== "undefined" &&
          "randomUUID" in crypto
            ? crypto.randomUUID()
            : `${Date.now()}-${index}`;

        const storagePath = `${slug}/${uniqueName}.${fileExtension}`;

        const { error: uploadError } =
          await supabase.storage
            .from("products")
            .upload(storagePath, imageFile, {
              cacheControl: "3600",
              upsert: false,
            });

        if (uploadError) {
          throw new Error(
            `Image ${index + 1} failed: ${uploadError.message}`
          );
        }

        const { data: publicUrlData } =
          supabase.storage
            .from("products")
            .getPublicUrl(storagePath);

        uploadedImageUrls.push(
          publicUrlData.publicUrl
        );
      }

      const mainImage = uploadedImageUrls[0];

      const { error: productError } = await supabase
        .from("products")
        .insert({
          id: slug,
          name,
          price,
          category: category || null,
          description,
          image: mainImage,
        });

      if (productError) {
        throw new Error(
          "Product could not be saved: " +
            productError.message
        );
      }

      const productImageRows = uploadedImageUrls.map(
        (imageUrl, index) => ({
          product_id: slug,
          image_url: imageUrl,
          sort_order: index,
        })
      );

      const { error: imagesError } = await supabase
        .from("product_images")
        .insert(productImageRows);

      if (imagesError) {
        throw new Error(
          "Gallery images could not be saved: " +
            imagesError.message
        );
      }

      const { error: sizesError } = await supabase
        .from("product_sizes")
        .insert([
          {
            product_id: slug,
            size: "S",
            stock: stockS,
          },
          {
            product_id: slug,
            size: "M",
            stock: stockM,
          },
          {
            product_id: slug,
            size: "L",
            stock: stockL,
          },
          {
            product_id: slug,
            size: "XL",
            stock: stockXL,
          },
        ]);

      if (sizesError) {
        throw new Error(
          "Size stock could not be saved: " +
            sizesError.message
        );
      }

      setMessage(
        "✅ Product and all images saved successfully."
      );

      form.reset();
      clearSelectedImages();
    } catch (error) {
      setMessage(
        "❌ " +
          (error instanceof Error
            ? error.message
            : "An unexpected error occurred.")
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl p-6 py-12 md:p-10">
      <div className="mb-10">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-400">
          Inventory
        </p>

        <h1 className="mt-2 text-4xl font-bold">
          Add Product
        </h1>
      </div>

      {message && (
        <div className="mb-6 rounded-xl border bg-gray-50 p-4 font-medium">
          {message}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-7"
      >
        <input
          name="name"
          type="text"
          placeholder="Product Name"
          required
          className="w-full rounded-xl border p-4"
        />

        <input
          name="price"
          type="number"
          placeholder="Price"
          required
          min="1"
          className="w-full rounded-xl border p-4"
        />

        <input
          name="category"
          type="text"
          placeholder="Category, for example Oversized"
          className="w-full rounded-xl border p-4"
        />

        <textarea
          name="description"
          placeholder="Product Description"
          required
          rows={5}
          className="w-full rounded-xl border p-4"
        />

        <section>
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">
                Product Images
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                The first image will be the main product image.
              </p>
              {selectedImages.length > 0 && (
  <p className="mt-2 text-sm font-medium text-[#07152f]">
    {selectedImages.length} image
    {selectedImages.length > 1 ? "s" : ""} selected
  </p>
)}
            </div>

            <button
              type="button"
              onClick={() =>
                imageInputRef.current?.click()
              }
              className="inline-flex items-center gap-2 rounded-xl bg-[#07152f] px-4 py-3 text-sm font-semibold text-white transition hover:bg-black"
            >
              <Plus size={18} />
              Add photos
            </button>
          </div>

          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageSelection}
            className="hidden"
          />
          <div
  onDragOver={(e) => {
    e.preventDefault();
    setDragging(true);
  }}
  onDragLeave={() => setDragging(false)}
  onDrop={(e) => {
    e.preventDefault();
    setDragging(false);

    const files = Array.from(e.dataTransfer.files);

    const validFiles = files.filter((file) =>
      file.type.startsWith("image/")
    );

    const newImages = validFiles.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    setSelectedImages((current) => [
      ...current,
      ...newImages,
    ]);
  }}
  className={`mb-6 rounded-2xl border-2 border-dashed p-10 text-center transition ${
    dragging
      ? "border-[#07152f] bg-[#07152f]/5"
      : "border-gray-300"
  }`}
>
  <ImagePlus
    size={42}
    className="mx-auto mb-4 text-gray-400"
  />

  <h3 className="text-lg font-semibold">
    Drag & Drop Product Images
  </h3>

  <p className="mt-2 text-sm text-gray-500">
    or click below to browse
  </p>

  <button
    type="button"
    onClick={() => imageInputRef.current?.click()}
    className="mt-6 rounded-xl bg-[#07152f] px-6 py-3 text-white"
  >
    Browse Images
  </button>
</div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {selectedImages.map((image, index) => (
              <div
                key={`${image.file.name}-${index}`}
                className="group relative aspect-square overflow-hidden rounded-2xl border bg-gray-100"
              >
                <img
                  src={image.previewUrl}
                  alt={`Selected product image ${index + 1}`}
                  className="h-full w-full object-contain p-2"
                />

                {index === 0 && (
                  <span className="absolute bottom-2 left-2 rounded-full bg-[#07152f] px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">
                    Main
                  </span>
                )}

                <button
                  type="button"
                  aria-label={`Remove image ${index + 1}`}
                  onClick={() => removeImage(index)}
                  className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white text-black shadow transition hover:bg-red-600 hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>
            ))}

            {/* Plus card on the right */}
            <button
              type="button"
              onClick={() =>
                imageInputRef.current?.click()
              }
              className="flex aspect-square flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 text-gray-500 transition hover:border-[#07152f] hover:bg-[#07152f]/5 hover:text-[#07152f]"
            >
              {selectedImages.length === 0 ? (
                <ImagePlus size={30} />
              ) : (
                <Plus size={32} />
              )}

              <span className="mt-3 text-sm font-semibold">
                {selectedImages.length === 0
                  ? "Add product image"
                  : "Add more photos"}
              </span>
            </button>
          </div>
        </section>

        <section className="space-y-4 border-t pt-7">
          <h2 className="text-2xl font-bold">
            Size Stock
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <input
              name="stock_s"
              type="number"
              placeholder="S Stock"
              required
              min="0"
              className="w-full rounded-xl border p-4"
            />

            <input
              name="stock_m"
              type="number"
              placeholder="M Stock"
              required
              min="0"
              className="w-full rounded-xl border p-4"
            />

            <input
              name="stock_l"
              type="number"
              placeholder="L Stock"
              required
              min="0"
              className="w-full rounded-xl border p-4"
            />

            <input
              name="stock_xl"
              type="number"
              placeholder="XL Stock"
              required
              min="0"
              className="w-full rounded-xl border p-4"
            />
          </div>
        </section>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-[#07152f] px-8 py-4 font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading
            ? "Uploading images and saving..."
            : "Save Product"}
        </button>
      </form>
    </main>
  );
}