import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true, // send/receive cookies
});

// 1) Start GitHub login (redirects the browser)
export async function startGithubLogin() {
  await api.get("/auth/redirect");
}

// 2) Handle GitHub OAuth callback: /auth/callback?code=...
export async function exchangeCodeForSession(code) {
  const { data } = await api.get(`/auth/exchange/${code}`);
  // -> { success, message, data: { username, email, userId } }
  return data;
}

// 3) Check current session
export const checkAuthStatus = async () => {
  const res = await api.get("/auth/status", { withCredentials: true });
  return res.data;
};

// 4) Logout
export async function logout() {
  const { data } = await api.get("/auth/logout");
  // -> { success: true, message: "Logged out successfully" }
  return data;
}