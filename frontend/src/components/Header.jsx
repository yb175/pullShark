import React, { useState, useRef, useEffect } from 'react'
import { Link } from "react-router";
import { useSelector, useDispatch } from "react-redux";
import { logoutThunk } from "../slice/authSlice";

function Header() {
  const { authenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    dispatch(logoutThunk());
    setIsDropdownOpen(false);
  };

  // Debug log to see header state
  console.log("Header - authenticated:", authenticated, "user:", user);

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-black/30 border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 flex items-center justify-between h-16">
        <div className="flex items-center gap-4">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#0ee7d6]/50 to-[#ff48e6]/30 flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M3 12C3 7.58 6.58 4 11 4C15.42 4 19 7.58 19 12C19 16.42 15.42 20 11 20C6.58 20 3 16.42 3 12Z"
                stroke="#00fff0"
                strokeWidth="1.2"
              />
              <path d="M11 7L13 11L11 13L9 11L11 7Z" fill="#0ff" opacity="0.18" />
            </svg>
          </div>
          <span className="font-mono text-sm text-white/90">PullShark AI</span>
        </div>

        <nav className="hidden md:flex items-center gap-6 text-sm text-white/60">
          <Link to="/#hero">Home</Link>
          <Link to="/#features">Features</Link>
          <Link to="/#pricing">Working</Link>
          <Link to="/#security">Security</Link>
          <Link to="/#contact">Contact</Link>
        </nav>

        <div className="flex items-center gap-4">
          {authenticated && user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-3 p-1 rounded-lg hover:bg-white/5 transition"
              >
                <img
                  src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.username}&background=00fff0&color=000`}
                  alt={user.username}
                  className="w-8 h-8 rounded-full border-2 border-[#00fff0]/50"
                />
                <span className="text-white/80 text-sm hidden sm:block">
                  {user.username}
                </span>
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-black/90 backdrop-blur-md border border-white/10 rounded-lg py-2 z-50">
                  <div className="px-4 py-2 border-b border-white/10">
                    <p className="text-white/90 text-sm font-medium">{user.username}</p>
                    <p className="text-white/60 text-xs truncate">{user.email}</p>
                  </div>
                  
                  <Link 
                    to="/repo" 
                    className="block px-4 py-2 text-sm text-white/80 hover:bg-white/5 transition"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    My Repositories
                  </Link>
                  
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login">
              <button className="px-4 py-2 rounded-md bg-gradient-to-r from-[#00fff0] to-[#8b2fff] text-black font-semibold hover:opacity-90 transition">
                Get Started
              </button>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header;