import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { exchangeCodeThunk } from "../slice/authSlice";

export default function AuthCallback() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const code = searchParams.get("code");

    if (!code) {
      navigate("/login", { replace: true });
      return;
    }

    dispatch(exchangeCodeThunk(code))
      .unwrap()
      .then(() => {
        navigate("/repo", { replace: true });
      })
      .catch(() => {
        navigate("/login", { replace: true });
      });
  }, [dispatch, navigate, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-white">Processing login...</div>
    </div>
  );
}
