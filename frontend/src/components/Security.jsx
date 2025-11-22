import React from 'react';

function Security() {
  const cards = [
    {
      title: "Ephemeral Review Sessions",
      desc: "AI reviews run in isolated, temporary environments — no logs, no retention, no footprints.",
    },
    {
      title: "Zero-Visibility Encryption",
      desc: "Your data stays encrypted at rest and in transit with automated secure deletion post-analysis.",
    },
    {
      title: "Enterprise-Grade Compliance",
      desc: "SOC 2 Type II certified workflows with strict access controls and continuous auditing.",
    },
  ];

  return (
    <section className="py-21 bg-gradient-to-b from-gray-950 to-black border-t border-white/10 relative overflow-hidden">
      <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-10 tracking-tight">
          Your Data. Fully Protected.
        </h2>
        <p className="text-white/60 max-w-2xl mx-auto mb-16 text-lg">
          PullShark is built from the ground up with privacy, encryption, and secure AI processing at its core.
        </p>

        <div className="grid md:grid-cols-3 gap-8">
          {cards.map((box, i) => (
            <div
              key={i}
              className="p-8 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm shadow-xl shadow-black/20 hover:bg-white/[0.07] hover:shadow-purple-500/10 transition"
            >
              <h3 className="text-xl font-semibold text-white mb-3">
                {box.title}
              </h3>
              <p className="text-white/60 text-sm leading-relaxed">{box.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-12">
          <button className="px-7 py-3 border border-white/10 rounded-xl text-white/80 hover:bg-white/10 hover:text-white transition font-medium backdrop-blur-sm">
            Go to Trust Center
          </button>
        </div>
      </div>
    </section>
  );
}

export default Security;