import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { RootState } from "@/redux/store";

// API base URL
const API_URL =  "https://poultry.pixelgateltd.com/settings";
// const API_URL = import.meta.env.VITE_API_URL + "/settings";

// Types
export interface Settings {
  id?: number;
  farmName: string;
  farmLocation: string;
  farmSize: number;
  noOfBirds: number;
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
  created: boolean;
}

// Initial state
const initialState: SettingsState = {
  settings: null,
  loading: false,
  error: null,
  created: false,
};

// Thunks

// Create settings (POST)
export const createSettings = createAsyncThunk<
  Settings,
  Omit<Settings, "id">,
  { rejectValue: string }
>("settings/createSettings", async (data, { rejectWithValue }) => {
  try {
    const response = await axios.post(API_URL, data);
    return response.data;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || "Failed to create settings"
    );
  }
});

// Update settings (PUT)
export const updateSettings = createAsyncThunk<
  Settings,
  Settings,
  { rejectValue: string }
>("settings/updateSettings", async (data, { rejectWithValue }) => {
  try {
    const { id, ...body } = data;
    const response = await axios.put(`${API_URL}/${id}`, body);
    return response.data;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || "Failed to update settings"
    );
  }
});

// Optionally: Fetch settings (GET)
export const fetchSettings = createAsyncThunk<
  Settings,
  number, // Accept id as argument
  { rejectValue: string }
>("settings/fetchSettings", async (id, { rejectWithValue }) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || "Failed to fetch settings"
    );
  }
});

// Slice
const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    resetSettingsState: (state) => {
      state.settings = null;
      state.error = null;
      state.created = false;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    // Create
    builder
      .addCase(createSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.settings = action.payload;
        state.created = true;
        // Store id in localStorage
        if (action.payload.id) {
          localStorage.setItem("settingsId", action.payload.id.toString());
        }
      })
      .addCase(createSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to create settings";
      });

    // Update
    builder
      .addCase(updateSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.settings = action.payload;
      })
      .addCase(updateSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to update settings";
      });

    // Fetch
    builder
      .addCase(fetchSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.settings = action.payload;
      })
      .addCase(fetchSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch settings";
      });
  },
});

export const { resetSettingsState } = settingsSlice.actions;
export default settingsSlice.reducer;
export const selectSettings = (state: RootState) =>
  state.settingsSlice.settings;
export const selectSettingsLoading = (state: RootState) =>
  state.settingsSlice.loading;
export const selectSettingsError = (state: RootState) =>
  state.settingsSlice.error;
