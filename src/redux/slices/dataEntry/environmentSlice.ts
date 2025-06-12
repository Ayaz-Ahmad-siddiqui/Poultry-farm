import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "../../../API/axiosInstance";

interface Environment {
  id: number;
  collection_date: string;
  temperature: number;
  humidity: number;
  collection_time: string;
}

interface EnvironmentState {
  environments: Environment[];
  loading: boolean;
  error: string | null;
  createSuccess: boolean;
  updateSuccess: boolean;
  deleteSuccess: boolean;
}

const initialState: EnvironmentState = {
  environments: [],
  loading: false,
  error: null,
  createSuccess: false,
  updateSuccess: false,
  deleteSuccess: false,
};

// Async Thunks for Environment
export const createEnvironment = createAsyncThunk(
  "environment/create",
  async (envData: Omit<Environment, "id">, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/environment", envData);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to create environment entry.";
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchEnvironments = createAsyncThunk(
  "environment/findAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/environment");
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to fetch environment data.";
      return rejectWithValue(errorMessage);
    }
  }
);

export const updateEnvironment = createAsyncThunk(
  "environment/update",
  async ({ id, envData }: { id: number; envData: Partial<Environment> }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/environment/${id}`, envData);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to update environment entry.";
      return rejectWithValue(errorMessage);
    }
  }
);

export const deleteEnvironment = createAsyncThunk(
  "environment/delete",
  async (id: number, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/environment/${id}`);
      return id; // Return the ID of the deleted item
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to delete environment entry.";
      return rejectWithValue(errorMessage);
    }
  }
);

const environmentSlice = createSlice({
  name: "environment",
  initialState,
  reducers: {
    clearEnvironmentStatus: (state) => {
      state.createSuccess = false;
      state.updateSuccess = false;
      state.deleteSuccess = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create
      .addCase(createEnvironment.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.createSuccess = false;
      })
      .addCase(createEnvironment.fulfilled, (state, action: PayloadAction<Environment>) => {
        state.loading = false;
        state.environments.push(action.payload);
        state.createSuccess = true;
      })
      .addCase(createEnvironment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.createSuccess = false;
      })
      // Fetch All
      .addCase(fetchEnvironments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEnvironments.fulfilled, (state, action: PayloadAction<Environment[]>) => {
        state.loading = false;
        state.environments = action.payload;
      })
      .addCase(fetchEnvironments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update
      .addCase(updateEnvironment.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.updateSuccess = false;
      })
      .addCase(updateEnvironment.fulfilled, (state, action: PayloadAction<Environment>) => {
        state.loading = false;
        const index = state.environments.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) {
          state.environments[index] = action.payload;
        }
        state.updateSuccess = true;
      })
      .addCase(updateEnvironment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.updateSuccess = false;
      })
      // Delete
      .addCase(deleteEnvironment.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.deleteSuccess = false;
      })
      .addCase(deleteEnvironment.fulfilled, (state, action: PayloadAction<number>) => {
        state.loading = false;
        state.environments = state.environments.filter((item) => item.id !== action.payload);
        state.deleteSuccess = true;
      })
      .addCase(deleteEnvironment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.deleteSuccess = false;
      });
  },
});

export const { clearEnvironmentStatus } = environmentSlice.actions;
export default environmentSlice.reducer;