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
      return rejectWithValue(e?.response?.data || { message: "Not authenticated" });
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
      // ✔ CHECK SESSION
      .addCase(checkAuthStatusThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkAuthStatusThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.authenticated = action.payload.authenticated || false;
        state.user = action.payload.user || null;
      })
      .addCase(checkAuthStatusThunk.rejected, (state, action) => {
        state.loading = false;
        state.authenticated = false;
        state.user = null;
        state.error = action.payload?.message;
      })

      // ✔ EXCHANGE CODE
      .addCase(exchangeCodeThunk.fulfilled, (state, action) => {
        state.authenticated = true;
        state.user = action.payload;   // action.payload = { username, email, userId }
      })

      // ✔ LOGOUT
      .addCase(logoutThunk.fulfilled, (state) => {
        state.authenticated = false;
        state.user = null;
      });
  },
});

export const { startGithubLoginAction } = authSlice.actions;
export default authSlice.reducer;



