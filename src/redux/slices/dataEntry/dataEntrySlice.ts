// src/redux/slices/dataEntry/dataEntrySlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "../../../API/axiosInstance"; // Adjust path as needed
import { format } from "date-fns"; // To format the date

// Define interfaces for each data type
interface FeedUsageData {
  feed_date: string; // YYYY-MM-DD
  feed_type: string;
  qty: number;
  time_of_feeding: string; // HH:MM:SS
  notes?: string;
}

interface MortalityData {
  mortality_date: string; // YYYY-MM-DD
  no_of_deaths: number;
  cause_of_death?: string;
  location_farm?: string;
}

interface EggProductionData {
  collection_date: string; // YYYY-MM-DD
  total_eggs: number;
  broken_eggs?: number;
  collection_time: string; // HH:MM:SS
  notes?: string;
}

interface EnvironmentData {
  collection_date: string; // YYYY-MM-DD
  temperature: number;
  humidity: number;
  collection_time: string; // HH:MM:SS
}

// Define the state for the data entry slice
interface DataEntryState {
  loading: boolean;
  error: string | null;
  success: boolean;
  message: string | null;
}

const initialState: DataEntryState = {
  loading: false,
  error: null,
  success: false,
  message: null,
};

// Async Thunk for creating Feed Usage record
export const createFeedUsage = createAsyncThunk(
  "dataEntry/createFeedUsage",
  async (data: FeedUsageData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/feed-usage", data);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to save feed data.";
      return rejectWithValue(errorMessage);
    }
  }
);

// Async Thunk for creating Mortality record
export const createMortality = createAsyncThunk(
  "dataEntry/createMortality",
  async (data: MortalityData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/mortality-rate", data);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to save mortality data.";
      return rejectWithValue(errorMessage);
    }
  }
);

// Async Thunk for creating Egg Production record
export const createEggProduction = createAsyncThunk(
  "dataEntry/createEggProduction",
  async (data: EggProductionData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/egg-production", data);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to save egg production data.";
      return rejectWithValue(errorMessage);
    }
  }
);

// Async Thunk for creating Environment record
export const createEnvironment = createAsyncThunk(
  "dataEntry/createEnvironment",
  async (data: EnvironmentData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/environment", data);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to save environment data.";
      return rejectWithValue(errorMessage);
    }
  }
);

const dataEntrySlice = createSlice({
  name: "dataEntry",
  initialState,
  reducers: {
    clearDataEntryStatus: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    // Feed Usage
    builder
      .addCase(createFeedUsage.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
        state.message = null;
      })
      .addCase(createFeedUsage.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
        state.message = "Feed data saved successfully!";
      })
      .addCase(createFeedUsage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.success = false;
      })
      // Mortality
      .addCase(createMortality.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
        state.message = null;
      })
      .addCase(createMortality.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
        state.message = "Mortality data saved successfully!";
      })
      .addCase(createMortality.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.success = false;
      })
      // Egg Production
      .addCase(createEggProduction.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
        state.message = null;
      })
      .addCase(createEggProduction.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
        state.message = "Egg production data saved successfully!";
      })
      .addCase(createEggProduction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.success = false;
      })
      // Environment
      .addCase(createEnvironment.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
        state.message = null;
      })
      .addCase(createEnvironment.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
        state.message = "Environment data saved successfully!";
      })
      .addCase(createEnvironment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.success = false;
      });
  },
});

export const { clearDataEntryStatus } = dataEntrySlice.actions;
export default dataEntrySlice.reducer;