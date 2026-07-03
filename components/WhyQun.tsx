export default function WhyQun() {
  const features = [
    {
      title: "Premium Fabric",
      description: "Soft, durable French Terry for everyday comfort.",
    },
    {
      title: "Oversized Fit",
      description: "Relaxed silhouette designed for modern streetwear.",
    },
    {
      title: "Minimal Design",
      description: "Clean aesthetics that never go out of style.",
    },
    {
      title: "Made for Everyday",
      description: "Built to be worn from morning to night.",
    },
  ];

  return (
    <section className="bg-black text-white py-24">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-5xl font-black text-center mb-16">
          Why Choose QUN
        </h2>

        <div className="grid md:grid-cols-4 gap-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="border border-gray-800 rounded-2xl p-8 hover:border-white transition"
            >
              <h3 className="text-2xl font-bold mb-4">
                {feature.title}
              </h3>

              <p className="text-gray-400">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}