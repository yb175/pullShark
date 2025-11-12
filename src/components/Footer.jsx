import React from 'react'

function Footer() {
  return (
    <footer className="border-t border-white/5 bg-gradient-to-b from-black via-black to-gray-950 backdrop-blur-sm py-6 text-center text-sm text-white/50">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="font-mono mb-2">$ about --contact</div>
        <div className="font-mono mb-2">$ github --open</div>
        <div className="font-mono mb-2">$ docs --read</div>
        <div className="font-mono">$ join --community</div>
        <p className="mt-6 text-xs text-white/40">
          © {new Date().getFullYear()} PullShark AI — Ship Fearlessly, Merge Confidently.
        </p>
      </div>
    </footer>
  )
}

export default Footer