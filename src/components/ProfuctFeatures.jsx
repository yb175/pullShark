import React from 'react'

function ProfuctFeatures() {
    const features = [
  {
    title: "AI Code Reviews — Your reviews. Your way.",
    desc: "Code reviews that auto-learn from feedback and integrate with MCP and GitHub for full-context awareness.",
  },
  {
    title: "Catch fast. Fix fast.",
    desc: "Full codebase-aware reviews and one-click fixes following your coding guidelines and agent integrations.",
  },
  {
    title: "Simple PR summaries.",
    desc: "View changed files, one-line summaries, and visual flow diagrams for faster understanding.",
  },
  {
    title: "Review guide for human reviewers.",
    desc: "Visualize code flow, validate linked issues, and find related PRs with auto-label suggestions.",
  },
  {
    title: "Ship faster with agentic Chat.",
    desc: "Generate code, tests, and automate reviews through conversational AI workflows that evolve with you.",
  },
  {
    title: "More signal. Less noise.",
    desc: "AI-enhanced analysis combined with linters and static tools to deliver deeper, cleaner insights.",
  },
];
  return (
 <section className="py-24 bg-gradient-to-b from-gray-950 to-black border-t border-white/10">
    <div className="max-w-6xl mx-auto px-6">
      <h2 className="text-3xl font-bold text-center text-white mb-12">
        Powerful AI-Powered Code Reviews
      </h2>
      <div className="grid md:grid-cols-2 gap-10">
        {features.map((f, idx) => (
          <div key={idx} className="bg-white/5 p-6 rounded-xl border border-white/10 hover:bg-white/[0.07] transition">
            <h3 className="text-xl font-semibold text-white mb-2">{f.title}</h3>
            <p className="text-white/60 text-sm">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
  )
}

export default ProfuctFeatures