import axios from "axios";

// Get base URL from Vite environment variables
const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

// Create axios instance with credentials
export const api = axios.create({
  baseURL: baseURL,
  withCredentials: true,
});

// Start GitHub OAuth flow
export function startGithubLogin() {
  window.location.href = `${baseURL}/auth/redirect`;
}

// Exchange code for session
export async function exchangeCodeForSession(code) {
  const { data } = await api.get(`/auth/exchange/${code}`);
  return data;
}

// Check authentication status
export async function checkAuthStatus() {
  try {
    const { data } = await api.get("/auth/status");
    return data;
  } catch (error) {
    // If we get a 401, it means not authenticated, which is fine
    if (error.response?.status === 401) {
      return { success: false, authenticated: false, message: "Not authenticated" };
    }
    throw error;
  }
}

// Logout
export async function logout() {
  const { data } = await api.get("/auth/logout");
  return data;
}