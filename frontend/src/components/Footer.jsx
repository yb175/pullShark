import React from 'react'

function Footer() {
  return (
    <footer className="border-t border-white/5 bg-gradient-to-b from-black via-black to-gray-950 backdrop-blur-sm py-10 text-center text-sm text-white/60">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Command-style Links */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 font-mono text-white/70">
          <div className="hover:text-white transition cursor-pointer">$ about --contact</div>
          <div className="hover:text-white transition cursor-pointer">$ github --open</div>
          <div className="hover:text-white transition cursor-pointer">$ docs --read</div>
          <div className="hover:text-white transition cursor-pointer">$ join --community</div>
        </div>

        {/* Divider Line */}
        <div className="mx-auto w-24 h-[1px] bg-white/10 mt-8 mb-6" />

        {/* Copyright */}
        <p className="text-xs text-white/40 tracking-wide">
          © {new Date().getFullYear()} PullShark AI — Ship Fearlessly, Merge Confidently.
        </p>
      </div>
    </footer>
  )
}

export default Footer