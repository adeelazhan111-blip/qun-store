import {
  BadgeCheck,
  ShieldCheck,
  Truck,
  Headphones,
} from "lucide-react";

const items = [
  {
    title: "Premium French Terry",
    icon: BadgeCheck,
  },
  {
    title: "Secure Payments",
    icon: ShieldCheck,
  },
  {
    title: "India-wide Shipping",
    icon: Truck,
  },
  {
    title: "Easy Support",
    icon: Headphones,
  },
];

export default function TrustStrip() {
  return (
    <section className="border-y border-gray-200 bg-white">
      <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-y divide-gray-200 px-4 sm:grid-cols-4 sm:divide-y-0 md:px-6">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="flex min-h-28 flex-col items-center justify-center gap-3 px-4 py-6 text-center"
            >
              <Icon
                size={24}
                strokeWidth={1.7}
                className="text-[#07152f]"
              />

              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#07152f]">
                {item.title}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}