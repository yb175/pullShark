import React from "react";

function ProductFeatures() {
  const features = [
    {
      title: "Adaptive Edge-Case Engine",
      desc: "AI that learns your system’s behavior and automatically identifies unusual conditions, rare flows, and hidden failure patterns.",
    },
    {
      title: "Real-Time Failure Prediction",
      desc: "Detect instability before it becomes a bug — with continuous monitoring of states, constraints, and behavioral anomalies.",
    },
    {
      title: "Environment-Aware Analysis",
      desc: "Understand how your product behaves across networks, devices, and scenarios through deep multi-condition modeling.",
    },
    {
      title: "High-Signal Insights, Zero Noise",
      desc: "Only actionable, meaningful alerts. No clutter, no false positives — just precise detection of reliability risks.",
    },
    {
      title: "AI-Driven Test Intelligence",
      desc: "Generate smart test cases that target edge conditions, system boundaries, and potential failure triggers automatically.",
    },
    {
      title: "Full-Stack Stability Mapping",
      desc: "Visualize risk zones, dependency impacts, and weak points across your system to proactively strengthen reliability.",
    },
  ]

  return (
    <section className="py-28 bg-gradient-to-b from-gray-950 to-black">

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <h2 className="text-4xl md:text-5xl font-bold text-center text-white tracking-tight mb-6">
          AI-Powered Edge Case & Reliability Platform
        </h2>
        <p className="text-center text-white/60 max-w-2xl mx-auto mb-16 text-lg">
          Built for engineering teams who demand stability, predictable performance, and failure-proof releases, without hidden risks slipping into production.
        </p>

        <div className="grid md:grid-cols-2 gap-10">
          {features.map((f, idx) => (
            <div
              key={idx}
              className="bg-white/5 backdrop-blur-sm p-8 rounded-2xl border border-white/10 hover:bg-white/[0.07] transition group shadow-xl shadow-black/20 hover:shadow-purple-500/10"
            >
              <h3 className="text-2xl font-semibold text-white mb-3 group-hover:text-purple-300 transition">
                {f.title}
              </h3>
              <p className="text-white/60 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ProductFeatures;
