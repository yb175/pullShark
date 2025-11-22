import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import { exchangeCodeThunk } from "../slice/authSlice";

export default function AuthCallback() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    if (code) {
      dispatch(exchangeCodeThunk(code))
        .unwrap()
        .then(() => navigate("/repo"))
        .catch(() => navigate("/login"));
    } else {
      navigate("/login");
    }
  }, [dispatch, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-black via-black to-gray-950 text-white">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00fff0] mx-auto mb-4"></div>
        <p>Completing authentication...</p>
      </div>
    </div>
  );
}
