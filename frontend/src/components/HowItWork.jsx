import React from 'react';

function HowItWork() {
  const items = [
    {
      title: "SaaS Mode",
      points: [
        "Install PullShark with one click on GitHub or GitLab.",
        "Configure integrations like Jira, Linear, or Slack (optional).",
        "Create or update a PR — AI reviews appear instantly.",
        "Enjoy automatic scaling, updates, and zero maintenance.",
      ],
    },
    {
      title: "Self-Hosted Mode",
      points: [
        "Deploy PullShark on your servers or private cloud.",
        "Keep full control over data pipelines and compliance.",
        "Integrate enterprise-grade IAM, SSO, and internal tooling.",
      ],
    },
  ];

  return (
    <section className="py-21 bg-gradient-to-b from-black via-black to-gray-950 border-t border-white/10 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <h2 className="text-4xl md:text-5xl font-bold text-center text-white tracking-tight mb-14">
          How PullShark Works
        </h2>

        <div className="grid md:grid-cols-2 gap-12 text-white/80">
          {items.map((block, i) => (
            <div
              key={i}
              className="p-8 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm hover:bg-white/[0.06] transition shadow-xl shadow-black/20 hover:shadow-purple-500/10"
            >
              <h3 className="text-2xl font-semibold text-white mb-5">
                {block.title}
              </h3>
              <ul className="space-y-3 text-sm leading-relaxed">
                {block.points.map((p, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-purple-400 text-lg">•</span>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default HowItWork;