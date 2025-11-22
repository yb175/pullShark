import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../slice/authSlice";

export const auth = configureStore({
  reducer: {
    auth: authReducer,
  },
});