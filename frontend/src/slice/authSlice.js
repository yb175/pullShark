import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { checkAuthStatus, exchangeCodeForSession, logout, startGithubLogin } from "../api/auth";

// Check authentication status
export const checkAuthStatusThunk = createAsyncThunk(
  "auth/checkStatus",
  async (_, { rejectWithValue }) => {
    try {
      const res = await checkAuthStatus();
      return res;
    } catch (e) {
      return rejectWithValue(e?.response?.data || { message: "Not authenticated" });
    }
  }
);

// Exchange GitHub code for session
export const exchangeCodeThunk = createAsyncThunk(
  "auth/exchangeCode",
  async (code, { rejectWithValue }) => {
    try {
      const res = await exchangeCodeForSession(code);
      return res.data; // { username, email, userId }
    } catch (e) {
      return rejectWithValue(e?.response?.data || { message: "Login failed" });
    }
  }
);

// Logout
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
    // Action for starting GitHub OAuth redirect
    startGithubLoginAction: () => {
      startGithubLogin();
    },
    // Clear error
    clearError: (state) => {
      state.error = null;
    },
    // Set user data (optional, for direct user setting)
    setUser: (state, action) => {
      state.user = action.payload;
      state.authenticated = true;
    },
  },
  extraReducers: (builder) => {
    builder
      // checkAuthStatus
      .addCase(checkAuthStatusThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkAuthStatusThunk.fulfilled, (state) => {
        state.loading = false;
        state.authenticated = true;
      })
      .addCase(checkAuthStatusThunk.rejected, (state, action) => {
        state.loading = false;
        state.authenticated = false;
        state.user = null;
        state.error = action.payload?.message || "";
      })
      // exchangeCode
      .addCase(exchangeCodeThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(exchangeCodeThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.authenticated = true;
        state.user = action.payload;
      })
      .addCase(exchangeCodeThunk.rejected, (state, action) => {
        state.loading = false;
        state.authenticated = false;
        state.user = null;
        state.error = action.payload?.message || "";
      })
      // logout
      .addCase(logoutThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutThunk.fulfilled, (state) => {
        state.loading = false;
        state.authenticated = false;
        state.user = null;
      })
      .addCase(logoutThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "";
      });
  },
});

export const { startGithubLoginAction, clearError, setUser } = authSlice.actions;
export default authSlice.reducer;

