import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Order = {
  id: string;
  customer_name: string | null;
  total: number | string | null;
  order_status: string | null;
  payment_status: string | null;
  created_at: string;
};

type OrderItem = {
  product_id: string;
  product_name: string | null;
  quantity: number | null;
};

type ProductSize = {
  product_id: string;
  size: string;
  stock: number;
  products:
    | {
        name: string;
      }
    | {
        name: string;
      }[]
    | null;
};

export default async function AdminDashboard() {
  const now = new Date();

  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  ).toISOString();

  const startOfMonth = new Date(
    now.getFullYear(),
    now.getMonth(),
    1
  ).toISOString();

  const [
    productCountResult,
    orderCountResult,
    customerCountResult,
    allOrdersResult,
    recentOrdersResult,
    todayOrdersResult,
    monthlyOrdersResult,
    orderItemsResult,
    lowStockResult,
  ] = await Promise.all([
    supabase
      .from("products")
      .select("*", { count: "exact", head: true }),

    supabase
      .from("orders")
      .select("*", { count: "exact", head: true }),

    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true }),

    supabase
      .from("orders")
      .select("id, total, payment_status, order_status, created_at"),

    supabase
      .from("orders")
      .select(
        "id, customer_name, total, order_status, payment_status, created_at"
      )
      .order("created_at", { ascending: false })
      .limit(5),

    supabase
      .from("orders")
      .select("id, total, payment_status")
      .gte("created_at", startOfToday),

    supabase
      .from("orders")
      .select("id, total, payment_status")
      .gte("created_at", startOfMonth),

    supabase
      .from("order_items")
      .select("product_id, product_name, quantity"),

    supabase
      .from("product_sizes")
      .select(
        `
          product_id,
          size,
          stock,
          products (
            name
          )
        `
      )
      .lte("stock", 5)
      .order("stock", { ascending: true })
      .limit(10),
  ]);

  const productCount = productCountResult.count ?? 0;
  const orderCount = orderCountResult.count ?? 0;
  const customerCount = customerCountResult.count ?? 0;

  const allOrders = (allOrdersResult.data || []) as Order[];
  const recentOrders = (recentOrdersResult.data || []) as Order[];

  const completedOrders = allOrders.filter(
    (order) =>
      order.payment_status === "Paid" ||
      order.order_status === "Delivered"
  );

  const totalRevenue = completedOrders.reduce(
    (sum, order) => sum + Number(order.total || 0),
    0
  );

  const todayOrders = todayOrdersResult.data || [];

  const todayRevenue = todayOrders
    .filter(
      (order) =>
        order.payment_status === "Paid"
    )
    .reduce(
      (sum, order) => sum + Number(order.total || 0),
      0
    );

  const monthlyOrders = monthlyOrdersResult.data || [];

  const monthlyRevenue = monthlyOrders
    .filter(
      (order) =>
        order.payment_status === "Paid"
    )
    .reduce(
      (sum, order) => sum + Number(order.total || 0),
      0
    );

  const productSales = new Map<
    string,
    {
      productId: string;
      productName: string;
      quantity: number;
    }
  >();

  ((orderItemsResult.data || []) as OrderItem[]).forEach((item) => {
    const key = item.product_id;

    const existing = productSales.get(key);

    if (existing) {
      existing.quantity += Number(item.quantity || 0);
    } else {
      productSales.set(key, {
        productId: item.product_id,
        productName: item.product_name || "Unnamed Product",
        quantity: Number(item.quantity || 0),
      });
    }
  });

  const bestSellingProducts = Array.from(productSales.values())
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  const lowStockItems = (lowStockResult.data || []) as ProductSize[];

  return (
    <main className="space-y-10">
      <div>
        <h1 className="text-4xl font-bold">Dashboard</h1>

        <p className="mt-2 text-gray-500">
          Welcome to the QUN Admin Panel
        </p>
      </div>

      <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardCard
          title="Total Revenue"
          value={`₹${totalRevenue.toLocaleString("en-IN")}`}
        />

        <DashboardCard
          title="Total Orders"
          value={orderCount.toLocaleString("en-IN")}
        />

        <DashboardCard
          title="Products"
          value={productCount.toLocaleString("en-IN")}
        />

        <DashboardCard
          title="Customers"
          value={customerCount.toLocaleString("en-IN")}
        />
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        <DashboardCard
          title="Orders Today"
          value={todayOrders.length.toLocaleString("en-IN")}
          description={`₹${todayRevenue.toLocaleString(
            "en-IN"
          )} paid revenue today`}
        />

        <DashboardCard
          title="Revenue This Month"
          value={`₹${monthlyRevenue.toLocaleString("en-IN")}`}
          description={`${monthlyOrders.length} orders this month`}
        />

        <DashboardCard
          title="Low Stock Variants"
          value={lowStockItems.length.toLocaleString("en-IN")}
          description="Variants with 5 or fewer units"
        />
      </section>

      <section className="grid gap-8 xl:grid-cols-2">
        <div className="overflow-hidden rounded-xl bg-white shadow">
          <div className="flex items-center justify-between border-b p-6">
            <h2 className="text-2xl font-bold">
              Best-Selling Products
            </h2>

            <Link
              href="/admin/inventory"
              className="font-medium text-blue-600"
            >
              View Inventory
            </Link>
          </div>

          {bestSellingProducts.length === 0 ? (
            <p className="p-6 text-gray-500">
              No product sales data available yet.
            </p>
          ) : (
            <div className="divide-y">
              {bestSellingProducts.map((product, index) => (
                <div
                  key={product.productId}
                  className="flex items-center justify-between p-5"
                >
                  <div className="flex items-center gap-4">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 font-semibold">
                      {index + 1}
                    </span>

                    <div>
                      <p className="font-semibold">
                        {product.productName}
                      </p>

                      <p className="text-sm text-gray-500">
                        Product ID: {product.productId}
                      </p>
                    </div>
                  </div>

                  <p className="font-semibold">
                    {product.quantity} sold
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="overflow-hidden rounded-xl bg-white shadow">
          <div className="flex items-center justify-between border-b p-6">
            <h2 className="text-2xl font-bold">
              Low Stock Alerts
            </h2>

            <Link
              href="/admin/inventory"
              className="font-medium text-blue-600"
            >
              Manage Stock
            </Link>
          </div>

          {lowStockItems.length === 0 ? (
            <p className="p-6 text-gray-500">
              No low-stock products.
            </p>
          ) : (
            <div className="divide-y">
              {lowStockItems.map((item) => {
                const productData = Array.isArray(item.products)
                  ? item.products[0]
                  : item.products;

                return (
                  <div
                    key={`${item.product_id}-${item.size}`}
                    className="flex items-center justify-between p-5"
                  >
                    <div>
                      <p className="font-semibold">
                        {productData?.name || item.product_id}
                      </p>

                      <p className="text-sm text-gray-500">
                        Size: {item.size}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-sm font-semibold ${
                        item.stock === 0
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {item.stock === 0
                        ? "Out of stock"
                        : `${item.stock} left`}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <section className="overflow-hidden rounded-xl bg-white shadow">
        <div className="flex items-center justify-between border-b p-6">
          <h2 className="text-2xl font-bold">
            Recent Orders
          </h2>

          <Link
            href="/admin/orders"
            className="font-medium text-blue-600"
          >
            View All
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <p className="p-6 text-gray-500">
            No orders have been placed yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead className="bg-gray-50">
                <tr className="text-left">
                  <th className="p-4">Customer</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Total</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Payment</th>
                </tr>
              </thead>

              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-t">
                    <td className="p-4">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="font-medium hover:underline"
                      >
                        {order.customer_name || "Unknown Customer"}
                      </Link>
                    </td>

                    <td className="p-4 text-gray-500">
                      {new Date(
                        order.created_at
                      ).toLocaleDateString("en-IN")}
                    </td>

                    <td className="p-4 font-medium">
                      ₹
                      {Number(order.total || 0).toLocaleString(
                        "en-IN"
                      )}
                    </td>

                    <td className="p-4">
                      {order.order_status || "Pending"}
                    </td>

                    <td className="p-4">
                      {order.payment_status || "Pending"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

function DashboardCard({
  title,
  value,
  description,
}: {
  title: string;
  value: string;
  description?: string;
}) {
  return (
    <div className="rounded-xl bg-white p-6 shadow">
      <p className="text-gray-500">{title}</p>

      <h2 className="mt-2 text-3xl font-bold">
        {value}
      </h2>

      {description && (
        <p className="mt-2 text-sm text-gray-500">
          {description}
        </p>
      )}
    </div>
  );
}