import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Start GitHub OAuth flow
export function startGithubLogin() {
  window.location.href = `${API_BASE_URL}/auth/redirect`;
}

// Exchange GitHub code for session
export async function exchangeCodeForSession(code) {
  const { data } = await api.get(`/auth/exchange/${code}`);
  return data;
}

// Check current session
export async function checkAuthStatus() {
  const { data } = await api.get("/auth/status");
  return data;
}

// Logout
export async function logout() {
  const { data } = await api.get("/auth/logout");
  return data;
}