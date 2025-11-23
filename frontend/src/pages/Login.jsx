import { useDispatch, useSelector } from "react-redux";
import { 
  startGithubLoginAction, 
  exchangeCodeThunk, 
  checkAuthStatusThunk, 
  logoutThunk 
} from "../slice/authSlice";
import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function LoginPanel() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { authenticated, user, loading, error } = useSelector((s) => s.auth);

  // Check session on load
  useEffect(() => {
    dispatch(checkAuthStatusThunk());
  }, [dispatch]);

  // Handle OAuth callback ?code=
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    if (code) dispatch(exchangeCodeThunk(code));
  }, [dispatch]);

  // 🚀 Redirect to /repo when authenticated
  useEffect(() => {
    if (authenticated) {
      navigate("/repo", { replace: true });
    }
  }, [authenticated, navigate]);

  // Loading Screen
  if (loading) {
    return (
      <section className="min-h-screen flex items-center justify-center bg-gradient-to-b from-black via-black to-gray-950 text-white">
        <div className="text-white text-lg">Loading...</div>
      </section>
    );
  }

  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-b from-black via-black to-gray-950 text-white px-4">
      <div className="w-full max-w-md mx-auto relative p-10 rounded-2xl bg-black/30 border border-white/10 backdrop-blur-xl shadow-[0_0_60px_rgba(0,255,240,0.08)]">

        <div className="absolute inset-0 rounded-2xl -z-10 opacity-30 bg-gradient-to-r from-[#00fff0] to-[#8b2fff] blur-3xl"></div>

        <h2 className="text-4xl font-bold mb-6 text-center">
          {authenticated ? "Welcome Back" : "Log In"}
        </h2>

        <p className="text-center text-white/60 mb-8 text-sm">
          {authenticated 
            ? "Redirecting to your repositories..."
            : "Log in with GitHub to continue your code reviews"}
        </p>

        {error && (
          <p className="text-red-400 text-sm text-center mb-4 p-3 bg-red-400/10 rounded-md">
            {error}
          </p>
        )}

        {/* ------------------ LOGIN BUTTON ------------------ */}
          <>
            <button
              onClick={() => dispatch(startGithubLoginAction())}
              disabled={loading}
              className="w-full px-5 py-3 rounded-md font-semibold bg-white text-black hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {loading ? (
                "Connecting to GitHub..."
              ) : (
                <>
                  {/* Correct GitHub SVG */}
                  <svg
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M12 0C5.37 0 0 5.37 0 12a12 12 0 008.205 11.387c.6.113.82-.26.82-.577 
                      0-.285-.01-1.04-.015-2.04-3.338.726-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.757-1.333-1.757-1.09-.745.083-.73.083-.73 
                      1.205.085 1.84 1.237 1.84 1.237 1.07 1.835 2.807 1.304 3.492.997.108-.775.418-1.305.762-1.605-2.665-.304-5.466-1.332-5.466-5.93 
                      0-1.31.47-2.38 1.236-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23a11.45 11.45 0 013.003-.404c1.02.005 
                      2.047.138 3.003.404 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 
                      0 4.61-2.807 5.62-5.48 5.92.43.37.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57A12.006 
                      12.006 0 0024 12c0-6.63-5.37-12-12-12z"
                    />
                  </svg>
                  Login with GitHub
                </>
              )}
            </button>

            {/* ------------------ SIGNUP LINK ------------------ */}
            <div className="text-center mt-5">
              <Link
                to="/signup"
                className="text-white/70 hover:text-[#00fff0] transition font-medium underline underline-offset-4"
              >
                Don’t have an account? Sign up
              </Link>
            </div>
          </>
        </div>
    </section>
  );
}





