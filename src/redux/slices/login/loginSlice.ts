// src/redux/slices/login/loginSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "../../../API/axiosInstance"; // Correct path to axiosInstance

interface User {
  id: string;
  email: string;
  name: string;
  // Add other user properties as per your API response
}

interface AuthState {
  user: User | null;
  token: string | null; // This is the access token
  refreshToken: string | null; // Add refresh token to state
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('accessToken'),
  refreshToken: localStorage.getItem('refreshToken'), // Initialize refresh token
  isAuthenticated: !!localStorage.getItem('accessToken'),
  loading: false,
  error: null,
};

// Async Thunk for User Login
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/auth/signin", { email, password });
      const { accessToken, refreshToken, user } = response.data;

      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);

      return { user, token: accessToken, refreshToken }; // Return refresh token as well
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Login failed. Please check your credentials.";
      return rejectWithValue(errorMessage);
    }
  }
);

// New Async Thunk for Refreshing Token
export const refreshAuthToken = createAsyncThunk(
  "auth/refreshToken",
  async (_, { getState, rejectWithValue }) => {
    const state = getState() as { auth: AuthState }; // Cast to RootState if necessary, or just extract auth slice
    const currentRefreshToken = state.auth.refreshToken;

    if (!currentRefreshToken) {
      return rejectWithValue("No refresh token available.");
    }

    try {
      // Postman shows refreshToken in body
      const response = await axiosInstance.post("/auth/refresh-token", { refreshToken: currentRefreshToken });
      const { accessToken, refreshToken: newRefreshToken, user } = response.data; // API should return new tokens and user

      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", newRefreshToken);

      return { user, token: accessToken, refreshToken: newRefreshToken };
    } catch (error: any) {
      // If refresh token fails, it often means it's expired or invalid.
      // Invalidate existing tokens and log out.
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      const errorMessage = error.response?.data?.message || "Failed to refresh token. Please log in again.";
      return rejectWithValue(errorMessage);
    }
  }
);

const loginSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null; // Clear refresh token on logout
      state.isAuthenticated = false;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  },
  extraReducers: (builder) => {
    builder
      // Handle login pending state
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      // Handle login fulfilled state
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<{ user: User, token: string, refreshToken: string }>) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken; // Store refresh token
        state.error = null;
      })
      // Handle login rejected state
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.refreshToken = null; // Clear refresh token on login failure
        state.error = action.payload as string;
      })
      // Handle refresh token pending state
      .addCase(refreshAuthToken.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      // Handle refresh token fulfilled state
      .addCase(refreshAuthToken.fulfilled, (state, action: PayloadAction<{ user: User, token: string, refreshToken: string }>) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken; // Store the new refresh token
        state.error = null;
      })
      // Handle refresh token rejected state
      .addCase(refreshAuthToken.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.refreshToken = null; // Clear all tokens on refresh failure, force re-login
        state.error = action.payload as string;
      });
  },
});

export const { clearError, logout } = loginSlice.actions;
export default loginSlice.reducer;