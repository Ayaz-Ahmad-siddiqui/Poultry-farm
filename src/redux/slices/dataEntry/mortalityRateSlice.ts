import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "../../../API/axiosInstance";

export interface MortalityRate { 
  id: number;
  mortality_date: string;
  no_of_deaths: number;
  cause_of_death: string;
  location_farm?: string;
  notes?: string;
}

interface MortalityRateState {
  mortalityRates: MortalityRate[];
  loading: boolean;
  error: string | null;
  createSuccess: boolean;
  updateSuccess: boolean;
  deleteSuccess: boolean;
}

const initialState: MortalityRateState = {
  mortalityRates: [],
  loading: false,
  error: null,
  createSuccess: false,
  updateSuccess: false,
  deleteSuccess: false,
};

// Async Thunks for Mortality Rate
export const createMortalityRate = createAsyncThunk(
  "mortalityRate/create",
  async (mortalityData: Omit<MortalityRate, "id">, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/mortality-rate", mortalityData);
      console.log("Mortality res: ", response, "data:>", response.data);
      
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to create mortality entry.";
      console.log("Mortality res: ", errorMessage);

      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchMortalityRates = createAsyncThunk(
  "mortalityRate/findAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/mortality-rate");
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to fetch mortality data.";
      return rejectWithValue(errorMessage);
    }
  }
);

export const updateMortalityRate = createAsyncThunk(
  "mortalityRate/update",
  async ({ id, mortalityData }: { id: number; mortalityData: Partial<MortalityRate> }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/mortality-rate/${id}`, mortalityData);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to update mortality entry.";
      return rejectWithValue(errorMessage);
    }
  }
);

export const deleteMortalityRate = createAsyncThunk(
  "mortalityRate/delete",
  async (id: number, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/mortality-rate/${id}`);
      return id; // Return the ID of the deleted item
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to delete mortality entry.";
      return rejectWithValue(errorMessage);
    }
  }
);

const mortalityRateSlice = createSlice({
  name: "mortalityRate",
  initialState,
  reducers: {
    clearMortalityRateStatus: (state) => {
      state.createSuccess = false;
      state.updateSuccess = false;
      state.deleteSuccess = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create
      .addCase(createMortalityRate.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.createSuccess = false;
      })
      .addCase(createMortalityRate.fulfilled, (state, action: PayloadAction<MortalityRate>) => {
        state.loading = false;
        state.mortalityRates.push(action.payload);
        state.createSuccess = true;
      })
      .addCase(createMortalityRate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.createSuccess = false;
      })
      // Fetch All
      .addCase(fetchMortalityRates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMortalityRates.fulfilled, (state, action: PayloadAction<MortalityRate[]>) => {
        state.loading = false;
        state.mortalityRates = action.payload;
      })
      .addCase(fetchMortalityRates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update
      .addCase(updateMortalityRate.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.updateSuccess = false;
      })
      .addCase(updateMortalityRate.fulfilled, (state, action: PayloadAction<MortalityRate>) => {
        state.loading = false;
        const index = state.mortalityRates.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) {
          state.mortalityRates[index] = action.payload;
        }
        state.updateSuccess = true;
      })
      .addCase(updateMortalityRate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.updateSuccess = false;
      })
      // Delete
      .addCase(deleteMortalityRate.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.deleteSuccess = false;
      })
      .addCase(deleteMortalityRate.fulfilled, (state, action: PayloadAction<number>) => {
        state.loading = false;
        state.mortalityRates = state.mortalityRates.filter((item) => item.id !== action.payload);
        state.deleteSuccess = true;
      })
      .addCase(deleteMortalityRate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.deleteSuccess = false;
      });
  },
});

export const { clearMortalityRateStatus } = mortalityRateSlice.actions;
export default mortalityRateSlice.reducer;