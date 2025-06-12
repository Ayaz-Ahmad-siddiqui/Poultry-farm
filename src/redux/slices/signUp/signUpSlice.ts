// src/redux/slices/signUp/signUpSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "../../../API/axiosInstance";

// Define the shape of your signup state
interface SignUpState {
  loading: boolean;
  error: string | null;
  success: boolean;
}

const initialState: SignUpState = {
  loading: false,
  error: null,
  success: false,
};

// Async Thunk for User SignUp
export const signupUser = createAsyncThunk(
  "auth/signupUser",
  async ({ name, email, password }: { name: string; email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/auth/signup", { name, email, password });
      return response.data; // Assuming your API returns some success message or user data
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Signup failed. Please try again.";
      return rejectWithValue(errorMessage);
    }
  }
);

const signUpSlice = createSlice({
  name: "signUp",
  initialState,
  reducers: {
    // Action to clear any signup errors
    clearSignUpError: (state) => {
      state.error = null;
    },
    // Action to reset signup state
    resetSignUpState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(signupUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(signupUser.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
        state.error = null;
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.success = false;
      });
  },
});

export const { clearSignUpError, resetSignUpState } = signUpSlice.actions;
export default signUpSlice.reducer;