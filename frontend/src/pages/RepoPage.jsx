import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchReposThunk, changePage } from "../slice/repoSlice";

export default function RepoPage() {
  const dispatch = useDispatch();

  // ---- FIXED SELECTORS (NO NEW OBJECT CREATED) ----
const repos = useSelector((state) => state.repos.repos);
const loading = useSelector((state) => state.repos.loading);
const error = useSelector((state) => state.repos.error);
const page = useSelector((state) => state.repos.pagination?.page ?? 1);
const hasNextPage = useSelector((state) => state.repos.pagination?.hasNextPage ?? false);
const hasPrevPage = useSelector((state) => state.repos.pagination?.hasPrevPage ?? false);

  // ---- FETCH ON COMPONENT MOUNT ----
  useEffect(() => {
    dispatch(fetchReposThunk({ page: 1, limit: 5 }));
  }, [dispatch]);

  // ---- FETCH WHEN PAGE CHANGES ----
  useEffect(() => {
    dispatch(fetchReposThunk({ page, limit: 5 }));
  }, [dispatch, page]);

  // ---- Pagination Buttons ----
  const handleNextPage = () => {
    if (hasNextPage) dispatch(changePage(page + 1));
  };

  const handlePrevPage = () => {
    if (hasPrevPage) dispatch(changePage(page - 1));
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  // ---- Loading UI ----
  if (loading && repos.length === 0) {
    return (
      <section className="min-h-screen py-20 bg-black text-white text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00fff0]"></div>
        <p className="mt-4 text-white/60">Loading repositories...</p>
      </section>
    );
  }

  return (
    <section className="min-h-screen py-20 bg-gradient-to-b from-black via-black to-gray-950 text-white">

      {/* Header */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 text-center mb-12">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-[#00fff0] to-[#8b2fff] bg-clip-text text-transparent">
          Your Repositories
        </h1>
        <p className="text-white/60 text-lg mt-3">
          Manage and select repositories for code review
        </p>
      </div>

      {/* Error UI */}
      {error && (
        <div className="max-w-xl mx-auto mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-center">
          {error}
        </div>
      )}

      {/* Repo Cards */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {repos.length > 0 ? (
          <>
            <div className="grid gap-6 grid-cols-1">
              {repos.map((repo) => (
                <div
                  key={repo.id}
                  className="group p-6 rounded-2xl bg-black/30 border border-white/10 backdrop-blur-xl hover:border-[#00fff0]/30 transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {repo.owner?.avatar_url && (
                        <img
                          src={repo.owner.avatar_url}
                          alt={repo.owner.login}
                          className="w-8 h-8 rounded-full"
                        />
                      )}
                      <div>
                        <h3 className="font-semibold group-hover:text-[#00fff0]">
                          {repo.name}
                        </h3>
                        <p className="text-white/60 text-sm">
                          {repo.owner?.login}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`px-2 py-1 text-xs rounded-full border ${
                        repo.private
                          ? "bg-red-500/20 text-red-400 border-red-500/30"
                          : "bg-green-500/20 text-green-400 border-green-500/30"
                      }`}
                    >
                      {repo.private ? "Private" : "Public"}
                    </span>
                  </div>

                  {repo.description && (
                    <p className="text-white/70 text-sm mb-4 line-clamp-2">
                      {repo.description}
                    </p>
                  )}

                  <div className="text-xs text-white/40 mb-4">
                    Updated {formatDate(repo.updated_at)}
                  </div>

                  <div className="flex gap-2">
                    <a
                      href={repo.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 px-3 py-2 text-sm bg-white/10 hover:bg-white/20 border border-white/10 text-white rounded-lg text-center"
                    >
                      View on GitHub
                    </a>

                    <button className="px-3 py-2 text-sm bg-gradient-to-r from-[#00fff0] to-[#8b2fff] rounded-lg text-black font-semibold hover:opacity-90">
                      Select
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center items-center gap-4 mt-12">
              <button
                onClick={handlePrevPage}
                disabled={!hasPrevPage}
                className={`px-6 py-3 rounded-lg font-semibold ${
                  hasPrevPage
                    ? "bg-white/10 hover:bg-white/20 border border-white/10 text-white"
                    : "bg-white/5 text-white/30 border-white/5 cursor-not-allowed"
                }`}
              >
                Previous
              </button>

              <span className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white/60">
                Page {page}
              </span>

              <button
                onClick={handleNextPage}
                disabled={!hasNextPage}
                className={`px-6 py-3 rounded-lg font-semibold ${
                  hasNextPage
                    ? "bg-gradient-to-r from-[#00fff0] to-[#8b2fff] text-black hover:opacity-90"
                    : "bg-white/5 text-white/30 border-white/5 cursor-not-allowed"
                }`}
              >
                Next
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <h3 className="text-xl font-semibold mb-2">No repositories found</h3>
            <p className="text-white/60 mb-6">
              You don't have any repositories yet.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

