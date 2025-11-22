import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { checkAuthStatus, exchangeCodeForSession, logout, startGithubLogin } from "../api/auth";

// Check authentication status
export const checkAuthStatusThunk = createAsyncThunk(
  "auth/checkStatus",
  async (_, { rejectWithValue }) => {
    try {
      const response = await checkAuthStatus();
      console.log("Auth status response:", response); // Debug log
      
      if (response.success && response.authenticated) {
        return response.data; // Return user data
      }
      throw new Error(response.message || "Not authenticated");
    } catch (error) {
      console.log("Auth status error:", error); // Debug log
      return rejectWithValue(error.response?.data || { message: "Not authenticated" });
    }
  }
);

// Exchange GitHub code for session
export const exchangeCodeThunk = createAsyncThunk(
  "auth/exchangeCode",
  async (code, { rejectWithValue }) => {
    try {
      const response = await exchangeCodeForSession(code);
      console.log("Exchange code response:", response); // Debug log
      
      if (response.success) {
        return response.data; // Return user data
      }
      throw new Error(response.message || "Login failed");
    } catch (error) {
      console.log("Exchange code error:", error); // Debug log
      return rejectWithValue(error.response?.data || { message: "Login failed" });
    }
  }
);

// Logout
export const logoutThunk = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      const response = await logout();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: "Logout failed" });
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
    authChecked: false,
  },
  reducers: {
    startGithubLoginAction: () => {
      startGithubLogin();
    },
    clearError: (state) => {
      state.error = null;
    },
    setAuthState: (state, action) => {
      state.authenticated = action.payload.authenticated;
      state.user = action.payload.user;
      state.authChecked = true;
    }
  },
  extraReducers: (builder) => {
    builder
      // checkAuthStatus
      .addCase(checkAuthStatusThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkAuthStatusThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.authenticated = true;
        state.user = action.payload;
        state.authChecked = true;
        state.error = null;
      })
      .addCase(checkAuthStatusThunk.rejected, (state, action) => {
        state.loading = false;
        state.authenticated = false;
        state.user = null;
        state.authChecked = true;
        state.error = action.payload?.message || null;
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
        state.authChecked = true;
      })
      .addCase(exchangeCodeThunk.rejected, (state, action) => {
        state.loading = false;
        state.authenticated = false;
        state.user = null;
        state.authChecked = true;
        state.error = action.payload?.message || "Login failed";
      })

      // logout
      .addCase(logoutThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutThunk.fulfilled, (state) => {
        state.loading = false;
        state.authenticated = false;
        state.user = null;
        state.authChecked = true;
      })
      .addCase(logoutThunk.rejected, (state) => {
        state.loading = false;
        state.authenticated = false;
        state.user = null;
        state.authChecked = true;
      });
  },
});

export const { startGithubLoginAction, clearError, setAuthState } = authSlice.actions;
export default authSlice.reducer;


