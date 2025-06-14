import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "../../../API/axiosInstance"; 

interface Settings {
  id: number | string ; // Changed to number to match UserProfile.id
  farmName: string;
  farmLocation: string;
  farmSize: number;
  numOfBirds: number;
  emailNotification: boolean;
  smsNotification: boolean;
  pushNotification: boolean;
  measuringUnit: string;
  dataRetentionPeriod: string;
}


interface SettingsState {
  settings: Settings | null;
  loading: boolean;
  error: string | null;
  updateSuccess: boolean;
}

const initialState: SettingsState = {
  settings: null,
  loading: false,
  error: null,
  updateSuccess: false,
};

// Async Thunk to fetch settings
export const fetchSettings = createAsyncThunk(
  "settings/fetchSettings",
  async (userId: number, { rejectWithValue }) => { // Expect userId as number
    console.log("Fetching settings for ID:", userId);
    try {
      const response = await axiosInstance.get(`/settings/${userId}`); // Use userId in the URL
      return response.data; // Assuming the API returns the settings directly
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to fetch settings.";
      return rejectWithValue(errorMessage);
    }
  }
);

// Async Thunk to update settings
export const updateSettings = createAsyncThunk(
  "settings/updateSettings",
  async (
    settingsData: {
      id: number; // Expect id (which is userId) as number
      farmName?: string;
      farmLocation?: string;
      farmSize?: number;
      numOfBirds?: number;
      emailNotification?: boolean;
      smsNotification?: boolean;
      pushNotification?: boolean;
      measuringUnit?: string;
      dataRetentionPeriod?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const { id, ...dataToUpdate } = settingsData;
      console.log("Updating settings for ID:", id);
      const response = await axiosInstance.put(`/settings/${id}`, dataToUpdate); // Use id (userId) in the URL
      return response.data; // Assuming the API returns the updated settings
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to update settings.";
      return rejectWithValue(errorMessage);
    }
  }
);

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    clearSettingsError: (state) => {
      state.error = null;
    },
    clearUpdateSuccess: (state) => {
      state.updateSuccess = false;
    },
    // Action to manually set settings (if needed)
    setSettings: (state, action: PayloadAction<Settings>) => {
      state.settings = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Settings
      .addCase(fetchSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSettings.fulfilled, (state, action: PayloadAction<Settings>) => {
        state.loading = false;
        state.settings = action.payload;
        state.error = null;
      })
      .addCase(fetchSettings.rejected, (state, action) => {
        state.loading = false;
        state.settings = null; // Clear settings on error
        state.error = action.payload as string;
      })
      // Update Settings
      .addCase(updateSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.updateSuccess = false;
      })
      .addCase(updateSettings.fulfilled, (state, action: PayloadAction<Settings>) => {
        state.loading = false;
        state.settings = action.payload; // Update settings with new data
        state.updateSuccess = true;
        state.error = null;
      })
      .addCase(updateSettings.rejected, (state, action) => {
        state.loading = false;
        state.updateSuccess = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearSettingsError, clearUpdateSuccess, setSettings } = settingsSlice.actions;
export default settingsSlice.reducer;
