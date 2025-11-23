import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { exchangeCodeThunk } from "../slice/authSlice";

export default function AuthCallback() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loading, error, authenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    const code = searchParams.get("code");
    
    if (code) {
      console.log("Exchanging code:", code);
      dispatch(exchangeCodeThunk(code))
        .unwrap()
        .then(() => {
          console.log("Login successful, redirecting to /repo");
          navigate("/repo", { replace: true });
        })
        .catch((error) => {
          console.error("Login failed:", error);
          navigate("/login", { 
            replace: true,
            state: { error: error.message || "Login failed" }
          });
        });
    } else {
      console.log("No code found in URL, redirecting to login");
      navigate("/login", { replace: true });
    }
  }, [dispatch, navigate, searchParams]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-400">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-white">Processing login...</div>
    </div>
  );
}