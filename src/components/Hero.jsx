import React from 'react'

function Hero() {
  return (
  <section className="py-10 relative overflow-hidden bg-gradient-to-b from-black via-black to-gray-950 border-t border-white/10 text-white">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-20 md:py-28">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-7">
            <span className="inline-block px-3 py-1 rounded-full bg-pink-500/20 text-pink-300 text-xs font-medium mb-4">
              Futuristic AI Co-pilot
            </span>

            <h1 className="font-jetmono text-4xl md:text-5xl leading-tight text-white">
              AI Code Reviews —{" "}
              <span className="block text-3xl md:text-4xl mt-1 text-white/80 font-semibold">
                Your reviews. Your way.
              </span>
            </h1>

            <p className="mt-6 text-white/60 max-w-xl">
              Code reviews that auto-learn from user feedback and integrate
              natively with GitHub, MCP, and other tools.
            </p>

            <div className="mt-8 flex gap-4">
              <button className="px-5 py-2 rounded-md bg-gradient-to-r from-[#00fff0] to-[#8b2fff] text-black font-semibold shadow-[0_8px_30px_rgba(139,47,255,0.12)]">
                Try PullShark
              </button>
              <button className="px-5 py-2 rounded-md border border-white/8 text-white/80">
                Learn More
              </button>
            </div>

            <div className="mt-8 flex items-center gap-3 text-xs text-white/50">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/3">
                Fast • Automated • High-Quality
              </span>
            </div>
          </div>

          <div className="md:col-span-5">
            <div className="relative w-full h-64 md:h-72 lg:h-80 rounded-2xl bg-gradient-to-br from-black/40 to-white/3 border border-white/6 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-48 h-48 animate-float opacity-90" viewBox="0 0 200 200">
                  <defs>
                    <linearGradient id="g1" x1="0" x2="1">
                      <stop offset="0%" stopColor="#00fff0" stopOpacity="0.95" />
                      <stop offset="100%" stopColor="#ff3af7" stopOpacity="0.9" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M20 140 C60 30, 140 30, 180 140 Q100 110, 20 140Z"
                    fill="url(#g1)"
                    opacity="0.18"
                  />
                  <path
                    d="M40 130 C70 60, 130 60, 160 130 Q100 110, 40 130Z"
                    fill="url(#g1)"
                    opacity="0.35"
                  />
                </svg>
              </div>
              <div className="absolute left-4 top-6 w-[58%] h-4 bg-gradient-to-r from-[#00fff0]/40 to-transparent rounded-full blur-sm" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero