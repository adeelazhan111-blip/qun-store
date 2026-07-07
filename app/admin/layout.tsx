import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-black text-white p-6">
        <h1 className="text-3xl font-bold mb-10 tracking-widest">
          QUN
        </h1>

        <nav className="space-y-3">
          <Link
            href="/admin"
            className="block rounded-lg px-4 py-3 hover:bg-gray-800"
          >
            📊 Dashboard
          </Link>

          <Link
            href="/admin/inventory"
            className="block rounded-lg px-4 py-3 hover:bg-gray-800"
          >
            📦 Inventory
          </Link>

          <Link
            href="/admin/add"
            className="block rounded-lg px-4 py-3 hover:bg-gray-800"
          >
            ➕ Add Product
          </Link>

          <Link
            href="/admin/orders"
            className="block rounded-lg px-4 py-3 hover:bg-gray-800"
          >
            📋 Orders
          </Link>

          <div className="mt-8 border-t border-gray-700 pt-6">
            <p className="text-xs uppercase tracking-wide text-gray-400 mb-3">
              Coming Soon
            </p>

            <div className="space-y-2 text-gray-400">
              <div className="px-4 py-2">👥 Customers</div>
              <div className="px-4 py-2">📈 Analytics</div>
              <div className="px-4 py-2">⚙️ Settings</div>
            </div>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto">
        {children}
      </main>
    </div>
  );
}