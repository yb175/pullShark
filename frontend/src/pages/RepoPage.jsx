import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router';

export default function RepoPage() {
  const { user } = useSelector((state) => state.auth);
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPrevPage, setHasPrevPage] = useState(false);

  useEffect(() => {
    fetchRepos(currentPage);
  }, [currentPage]);

  const fetchRepos = async (page) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching repos from:', `/api/repos?page=${page}&limit=10`);
      
      const response = await fetch(`/api/repos?page=${page}&limit=10`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      const responseText = await response.text();
      console.log('Raw response:', responseText.substring(0, 200)); // First 200 chars
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        throw new Error(`Invalid JSON response. Server returned: ${responseText.substring(0, 100)}`);
      }
      
      if (data.success) {
        console.log('Repos fetched successfully:', data.repos?.length || 0, 'repos');
        setRepos(data.repos || []);
        setHasNextPage(data.pagination?.hasNextPage || false);
        setHasPrevPage(data.pagination?.hasPrevPage || false);
      } else {
        setError(data.message || 'Failed to fetch repositories');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to fetch repositories: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleNextPage = () => {
    if (hasNextPage) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (hasPrevPage) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <section className="min-h-screen py-20 relative overflow-hidden bg-gradient-to-b from-black via-black to-gray-950 border-t border-white/10 text-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00fff0]"></div>
            <p className="mt-4 text-white/60">Loading repositories...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen py-20 relative overflow-hidden bg-gradient-to-b from-black via-black to-gray-950 border-t border-white/10 text-white">
      {/* Background effects */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#00fff0] rounded-full blur-3xl opacity-10 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#8b2fff] rounded-full blur-3xl opacity-10 animate-pulse"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-[#00fff0] to-[#8b2fff] bg-clip-text text-transparent">
            Your Repositories
          </h1>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            Manage and select repositories for code review
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-center">
            {error}
          </div>
        )}

        {/* Repositories Grid */}
        {repos.length > 0 ? (
          <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {repos.map((repo) => (
                <div 
                  key={repo.id}
                  className="group relative p-6 rounded-2xl bg-black/30 border border-white/10 backdrop-blur-xl hover:border-[#00fff0]/30 transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,255,240,0.1)]"
                >
                  {/* Background glow effect */}
                  <div className="absolute inset-0 rounded-2xl -z-10 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-[#00fff0]/5 to-[#8b2fff]/5 transition-opacity duration-300"></div>
                  
                  {/* Repo Header */}
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
                        <h3 className="font-semibold text-white group-hover:text-[#00fff0] transition-colors">
                          {repo.name}
                        </h3>
                        <p className="text-white/60 text-sm">{repo.owner?.login}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {repo.private ? (
                        <span className="px-2 py-1 text-xs bg-red-500/20 text-red-400 rounded-full border border-red-500/30">
                          Private
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs bg-green-500/20 text-green-400 rounded-full border border-green-500/30">
                          Public
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  {repo.description && (
                    <p className="text-white/70 text-sm mb-4 line-clamp-2">
                      {repo.description}
                    </p>
                  )}

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-sm text-white/60 mb-4">
                    {repo.language && (
                      <span className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-[#00fff0]"></div>
                        {repo.language}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25z"/>
                      </svg>
                      {repo.stargazers_count}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M5 3.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm0 2.122a2.25 2.25 0 10-1.5 0v.878A2.25 2.25 0 005.75 8.5h1.5v2.128a2.251 2.251 0 101.5 0V8.5h1.5a2.25 2.25 0 002.25-2.25v-.878a2.25 2.25 0 10-1.5 0v.878a.75.75 0 01-.75.75h-4.5A.75.75 0 015 6.25v-.878zm3.25 7.378a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm3-8.75a.75.75 0 100-1.5.75.75 0 000 1.5z"/>
                      </svg>
                      {repo.forks_count}
                    </span>
                  </div>

                  {/* Updated Date */}
                  <div className="text-xs text-white/40 mb-4">
                    Updated {formatDate(repo.updated_at)}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <a 
                      href={repo.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 px-3 py-2 text-sm bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg transition-colors text-center"
                    >
                      View on GitHub
                    </a>
                    <button className="px-3 py-2 text-sm bg-gradient-to-r from-[#00fff0] to-[#8b2fff] text-black font-semibold rounded-lg hover:opacity-90 transition-opacity">
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
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  hasPrevPage 
                    ? 'bg-white/10 hover:bg-white/20 border border-white/10 hover:border-[#00fff0]/30 text-white' 
                    : 'bg-white/5 border border-white/5 text-white/30 cursor-not-allowed'
                }`}
              >
                Previous
              </button>
              
              <span className="px-4 py-2 bg-white/5 rounded-lg border border-white/10 text-white/60">
                Page {currentPage}
              </span>
              
              <button
                onClick={handleNextPage}
                disabled={!hasNextPage}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  hasNextPage 
                    ? 'bg-gradient-to-r from-[#00fff0] to-[#8b2fff] text-black hover:opacity-90' 
                    : 'bg-white/5 border border-white/5 text-white/30 cursor-not-allowed'
                }`}
              >
                Next
              </button>
            </div>
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-white/5 flex items-center justify-center">
              <svg className="w-12 h-12 text-white/40" fill="currentColor" viewBox="0 0 16 16">
                <path d="M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.53.22l2.22 2.22a.75.75 0 01.22.53v8.75a.75.75 0 01-.75.75h-2.5a.75.75 0 010-1.5h1.75v-4h-10a2 2 0 00-2 2v1.5H2.75a.75.75 0 010-1.5H4.5V5a.75.75 0 011.5 0v6.5a.75.75 0 001.5 0V5A.75.75 0 019 5v6.5a.75.75 0 001.5 0V5a.75.75 0 011.5 0v6.5a.75.75 0 001.5 0V5.5a.75.75 0 011.5 0v5a2 2 0 01-2 2H2z"/>
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No repositories found</h3>
            <p className="text-white/60 mb-6">You don't have any repositories yet or there was an issue fetching them.</p>
            <a 
              href="https://github.com/new"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#00fff0] to-[#8b2fff] text-black font-semibold rounded-lg hover:opacity-90 transition-opacity"
            >
              Create Repository
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
                <path fillRule="evenodd" d="M8.22 2.97a.75.75 0 011.06 0l4.25 4.25a.75.75 0 010 1.06l-4.25 4.25a.75.75 0 01-1.06-1.06l2.97-2.97H3.75a.75.75 0 010-1.5h7.44L8.22 4.03a.75.75 0 010-1.06z"/>
              </svg>
            </a>
          </div>
        )}
      </div>
    </section>
  );
}