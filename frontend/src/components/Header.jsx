import React from 'react'
import { Link, NavLink } from "react-router-dom";
function Header() {
 return (
 <header className="sticky top-0 z-50 backdrop-blur-md bg-black/30 border-b border-white/5">
    <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 flex items-center justify-between h-16">
      <div className="flex items-center gap-4">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#0ee7d6]/50 to-[#ff48e6]/30 flex items-center justify-center shadow-[0_6px_24px_rgba(0,0,0,0.6)]">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M3 12C3 7.58 6.58 4 11 4C15.42 4 19 7.58 19 12C19 16.42 15.42 20 11 20C6.58 20 3 16.42 3 12Z"
              stroke="#00fff0"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path d="M11 7L13 11L11 13L9 11L11 7Z" fill="#0ff" opacity="0.18" />
          </svg>
        </div>
        <span className="font-mono text-sm text-white/90">PullShark AI</span>
      </div>

      <nav className="hidden md:flex items-center gap-6 text-sm text-white/60">
        <Link to="/">Home</Link>
        <Link to="/features">Features</Link>
        <Link to="/pricing">Pricing</Link>
        <Link to="/contact">Contact</Link>
      </nav>

      <div className="flex items-center gap-4">
        <Link to="/login">
        <button className="px-4 py-2 rounded-md bg-gradient-to-r from-[#00fff0] to-[#8b2fff] text-black font-semibold shadow-lg hover:scale-[1.01] transform transition">
          Get Started
        </button>
        </Link>
      </div>
    </div>
  </header>
  )
}

export default Header