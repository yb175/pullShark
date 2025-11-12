import React from 'react'

function HowItWork() {
  return (
    <section className="py-50 bg-gradient-to-b from-black via-black to-gray-950 border-t border-white/10">
    <div className="max-w-6xl mx-auto px-6">
      <h2 className="text-3xl font-bold text-center mb-10">
        How PullShark Works
      </h2>

      <div className="grid md:grid-cols-2 gap-12 text-white/80">
        <div>
          <h3 className="text-2xl text-white mb-4">SaaS</h3>
          <ul className="space-y-3 text-sm">
            <li>→ Install PullShark App on GitHub or GitLab.</li>
            <li>→ Optionally configure review tools & trackers like Jira/Linear.</li>
            <li>→ Raise your next PR — PullShark posts reviews instantly.</li>
            <li>→ Benefit from instant updates and managed infrastructure.</li>
          </ul>
        </div>

        <div>
          <h3 className="text-2xl text-white mb-4">Self-hosted</h3>
          <ul className="space-y-3 text-sm">
            <li>→ Deploy on your own infrastructure.</li>
            <li>→ Maintain private data pipelines and internal compliance.</li>
            <li>→ Integrate with enterprise security and SSO systems.</li>
          </ul>
        </div>
      </div>
    </div>
  </section>
  )
}

export default HowItWork