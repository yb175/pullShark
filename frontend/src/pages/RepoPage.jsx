import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import PullSharkAppPrompt from "./InstallGithubApp";
import {
  GitFork,
  Star,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  Code2,
} from "lucide-react";
// IMPORTANT: Adjust this import path to match your actual project structure
import { fetchReposThunk, changePage } from "../slice/repoSlice";

// --- 1. CSS Styles for Shimmer Animation ---
// Injecting styles for a custom, smooth diagonal shimmer effect.
const shimmerStyles = `
  @keyframes shimmer-slide {
    0% {
      transform: translateX(-100%) skewX(-20deg);
    }
    100% {
      transform: translateX(100%) skewX(-20deg);
    }
  }
  .animate-shimmer {
    animation: shimmer-slide 1.5s infinite linear;
  }
  /* Custom scrollbar for the content area */
  .custom-scrollbar::-webkit-scrollbar {
      width: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.02);
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 10px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: rgba(255, 255, 255, 0.2);
  }
`;

const RepoDashboard = () => {
  const dispatch = useDispatch();
  const { repos, loading, error, pagination } = useSelector(
    (state) => state.repos
  );
  const { authenticated, user } = useSelector((state) => state.auth);
  // Initial Fetch & Page Change Listener
  useEffect(() => {
    // Using limit 9 for a balanced 3x3 grid on desktop
    dispatch(fetchReposThunk({ page: pagination.page, limit: 9 }));
  }, [dispatch, pagination.page]);

  const handlePageChange = (newPage) => {
    dispatch(changePage(newPage));
  };
  const installUrl = "https://github.com/apps/pullSharkSite/installations/new";
  return (
    <>
    <PullSharkAppPrompt isInstalled={user?.installationId} installUrl={installUrl} />
      <style>{shimmerStyles}</style>
      {/* Outer Container: Full screen, centered content, rich dark background */}
      <div className="relative flex items-center justify-center h-screen w-full bg-[#050505] overflow-hidden text-zinc-100 font-sans selection:bg-indigo-500/20 selection:text-indigo-200">
        {/* Ambient Background Effects */}
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-indigo-800/10 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-fuchsia-900/10 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15] pointer-events-none mix-blend-overlay"></div>

        {/* Main "Glass" Dashboard Panel (Fixed Height) */}
        <main className="relative z-10 w-full max-w-[1300px] h-full md:h-[85vh] md:mx-8 flex flex-col bg-zinc-900/30 backdrop-blur-xl md:rounded-3xl border border-white/10 shadow-2xl shadow-black/40 overflow-hidden ring-1 ring-white/5">
          {/* --- Header --- */}
          <header className="flex-none px-8 py-5 border-b border-white/5 flex items-center justify-between bg-black/10">
            <div className="flex items-center gap-4">
              {/* Icon Box */}
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/20 flex items-center justify-center shadow-inner shadow-indigo-500/10">
                <Code2 className="w-5 h-5 text-indigo-300" />
              </div>
              <div>
                <h1 className="text-lg font-semibold tracking-tight text-white">
                  Repository Explorer
                </h1>
                <p className="text-xs text-zinc-500 font-medium tracking-wide uppercase">
                  Project Index
                </p>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/5 border border-white/5 text-xs font-medium text-zinc-400 tabular-nums">
              <LayoutGrid className="w-3.5 h-3.5 opacity-70" />
              <span>Page {pagination.page}</span>
            </div>
          </header>

          {/* --- Scrollable Content Area --- */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar relative">
            {/* Error State */}
            {error && (
              <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                <div className="mx-auto max-w-md p-4 text-sm text-red-300 bg-red-950/90 backdrop-blur-md border border-red-500/30 rounded-xl text-center shadow-lg pointer-events-auto">
                  {error}
                </div>
              </div>
            )}

            {loading ? (
              <ShimmerGrid />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                  {repos.map((repo, i) => (
                    <RepoCard key={repo.id || i} repo={repo} index={i} />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* --- Footer Pagination --- */}
          <footer className="flex-none px-8 py-4 border-t border-white/5 bg-black/20 flex items-center justify-between backdrop-blur-md">
            <span className="text-xs font-medium text-zinc-500 tabular-nums hidden md:block">
              Showing {repos.length} results
            </span>

            <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-start">
              <PaginationButton
                disabled={!pagination.hasPrevPage || loading}
                onClick={() => handlePageChange(pagination.page - 1)}
                icon={<ChevronLeft className="w-4 h-4" />}
                label="Previous"
              />
              <PaginationButton
                disabled={!pagination.hasNextPage || loading}
                onClick={() => handlePageChange(pagination.page + 1)}
                icon={<ChevronRight className="w-4 h-4" />}
                label="Next"
                reverse
              />
            </div>
          </footer>
        </main>
      </div>
    </>
  );
};

// =========================================
// Sub-Components
// =========================================

// 1. The Loaded Repository Card
const RepoCard = ({ repo, index }) => (
  <motion.div
    layout
    initial={{ opacity: 0, scale: 0.95, y: 10 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
    transition={{
      duration: 0.3,
      delay: index * 0.04,
      ease: [0.23, 1, 0.32, 1],
    }} // Modern ease curve
    className="group relative flex flex-col justify-between p-6 h-[200px] rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 hover:border-indigo-500/20 transition-all duration-300"
  >
    {/* Subtle gradient overlay on hover */}
    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

    <div className="relative z-10">
      <div className="flex justify-between items-start gap-4 mb-3">
        <h3 className="text-[15px] font-semibold text-zinc-200 leading-tight group-hover:text-indigo-300 transition-colors truncate">
          {repo.name}
        </h3>
        {repo.language && (
          <span className="flex-none px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-300/70 bg-indigo-500/5 rounded-md border border-indigo-500/10">
            {repo.language}
          </span>
        )}
      </div>

      <p className="text-[13px] text-zinc-500 leading-relaxed line-clamp-2 font-medium">
        {repo.description || "No description provided for this repository."}
      </p>
    </div>

    <div className="relative z-10 flex items-center justify-between pt-4 mt-auto border-t border-white/5">
      <div className="flex items-center gap-4 text-xs font-medium text-zinc-500 tabular-nums">
        <div className="flex items-center gap-1.5">
          <Star className="w-3.5 h-3.5 text-amber-500/70" />
          {repo.stargazers_count}
        </div>
        <div className="flex items-center gap-1.5">
          <GitFork className="w-3.5 h-3.5 text-blue-500/70" />
          {repo.forks_count}
        </div>
      </div>

      <a
        href={repo.html_url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-zinc-400 hover:text-white transition-colors group/link p-1"
      >
        Open
        <ExternalLink className="w-3 h-3 opacity-50 group-hover/link:opacity-100 transition-opacity mb-[1px]" />
      </a>
    </div>
  </motion.div>
);

// 2. Pagination Button Component
const PaginationButton = ({ disabled, onClick, icon, label, reverse }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`
      flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 border
      ${
        disabled
          ? "border-transparent text-zinc-600 cursor-not-allowed opacity-50"
          : "border-white/5 bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white hover:border-white/10 active:scale-[0.98]"
      }
    `}
  >
    {!reverse && icon}
    <span>{label}</span>
    {reverse && icon}
  </button>
);

// 3. The Shimmer Loading Grid
const ShimmerGrid = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
    {[...Array(9)].map((_, i) => (
      // The container has overflow-hidden to contain the shimmering gradient
      <div
        key={i}
        className="relative h-[200px] rounded-2xl bg-white/[0.02] border border-white/5 p-6 flex flex-col justify-between overflow-hidden"
      >
        {/* THE SHIMMER EFFECT LAYER */}
        {/* A wide gradient layer that moves diagonally across the container */}
        <div className="absolute inset-0 z-20 w-[200%] -translate-x-full bg-gradient-to-r from-transparent via-white/[0.05] to-transparent animate-shimmer pointer-events-none will-change-transform" />

        {/* Static gray placeholders underneath the shimmer */}
        <div className="space-y-4 relative z-10">
          <div className="flex justify-between items-center">
            <div className="h-5 w-1/3 bg-zinc-800/50 rounded-md"></div>{" "}
            {/* Title placeholder */}
            <div className="h-5 w-12 bg-zinc-800/50 rounded-md"></div>{" "}
            {/* Language placeholder */}
          </div>
          <div className="space-y-2">
            <div className="h-4 w-full bg-zinc-800/30 rounded-md"></div>{" "}
            {/* Desc line 1 */}
            <div className="h-4 w-4/5 bg-zinc-800/30 rounded-md"></div>{" "}
            {/* Desc line 2 */}
          </div>
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-white/5 relative z-10 mt-auto">
          <div className="flex gap-3">
            <div className="h-4 w-10 bg-zinc-800/50 rounded-md"></div>{" "}
            {/* Stats placeholder */}
            <div className="h-4 w-10 bg-zinc-800/50 rounded-md"></div>{" "}
            {/* Stats placeholder */}
          </div>
          <div className="h-4 w-16 bg-zinc-800/50 rounded-md"></div>{" "}
          {/* Button placeholder */}
        </div>
      </div>
    ))}
  </div>
);

export default RepoDashboard;
