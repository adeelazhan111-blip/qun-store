import Link from "next/link";
import {
  Check,
  Mail,
  PackageCheck,
  ShoppingBag,
  Truck,
} from "lucide-react";

export default async function OrderSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{
    orderId?: string;
    payment?: string;
  }>;
}) {
  const params = await searchParams;

  const orderId = params.orderId || "";
  const isPaid = params.payment === "paid";

  return (
    <main className="min-h-screen bg-[#f5f6f8] px-5 pb-20 pt-32 md:px-6">
      <section className="mx-auto max-w-3xl overflow-hidden rounded-[2rem] border border-gray-200 bg-white shadow-xl">
        <div className="bg-[#07152f] px-6 py-12 text-center text-white md:px-12">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white text-[#07152f] shadow-lg">
            <Check size={38} strokeWidth={2.2} />
          </div>

          <p className="mt-7 text-xs font-semibold uppercase tracking-[0.32em] text-white/55">
            Thank you for shopping with QUN
          </p>

          <h1 className="mt-3 text-4xl font-semibold md:text-6xl">
            Your order is confirmed
          </h1>

          <p className="mx-auto mt-5 max-w-xl leading-7 text-white/70">
            We have received your order and will begin preparing it shortly.
            A confirmation email has been sent to you.
          </p>
        </div>

        <div className="px-6 py-10 md:px-12 md:py-12">
          <div className="grid gap-4 sm:grid-cols-2">
            <InfoCard
              icon={PackageCheck}
              label="Order status"
              value="Confirmed"
            />

            <InfoCard
              icon={ShoppingBag}
              label="Payment"
              value={isPaid ? "Payment confirmed" : "Cash on delivery"}
            />
          </div>

          {orderId && (
            <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
                Order number
              </p>

              <p className="mt-2 break-all font-semibold text-[#07152f]">
                {orderId}
              </p>
            </div>
          )}

          <div className="mt-10 space-y-6 border-y border-gray-200 py-8">
            <TimelineItem
              icon={Mail}
              title="Confirmation sent"
              description="Your order confirmation has been sent by email."
            />

            <TimelineItem
              icon={PackageCheck}
              title="Preparing your order"
              description="Our team will check, pack, and prepare your items."
            />

            <TimelineItem
              icon={Truck}
              title="Shipping update"
              description="You will receive another email when your order is shipped."
            />
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-2">
            <Link
              href="/account"
              className="flex items-center justify-center rounded-xl border-2 border-[#07152f] px-6 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-[#07152f] transition hover:bg-[#07152f] hover:text-white"
            >
              View my orders
            </Link>

            <Link
              href="/products"
              className="flex items-center justify-center rounded-xl bg-[#07152f] px-6 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-black"
            >
              Continue shopping
            </Link>
          </div>

          <p className="mt-8 text-center text-sm leading-6 text-gray-500">
            Need help with your order? Contact QUN customer support and keep
            your order number ready.
          </p>
        </div>
      </section>
    </main>
  );
}

function InfoCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{
    size?: number;
    strokeWidth?: number;
  }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#07152f]/5 text-[#07152f]">
          <Icon size={19} strokeWidth={1.8} />
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-gray-400">
            {label}
          </p>

          <p className="mt-1 font-semibold">{value}</p>
        </div>
      </div>
    </div>
  );
}

function TimelineItem({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{
    size?: number;
    strokeWidth?: number;
  }>;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-[#07152f]">
        <Icon size={18} strokeWidth={1.8} />
      </div>

      <div>
        <p className="font-semibold">{title}</p>
        <p className="mt-1 text-sm leading-6 text-gray-500">
          {description}
        </p>
      </div>
    </div>
  );
}