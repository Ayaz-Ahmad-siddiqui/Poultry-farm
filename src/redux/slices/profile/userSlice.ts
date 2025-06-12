// src/redux/slices/profile/userSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "../../../API/axiosInstance"; // Adjust path as needed

// Define the shape of your user profile data
interface UserProfile {
  id: number;
  name: string;
  email: string;
  phoneNo?: string;
  position?: string;
  avatar?: string; // Assuming you might have an avatar URL
}

// Define the shape of the profile state
interface UserProfileState {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  updateSuccess: boolean;
  passwordChangeSuccess: boolean;
  EmailChangeSuccess: boolean;
}

const initialState: UserProfileState = {
  profile: null,
  loading: false,
  error: null,
  updateSuccess: false,
  passwordChangeSuccess: false,
  EmailChangeSuccess: false,
};

// Async Thunk to fetch user profile
export const fetchUserProfile = createAsyncThunk(
  "user/fetchUserProfile",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/users/me");
      return response.data; // Assuming the API returns the user profile directly
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to fetch profile.";
      return rejectWithValue(errorMessage);
    }
  }
);

// Async Thunk to update user profile
export const updateUserProfile = createAsyncThunk(
  "user/updateUserProfile",
  async (profileData: { name?: string; phoneNo?: string; position?: string }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put("/users/update", profileData);
      return response.data; // Assuming the API returns the updated user profile
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to update profile.";
      return rejectWithValue(errorMessage);
    }
  }
);

// Async Thunk to change user password
export const changeUserPassword = createAsyncThunk(
  "user/changeUserPassword",
  async ({ oldPassword, newPassword }: { oldPassword: string; newPassword: string }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put("/users/change-password", { oldPassword, newPassword });
      return response.data; // Assuming the API returns a success message or confirmation
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to change password.";
      return rejectWithValue(errorMessage);
    }
  }
);

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    clearProfileError: (state) => {
      state.error = null;
    },
    clearUpdateSuccess: (state) => {
      state.updateSuccess = false;
    },
    clearPasswordChangeSuccess: (state) => {
      state.passwordChangeSuccess = false;
    },
    // Action to manually set profile (e.g., from login if needed, though fetch is preferred)
    setProfile: (state, action: PayloadAction<UserProfile>) => {
      state.profile = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch User Profile
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action: PayloadAction<UserProfile>) => {
        state.loading = false;
        state.profile = action.payload;
        state.error = null;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.profile = null; // Clear profile on error
        state.error = action.payload as string;
      })
      // Update User Profile
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.updateSuccess = false;
      })
      .addCase(updateUserProfile.fulfilled, (state, action: PayloadAction<UserProfile>) => {
        state.loading = false;
        state.profile = action.payload; // Update profile with new data
        state.updateSuccess = true;
        state.error = null;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.updateSuccess = false;
        state.error = action.payload as string;
      })
      // Change User Password
      .addCase(changeUserPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.passwordChangeSuccess = false;
      })
      .addCase(changeUserPassword.fulfilled, (state) => {
        state.loading = false;
        state.passwordChangeSuccess = true;
        state.error = null;
      })
      .addCase(changeUserPassword.rejected, (state, action) => {
        state.loading = false;
        state.passwordChangeSuccess = false;
        state.error = action.payload as string;
      });
     
  },
});

export const { clearProfileError, clearUpdateSuccess, clearPasswordChangeSuccess, setProfile } = userSlice.actions;
export default userSlice.reducer;