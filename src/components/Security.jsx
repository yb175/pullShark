import React from 'react'

function Security() {
  return (
 <section className="py-50 bg-gradient-to-b from-gray-950 to-black border-t border-white/10">
    <div className="max-w-5xl mx-auto px-6 text-center">
      <h2 className="text-3xl font-bold text-white mb-8">
        Your Data Stays Confidential
      </h2>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="p-6 bg-white/5 rounded-xl border border-white/10">
          <h3 className="text-lg text-white mb-2">Ephemeral Reviews</h3>
          <p className="text-white/60 text-sm">
            No trace left behind — temporary review environments ensure privacy.
          </p>
        </div>

        <div className="p-6 bg-white/5 rounded-xl border border-white/10">
          <h3 className="text-lg text-white mb-2">End-to-End Encryption</h3>
          <p className="text-white/60 text-sm">
            All data is SSL encrypted and automatically purged post-review.
          </p>
        </div>

        <div className="p-6 bg-white/5 rounded-xl border border-white/10">
          <h3 className="text-lg text-white mb-2">SOC2 Type II Certified</h3>
          <p className="text-white/60 text-sm">
            Independently verified enterprise-grade compliance.
          </p>
        </div>
      </div>

      <div className="mt-8">
        <button className="px-6 py-2 border border-white/10 rounded-md text-white/70 hover:bg-white/10 transition">
          Go to Trust Center
        </button>
      </div>
    </div>
  </section>
  )
}

export default Security