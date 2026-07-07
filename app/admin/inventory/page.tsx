import DeleteProductButton from "@/components/DeleteProductButton";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default async function InventoryPage() {
  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("id, name, price, image")
    .order("name", { ascending: true });

  const { data: sizes, error: sizesError } = await supabase
    .from("product_sizes")
    .select("product_id, size, stock");

  if (productsError || sizesError) {
    return (
      <main className="p-10">
        <p className="text-red-600">
          Error loading inventory: {productsError?.message || sizesError?.message}
        </p>
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto p-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold">Inventory</h1>

        <Link href="/admin/add" className="bg-black text-white px-5 py-3 rounded-lg">
          Add Product
        </Link>
      </div>

      <div className="overflow-x-auto border rounded-xl">
        <table className="w-full text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-4">Product</th>
              <th className="p-4">Price</th>
              <th className="p-4">S</th>
              <th className="p-4">M</th>
              <th className="p-4">L</th>
              <th className="p-4">XL</th>
              <th className="p-4">Total Stock</th>
              <th className="p-4">Status</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>

          <tbody>
            {products?.map((product) => {
              const productSizes =
                sizes?.filter((item) => item.product_id === product.id) || [];

              const getStock = (size: string) =>
                productSizes.find((item) => item.size === size)?.stock || 0;

              const stockS = getStock("S");
              const stockM = getStock("M");
              const stockL = getStock("L");
              const stockXL = getStock("XL");

              const totalStock = stockS + stockM + stockL + stockXL;

              return (
                <tr key={product.id} className="border-t">
                  <td className="p-4 font-medium">{product.name}</td>
                  <td className="p-4">₹{product.price}</td>
                  <td className="p-4">{stockS}</td>
                  <td className="p-4">{stockM}</td>
                  <td className="p-4">{stockL}</td>
                  <td className="p-4">{stockXL}</td>
                  <td className="p-4 font-semibold">{totalStock}</td>
                  <td className="p-4">
                    {totalStock <= 5 ? (
                      <span className="text-red-600 font-semibold">Low Stock</span>
                    ) : (
                      <span className="text-green-600 font-semibold">In Stock</span>
                    )}
                  </td>
                  <td className="p-4 flex gap-3">
                    <Link href={`/admin/edit/${product.id}`} className="text-blue-600 font-medium">
                      Edit
                    </Link>

                    <DeleteProductButton productId={product.id} imageUrl={product.image} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </main>
  );
}