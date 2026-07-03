export default function Hero() {
  return (
    <section className="relative h-screen flex items-center justify-center bg-black text-white overflow-hidden">

      {/* Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-black to-gray-900" />

      {/* Content */}
      <div className="relative z-10 text-center px-6">

        <h1 className="text-6xl md:text-8xl font-black tracking-widest mb-6">
          Q U N
        </h1>

        <p className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto mb-10">
          Premium oversized clothing designed for confidence, comfort, and everyday style.
        </p>

        <div className="flex gap-4 justify-center">
          <button className="bg-white text-black px-8 py-3 rounded-full font-semibold hover:scale-105 transition">
            Shop Now
          </button>

          <button className="border border-white px-8 py-3 rounded-full hover:bg-white hover:text-black transition">
            Explore
          </button>
        </div>

      </div>
    </section>
  );
}