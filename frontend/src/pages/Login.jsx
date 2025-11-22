import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../slice/authSlice";

export default function Login() {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(loginUser(form));
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-b from-black via-black to-gray-950 text-white px-4">
      <div className="
        w-full max-w-md mx-auto relative
        p-10 rounded-2xl 
        bg-black/30 
        border border-white/10 
        backdrop-blur-xl 
        shadow-[0_0_60px_rgba(0,255,240,0.08)]
        transition-all duration-300
      ">

        {/* Soft outer glow ring */}
        <div className="absolute inset-0 rounded-2xl -z-10 opacity-30 bg-gradient-to-r from-[#00fff0] to-[#8b2fff] blur-3xl"></div>

        <h2 className="text-4xl font-bold mb-6 text-center tracking-tight">
          Welcome Back
        </h2>
        <p className="text-center text-white/60 mb-8 text-sm">
          Log in to continue your code reviews
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">

          {/* Floating Label Inputs */}
          <div className="relative">
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder=" "
              required
              className="
                w-full px-4 py-3 bg-black/30 border border-white/20 
                rounded-md text-white
                focus:outline-none focus:border-[#00fff0] 
                peer transition
              "
            />
            <label className="
              absolute left-4 top-3 text-white/40 text-sm 
              transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base 
              peer-placeholder-shown:text-white/40 peer-focus:top-[-10px] 
              peer-focus:text-xs peer-focus:text-[#00fff0]
            ">
              Email
            </label>
          </div>

          <div className="relative">
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder=" "
              required
              className="
                w-full px-4 py-3 bg-black/30 border border-white/20 
                rounded-md text-white
                focus:outline-none focus:border-[#00fff0] 
                peer transition
              "
            />
            <label className="
              absolute left-4 top-3 text-white/40 text-sm 
              transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base 
              peer-placeholder-shown:text-white/40 peer-focus:top-[-10px] 
              peer-focus:text-xs peer-focus:text-[#00fff0]
            ">
              Password
            </label>
          </div>

          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="
              px-5 py-3 mt-2 rounded-md font-semibold 
              text-black bg-gradient-to-r from-[#00fff0] to-[#8b2fff] 
              shadow-[0_8px_30px_rgba(139,47,255,0.3)]
              hover:opacity-90 hover:scale-[1.02]
              active:scale-[0.98]
              transition disabled:opacity-50
            "
          >
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>

        <p className="text-center mt-6 text-xs text-white/40">
          Forgot password?
          <span className="text-[#00fff0] ml-1 cursor-pointer hover:underline">
            Reset here
          </span>
        </p>
      </div>
    </section>
  );
}


