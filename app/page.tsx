import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Featured from "@/components/Featured";
import WhyQun from "@/components/WhyQun";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <Featured />
      <WhyQun />
      <Footer />
    </>
  );
}