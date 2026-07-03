export default function Navbar() {
  return (
    <header className="fixed top-0 left-0 w-full bg-white/90 backdrop-blur-md border-b border-gray-200 z-50">
      <nav className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        <h1 className="text-2xl font-extrabold tracking-[0.4em]">
          QUN
        </h1>

        <div className="hidden md:flex gap-8 font-medium">
          <a href="#">Home</a>
          <a href="#">Shop</a>
          <a href="#">Collections</a>
          <a href="#">About</a>
          <a href="#">Contact</a>
        </div>

        <button className="border border-black px-5 py-2 rounded-full hover:bg-black hover:text-white transition">
          Shop Now
        </button>
      </nav>
    </header>
  );
}