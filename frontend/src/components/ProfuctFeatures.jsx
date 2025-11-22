import React from "react";

function ProductFeatures() {
  const features = [
    {
      title: "Adaptive AI Review Engine",
      desc: "A self-learning review system that evolves with every PR, adapting to your coding patterns, tech stack, and architectural decisions.",
    },
    {
      title: "Instant Issue Detection & Smart Fixes",
      desc: "Spot bugs, performance leaks, and architectural flaws in real time — paired with one-click intelligent fixes.",
    },
    {
      title: "Crystal-Clear PR Intelligence",
      desc: "Auto-generated visual diffs, impact summaries, dependency trails, and change heatmaps for rapid comprehension.",
    },
    {
      title: "Developer-First Review Insights",
      desc: "Gain contextual insights, highlight risk areas, map related modules, and receive smart improvement suggestions.",
    },
    {
      title: "Agentic AI Dev Companion",
      desc: "Chat with your codebase. Generate tests, refactor code, draft PR descriptions, and automate routine tasks effortlessly.",
    },
    {
      title: "High-Signal Analysis. Zero Noise.",
      desc: "A refined blend of static analysis, LLM reasoning, and custom rules that provide accurate, actionable insights only.",
    },
  ];

  return (
    <section className="py-28 bg-gradient-to-b from-gray-950 to-black">
      {/* Glow Effects */}
      

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <h2 className="text-4xl md:text-5xl font-bold text-center text-white tracking-tight mb-6">
          Next‑Gen AI Code Review Platform
        </h2>
        <p className="text-center text-white/60 max-w-2xl mx-auto mb-16 text-lg">
          Built for modern engineering teams — faster reviews, fewer bugs, and stronger ship confidence.
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
