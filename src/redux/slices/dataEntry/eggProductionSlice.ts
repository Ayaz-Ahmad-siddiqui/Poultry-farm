import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "../../../API/axiosInstance";

interface EggProduction {
  id: number;
  collection_date: string;
  total_eggs: number;
  broken_eggs: number;
  collection_time: string;
  notes?: string;
}

interface EggProductionState {
  eggProductions: EggProduction[];
  loading: boolean;
  error: string | null;
  createSuccess: boolean;
  updateSuccess: boolean;
  deleteSuccess: boolean;
}

const initialState: EggProductionState = {
  eggProductions: [],
  loading: false,
  error: null,
  createSuccess: false,
  updateSuccess: false,
  deleteSuccess: false,
};

// Async Thunks for Egg Production
export const createEggProduction = createAsyncThunk(
  "eggProduction/create",
  async (eggData: Omit<EggProduction, "id">, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/egg-production", eggData);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to create egg production entry.";
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchEggProductions = createAsyncThunk(
  "eggProduction/findAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/egg-production");
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to fetch egg production data.";
      return rejectWithValue(errorMessage);
    }
  }
);

export const updateEggProduction = createAsyncThunk(
  "eggProduction/update",
  async ({ id, eggData }: { id: number; eggData: Partial<EggProduction> }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/egg-production/${id}`, eggData);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to update egg production entry.";
      return rejectWithValue(errorMessage);
    }
  }
);

export const deleteEggProduction = createAsyncThunk(
  "eggProduction/delete",
  async (id: number, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/egg-production/${id}`);
      return id; // Return the ID of the deleted item
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to delete egg production entry.";
      return rejectWithValue(errorMessage);
    }
  }
);

const eggProductionSlice = createSlice({
  name: "eggProduction",
  initialState,
  reducers: {
    clearEggProductionStatus: (state) => {
      state.createSuccess = false;
      state.updateSuccess = false;
      state.deleteSuccess = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create
      .addCase(createEggProduction.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.createSuccess = false;
      })
      .addCase(createEggProduction.fulfilled, (state, action: PayloadAction<EggProduction>) => {
        state.loading = false;
        state.eggProductions.push(action.payload);
        state.createSuccess = true;
      })
      .addCase(createEggProduction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.createSuccess = false;
      })
      // Fetch All
      .addCase(fetchEggProductions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEggProductions.fulfilled, (state, action: PayloadAction<EggProduction[]>) => {
        state.loading = false;
        state.eggProductions = action.payload;
      })
      .addCase(fetchEggProductions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update
      .addCase(updateEggProduction.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.updateSuccess = false;
      })
      .addCase(updateEggProduction.fulfilled, (state, action: PayloadAction<EggProduction>) => {
        state.loading = false;
        const index = state.eggProductions.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) {
          state.eggProductions[index] = action.payload;
        }
        state.updateSuccess = true;
      })
      .addCase(updateEggProduction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.updateSuccess = false;
      })
      // Delete
      .addCase(deleteEggProduction.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.deleteSuccess = false;
      })
      .addCase(deleteEggProduction.fulfilled, (state, action: PayloadAction<number>) => {
        state.loading = false;
        state.eggProductions = state.eggProductions.filter((item) => item.id !== action.payload);
        state.deleteSuccess = true;
      })
      .addCase(deleteEggProduction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.deleteSuccess = false;
      });
  },
});

export const { clearEggProductionStatus } = eggProductionSlice.actions;
export default eggProductionSlice.reducer;