export default function AddProductPage() {
  return (
    <main className="max-w-2xl mx-auto p-10">
      <h1 className="text-4xl font-bold mb-8">
        Add Product
      </h1>

      <form className="space-y-6">
        <input
          type="text"
          placeholder="Product ID"
          className="w-full border p-3 rounded-lg"
        />

        <input
          type="text"
          placeholder="Product Name"
          className="w-full border p-3 rounded-lg"
        />

        <input
          type="number"
          placeholder="Price"
          className="w-full border p-3 rounded-lg"
        />

        <textarea
          placeholder="Description"
          className="w-full border p-3 rounded-lg"
          rows={4}
        />

        <input
          type="text"
          placeholder="Image URL"
          className="w-full border p-3 rounded-lg"
        />

        <input
          type="text"
          placeholder="Category"
          className="w-full border p-3 rounded-lg"
        />

        <input
          type="number"
          placeholder="Stock"
          className="w-full border p-3 rounded-lg"
        />

        <button
          type="submit"
          className="bg-black text-white px-8 py-3 rounded-lg"
        >
          Save Product
        </button>
      </form>
    </main>
  );
}