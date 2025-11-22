import React from 'react';
import { Link } from 'react-router-dom';

function Hero() {
  return (
    <section className="py-20 relative overflow-hidden bg-gradient-to-b from-black via-black to-gray-950 border-t border-white/10 text-white">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
          {/* LEFT CONTENT */}
          <div className="md:col-span-7">
            <span className="inline-block px-4 py-1.5 rounded-full bg-purple-500/20 text-purple-300 text-xs tracking-wide font-medium mb-5 shadow-sm">
              Next-Gen AI Code Intelligence
            </span>

            <h1 className="font-jetmono text-4xl md:text-6xl leading-tight font-bold text-white drop-shadow-sm">
              Supercharge Your PRs with
              <span className="block mt-2 text-white/80 font-semibold text-3xl md:text-5xl">
                AI-Driven Code Reviews
              </span>
            </h1>

            <p className="mt-6 text-white/60 max-w-xl leading-relaxed text-base md:text-lg">
              PullShark delivers context-aware, self-learning AI code reviews that evolve with every commit. Seamlessly integrated with GitHub, MCP, and developer workflows.
            </p>

            <div className="mt-8 flex gap-4">
              <Link to="/login">
                <button className="px-6 py-2.5 rounded-md bg-gradient-to-r from-[#00fff0] to-[#8b2fff] text-black text-sm md:text-base font-semibold shadow-[0_10px_40px_rgba(139,47,255,0.18)] hover:scale-[1.03] transition-transform">
                  Try PullShark
                </button>
              </Link>

              <button className="px-6 py-2.5 rounded-md border border-white/10 text-white/80 hover:bg-white/10 transition text-sm md:text-base backdrop-blur-sm">
                Learn More
              </button>
            </div>

            <div className="mt-8 flex items-center gap-3 text-xs text-white/50">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
                ⚡ Faster • 🤖 Smarter • 🔒 Secure
              </span>
            </div>
          </div>

          {/* RIGHT ILLUSTRATION */}
          <div className="md:col-span-5 relative">
            <div className="relative w-full h-72 md:h-80 lg:h-96 rounded-2xl bg-gradient-to-br from-black/40 to-white/5 border border-white/10 backdrop-blur-xl shadow-[0_0_60px_rgba(0,0,0,0.4)] overflow-hidden">
              {/* Animated floating gradient blob */}
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-56 h-56 md:w-64 md:h-64 animate-float opacity-90" viewBox="0 0 200 200">
                  <defs>
                    <linearGradient id="bubbleGradient" x1="0" x2="1">
                      <stop offset="0%" stopColor="#00fff0" stopOpacity="0.95" />
                      <stop offset="100%" stopColor="#ff3af7" stopOpacity="0.9" />
                    </linearGradient>
                  </defs>
                  <path d="M20 140 C60 30, 140 30, 180 140 Q100 110, 20 140Z" fill="url(#bubbleGradient)" opacity="0.18" />
                  <path d="M40 130 C70 60, 130 60, 160 130 Q100 110, 40 130Z" fill="url(#bubbleGradient)" opacity="0.35" />
                </svg>
              </div>

              {/* Highlight line */}
              <div className="absolute left-6 top-6 w-[55%] h-4 bg-gradient-to-r from-[#00fff0]/40 to-transparent rounded-full blur-md" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;