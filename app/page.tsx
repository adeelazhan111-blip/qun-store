import Hero from "@/components/Hero";
import Featured from "@/components/Featured";
import WhyQun from "@/components/WhyQun";
import Footer from "@/components/Footer";
import TrustStrip from "@/components/TrustStrip";
import { supabase } from "@/lib/supabase";

export default async function Home() {
  const { data: products, error } = await supabase
    .from("products")
    .select("id, name, price, image, category, created_at")
    .order("created_at", { ascending: false })
    .limit(3);

  return (
    <main className="min-h-screen bg-white text-black">
      <div className="overflow-hidden">
        <Hero />
        <TrustStrip />

        <Featured
          products={error ? [] : products || []}
        />

        <WhyQun />
      </div>

      <Footer />
    </main>
  );
}