import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../api/auth";

export const fetchReposThunk = createAsyncThunk(
  "repos/fetch",
  async ({ page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const res = await api.get(`/repos?page=${page}&limit=${limit}`, {
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
      .addCase(fetchReposThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchReposThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.repos = action.payload.repos || [];

        // Pagination
        state.pagination = {
          page: action.payload.pagination?.page || 1,
          hasNextPage: action.payload.pagination?.hasNextPage || false,
          hasPrevPage: action.payload.pagination?.hasPrevPage || false,
        };
      })

      .addCase(fetchReposThunk.rejected, (state, action) => {
        state.loading = false;
        state.repos = [];
        state.error = action.payload?.message || "Failed to fetch repos";
      });
  },
});

export const { changePage } = repoSlice.actions;
export default repoSlice.reducer;