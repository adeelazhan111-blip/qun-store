"use client";

import { createClient } from "@/lib/supabase/client";

type Props = {
  id: string;
};

export default function DeleteProductButton({ id }: Props) {
  const supabase = createClient();

  async function handleDelete() {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Product deleted successfully!");
    window.location.reload();
  }

  return (
    <button
      onClick={handleDelete}
      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
    >
      Delete
    </button>
  );
}