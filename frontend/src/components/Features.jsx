import React from "react";

function Features() {
  const features = [
    {
      title: "Catch fast. Fix fast.",
      desc: "Full codebase-aware reviews and one-click fixes that follow your coding guidelines.",
    },
    {
      title: "Simple PR summaries.",
      desc: "View changed files and one-line descriptions for easy review.",
    },
  ];

  return (
    <section className="text-center py-22 bg-gradient-to-b from-black via-black to-gray-950 border-t border-white/10">
      {/* Header Text */}
      <h1 className="text-4xl md:text-6xl font-jetmono font-bold text-white mb-6 leading-tight">
        Cut Review Time. Catch More Bugs.
      </h1>

      <p className="text-white/70 max-w-2xl mx-auto mb-12 text-lg">
        Turbocharged reviews for engineering teams who move fast — but ship with confidence.
      </p>

      {/* CTA Buttons */}
      <div className="flex flex-wrap justify-center gap-4 mb-10">
        <button className="px-8 py-3 bg-gradient-to-r from-[#00fff0] to-[#8b2fff] rounded-xl text-black font-semibold shadow-[0_0_15px_rgba(0,255,240,0.3)] hover:scale-105 transition-all">
          Start Free Trial
        </button>

        <button className="px-8 py-3 border border-white/20 rounded-xl text-white/80 hover:bg-white/10 hover:border-white/40 transition-all">
          Learn More
        </button>
      </div>

      {/* Trust Text */}
      <p className="text-xs text-white/50 mb-1">14-day free trial • No credit card needed</p>
      <p className="text-xs text-white/50">2-click signup with GitHub/GitLab</p>

      {/* Features Section */}
      <div className="mt-20 grid md:grid-cols-2 gap-10 max-w-4xl mx-auto text-left">
        {features.map((f, i) => (
          <div
            key={i}
            className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all shadow-lg"
          >
            <h3 className="text-xl font-semibold text-white mb-2">{f.title}</h3>
            <p className="text-white/70 text-sm leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Features;