import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { startGithubLoginAction, exchangeCodeThunk } from "../slice/authSlice";
import { Link, useSearchParams, useNavigate } from "react-router-dom";

export default function LoginPanel() {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const code = searchParams.get("code");
  const authenticated = useSelector((s) => s.auth.authenticated);

  useEffect(() => {
    if (code) {
      dispatch(exchangeCodeThunk(code)).unwrap().catch(() => navigate("/login"));
    }
  }, [code]);

  
  useEffect(() => {
    if (authenticated) {
      // remove ?code from URL
      window.history.replaceState({}, "", "/");
      navigate("/");
    }
  }, [authenticated]);

  return (
    <section className="min-h-screen flex items-center justify-center bg-black text-white px-4">
      <div className="w-full max-w-md mx-auto p-10 rounded-2xl bg-white/5 backdrop-blur-2xl border border-white/10">

        <h2 className="text-4xl font-bold mb-6 text-center">
          Log In
        </h2>

        <button
          onClick={() => dispatch(startGithubLoginAction())}
          className="w-full px-5 py-3 rounded-md bg-white text-black font-semibold flex items-center justify-center gap-3"
        >
          Login with GitHub
        </button>

        <div className="text-center mt-5">
          <Link
            to="/signup"
            className="text-white/60 hover:text-white underline"
          >
            Don’t have an account? Sign up
          </Link>
        </div>

      </div>
    </section>
  );
}
