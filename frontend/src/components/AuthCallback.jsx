import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { exchangeCodeForSession } from "../api/auth";

export default function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const code = searchParams.get("code");

    if (code) {
      console.log("Exchanging code:", code);

      exchangeCodeForSession(code)
        .then(() => {
          console.log("Login successful, redirecting to /repo");
          navigate("/repo", { replace: true });
        })
        .catch((error) => {
          console.error("Login failed:", error);
          navigate("/login", {
            replace: true,
            state: { error: error.message || "Login failed" },
          });
        });
    } else {
      console.log("No code found in URL, redirecting to login");
      navigate("/login", { replace: true });
    }
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-white">Processing login...</div>
    </div>
  );
}
