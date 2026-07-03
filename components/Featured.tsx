import Image from "next/image";

export default function Featured() {
  const products = [
    {
      name: "Oversized Cream Tee",
      price: "₹799",
      image: "/images/oversized-cream.png",
    },
    {
      name: "Polo Black Tee",
      price: "₹899",
      image: "/images/polo-black.png",
    },
    {
      name: "Polo White Tee",
      price: "₹899",
      image: "/images/polo-white.png",
    },
  ];

  return (
    <section className="py-24 px-6 bg-white">
      <h2 className="text-5xl font-black text-center mb-16">
        Featured Collection
      </h2>

      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-10">
        {products.map((item) => (
          <div
            key={item.name}
            className="group cursor-pointer"
          >
            {/* Image Box */}
            <div className="overflow-hidden rounded-2xl bg-gray-100">
              <Image
                src={item.image}
                alt={item.name}
                width={500}
                height={500}
                className="w-full h-[420px] object-cover group-hover:scale-110 transition duration-500"
              />
            </div>

            {/* Info */}
            <div className="mt-4 flex justify-between items-center">
              <h3 className="font-semibold text-lg">{item.name}</h3>
              <p className="font-bold">{item.price}</p>
            </div>

           <a
  href={`/product/${item.image.split("/").pop()?.replace(".png", "")}`}
  className="mt-4 block text-center w-full py-2 border border-black rounded-full hover:bg-black hover:text-white transition"
>
  View Product
</a>
          </div>
        ))}
      </div>
    </section>
  );
}