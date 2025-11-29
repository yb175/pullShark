import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { checkAuthStatus, exchangeCodeForSession, logout } from "../api/auth";

// ✔ CHECK SESSION
export const checkAuthStatusThunk = createAsyncThunk(
  "auth/checkStatus",
  async (_, { rejectWithValue }) => {
    try {
      const res = await checkAuthStatus();
      // { success, authenticated, user }
      return res;
    } catch (e) {
      return rejectWithValue(
        e?.response?.data || { message: "Not authenticated" }
      );
    }
  }
);

// ✔ EXCHANGE GITHUB CODE
export const exchangeCodeThunk = createAsyncThunk(
  "auth/exchangeCode",
  async (code, { rejectWithValue }) => {
    try {
      const res = await exchangeCodeForSession(code);
      // res = { success, data: { username, email, userId } }
      return res.data;
    } catch (e) {
      return rejectWithValue(e?.response?.data || { message: "Login failed" });
    }
  }
);

// ✔ LOGOUT
export const logoutThunk = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      const res = await logout();
      return res;
    } catch (e) {
      return rejectWithValue(e?.response?.data || { message: "Logout failed" });
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    authenticated: false,
    user: null,
    loading: false,
    error: null,
  },

  reducers: {
    startGithubLoginAction: () => {
      const base = import.meta.env.VITE_API_BASE_URL;
      window.location.href = `${base}/auth/redirect`;
    },
  },

  extraReducers: (builder) => {
    builder

      // --------------------------
      // ✔ CHECK SESSION
      // --------------------------
      .addCase(checkAuthStatusThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(checkAuthStatusThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.authenticated = action.payload?.authenticated || false;
        state.user = action.payload?.user || null;
        state.error = null;
      })

      .addCase(checkAuthStatusThunk.rejected, (state, action) => {
        state.loading = false;
        state.authenticated = false;
        state.user = null;
        state.error = action.payload?.message || "Not authenticated";
      })

      // --------------------------
      // ✔ EXCHANGE GITHUB CODE
      // --------------------------
      .addCase(exchangeCodeThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(exchangeCodeThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.authenticated = true;
        state.user = action.payload;
        state.error = null;
      })

      .addCase(exchangeCodeThunk.rejected, (state, action) => {
        state.loading = false;
        state.authenticated = false;
        state.user = null;
        state.error = action.payload?.message || "Login failed";
      })

      // --------------------------
      // ✔ LOGOUT
      // --------------------------
      .addCase(logoutThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(logoutThunk.fulfilled, (state) => {
        state.loading = false;
        state.authenticated = false;
        state.user = null;
        state.error = null;
      })

      .addCase(logoutThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Logout failed";
      });
  },
});

export const { startGithubLoginAction } = authSlice.actions;
export default authSlice.reducer;
