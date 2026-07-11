import {
  BadgeCheck,
  PackageCheck,
  RefreshCcw,
  ShieldCheck,
} from "lucide-react";

const features = [
  {
    title: "Premium French Terry",
    description:
      "Soft, breathable fabric with a structured feel built for daily comfort.",
    icon: BadgeCheck,
  },
  {
    title: "Fast Delivery",
    description:
      "Reliable shipping across India with order updates from dispatch to delivery.",
    icon: PackageCheck,
  },
  {
    title: "Easy Support",
    description:
      "Simple assistance for sizing, order questions, and eligible returns.",
    icon: RefreshCcw,
  },
  {
    title: "Secure Checkout",
    description:
      "Shop confidently with protected payments through COD and Razorpay.",
    icon: ShieldCheck,
  },
];

export default function WhyQun() {
  return (
    <section className="bg-[#07152f] px-6 py-20 text-white md:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto mb-14 max-w-3xl text-center md:mb-16">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.35em] text-white/60">
            The QUN Standard
          </p>

          <h2 className="text-4xl font-semibold tracking-tight md:text-6xl">
            Designed with purpose.
            <br />
            Made for everyday wear.
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-white/65 md:text-lg">
            From premium fabric and comfortable fits to secure checkout and
            reliable delivery, every detail is built around a better shopping
            experience.
          </p>
        </div>

        <div className="grid gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <article
                key={feature.title}
                className="group bg-[#07152f] p-8 transition duration-300 hover:bg-white/[0.06] md:p-9"
              >
                <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-white/[0.04] transition group-hover:border-white/40 group-hover:bg-white/10">
                  <Icon size={22} strokeWidth={1.7} />
                </div>

                <h3 className="text-xl font-semibold">
                  {feature.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-white/60">
                  {feature.description}
                </p>
              </article>
            );
          })}
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs font-medium uppercase tracking-[0.22em] text-white/45">
          <span>Premium Materials</span>
          <span className="hidden h-1 w-1 rounded-full bg-white/30 sm:block" />
          <span>India-Wide Shipping</span>
          <span className="hidden h-1 w-1 rounded-full bg-white/30 sm:block" />
          <span>Secure Payments</span>
          <span className="hidden h-1 w-1 rounded-full bg-white/30 sm:block" />
          <span>Customer Support</span>
        </div>
      </div>
    </section>
  );
}