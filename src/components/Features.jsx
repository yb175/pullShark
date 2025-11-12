import React from 'react'

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
<section className="text-center py-50 bg-gradient-to-b from-black via-black to-gray-950 border-t border-white/10">
    <h1 className="text-4xl md:text-5xl font-jetmono font-bold text-white mb-4">
      Cut Code Review Time & Bugs in Half. Instantly.
    </h1>
    <p className="text-white/70 max-w-2xl mx-auto mb-8">
      Reviews for AI-powered teams who move fast (but don’t break things).
    </p>

    <div className="flex flex-wrap justify-center gap-4 mb-10">
      <button className="px-6 py-2 bg-gradient-to-r from-[#00fff0] to-[#8b2fff] rounded-md text-black font-semibold shadow-lg hover:scale-[1.01] transition">
        Get a free trial
      </button>
      <button className="px-6 py-2 border border-white/10 rounded-md text-white/80 hover:bg-white/10 transition">
        Learn More
      </button>
    </div>

    <p className="text-xs text-white/50 mb-2">14-day free trial • No credit card needed</p>
    <p className="text-xs text-white/50">2-click signup with GitHub/GitLab</p>
  </section>
  );
}

export default Features