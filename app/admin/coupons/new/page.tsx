import CouponForm from "@/components/CouponForm";

export default function NewCouponPage() {
  return (
    <main className="max-w-2xl mx-auto p-6 md:p-10">
      <h1 className="text-3xl font-bold mb-8">Create Coupon</h1>
      <CouponForm />
    </main>
  );
}