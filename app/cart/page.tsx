export default function CartPage() {
  return (
    <div className="max-w-5xl mx-auto py-20 px-6">
      <h1 className="text-4xl font-bold mb-10">Shopping Cart</h1>

      <div className="border rounded-xl p-6">
        <p className="text-gray-500">
          Your cart is empty.
        </p>

        <button className="mt-6 bg-black text-white px-6 py-3 rounded-full">
          Continue Shopping
        </button>
      </div>
    </div>
  );
}