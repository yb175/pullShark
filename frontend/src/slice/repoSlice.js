import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../api/auth";

export const fetchReposThunk = createAsyncThunk(
  "repos/fetch",
  async ({ page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const res = await api.get(`/auth/repos?page=${page}&limit=${limit}`, {
        withCredentials: true,
      });
      return res.data;  // { success, repos, pagination }
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "Failed to fetch repos" });
    }
  }
);

const repoSlice = createSlice({
  name: "repos",
  initialState: {
    repos: [],
    loading: false,
    error: null,
    pagination: {
      page: 1,
      hasNextPage: false,
      hasPrevPage: false,
    },
  },

  reducers: {
    changePage: (state, action) => {
      state.pagination.page = action.payload;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchReposThunk.fulfilled, (state, action) => {
  state.loading = false;

  // Update repos only when changed
  state.repos = action.payload.repos || [];

  // Mutate existing pagination object (do NOT replace it)
  const p = action.payload.pagination || {};
  state.pagination.page = p.page ?? state.pagination.page;
  state.pagination.hasNextPage = p.hasNextPage ?? state.pagination.hasNextPage;
  state.pagination.hasPrevPage = p.hasPrevPage ?? state.pagination.hasPrevPage;
})

.addCase(fetchReposThunk.rejected, (state, action) => {
  state.loading = false;
  state.error = action.payload?.message || "Failed to fetch repos";
  // DO NOT replace repos or pagination
});
  },
});

export const { changePage } = repoSlice.actions;
export default repoSlice.reducer;