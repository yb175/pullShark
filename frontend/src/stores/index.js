import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../slice/authSlice";
import repoReducer from "../slice/repoSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    repos: repoReducer,
  },
});