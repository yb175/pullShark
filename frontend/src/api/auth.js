import axios from "axios";

// For Vite - use import.meta.env instead of process.env
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

console.log("API Base URL:", API_BASE_URL);

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Start GitHub OAuth flow
export function startGithubLogin() {
  const redirectUrl = `${API_BASE_URL}/auth/redirect`;
  console.log("Redirecting to:", redirectUrl);
  window.location.href = redirectUrl;
}

// Exchange GitHub code for session
export async function exchangeCodeForSession(code) {
  console.log("Exchanging code:", code);
  try {
    const { data } = await api.get(`/auth/exchange/${code}`);
    return data;
  } catch (error) {
    console.error("Exchange error:", error);
    throw error;
  }
}

// Check current session
export async function checkAuthStatus() {
  try {
    const { data } = await api.get("/auth/status");
    return data;
  } catch (error) {
    console.error("Auth status error:", error);
    throw error;
  }
}

// Logout
export async function logout() {
  try {
    const { data } = await api.get("/auth/logout");
    return data;
  } catch (error) {
    console.error("Logout error:", error);
    throw error;
  }
}