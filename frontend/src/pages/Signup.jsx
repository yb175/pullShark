import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { startGithubLoginAction, clearError } from "../slice/authSlice";
import { Link, useNavigate } from "react-router";

export default function Signup() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, authenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (authenticated) {
      navigate("/repo");
    }
  }, [authenticated, navigate]);

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleGithubSignup = () => {
    dispatch(startGithubLoginAction());
  };

  if (authenticated) {
    return null;
  }

  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-b from-black via-black to-gray-950 text-white px-4">
      <div className="w-full max-w-md mx-auto relative p-10 rounded-2xl bg-black/30 border border-white/10 backdrop-blur-xl shadow-[0_0_60px_rgba(0,255,240,0.08)]">
        <div className="absolute inset-0 rounded-2xl -z-10 opacity-30 bg-gradient-to-r from-[#00fff0] to-[#8b2fff] blur-3xl"></div>

        <h2 className="text-4xl font-bold mb-6 text-center">Create Account</h2>
        <p className="text-center text-white/60 mb-8 text-sm">
          Join us with GitHub and start reviewing code instantly
        </p>

        {error && (
          <p className="text-red-400 text-sm text-center mb-4 p-3 bg-red-400/10 rounded-md">
            {error}
          </p>
        )}

        <button
          onClick={handleGithubSignup}
          disabled={loading}
          className="w-full px-5 py-3 rounded-md font-semibold bg-white text-black hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-3"
        >
          {loading ? (
            "Connecting to GitHub..."
          ) : (
            <>
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              Sign up with GitHub
            </>
          )}
        </button>

        <p className="text-center mt-6 text-sm text-white/60">
          Already have an account?{" "}
          <Link to="/login" className="text-[#00fff0] hover:underline">
            Login
          </Link>
        </p>
      </div>
    </section>
  );
}