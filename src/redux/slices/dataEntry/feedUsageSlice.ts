import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "../../../API/axiosInstance";

interface FeedUsage {
  id: number;
  feed_date: string;
  feed_type: string;
  qty: number;
  time_of_feeding: string;
  notes?: string;
}

interface FeedUsageState {
  feedUsages: FeedUsage[];
  loading: boolean;
  error: string | null;
  createSuccess: boolean;
  updateSuccess: boolean;
  deleteSuccess: boolean;
}

const initialState: FeedUsageState = {
  feedUsages: [],
  loading: false,
  error: null,
  createSuccess: false,
  updateSuccess: false,
  deleteSuccess: false,
};

// Async Thunks for Feed Usage
export const createFeedUsage = createAsyncThunk(
  "feedUsage/create",
  async (feedData: Omit<FeedUsage, "id">, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/feed-usage", feedData);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to create feed usage.";
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchFeedUsages = createAsyncThunk(
  "feedUsage/findAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/feed-usage");
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to fetch feed usages.";
      return rejectWithValue(errorMessage);
    }
  }
);

export const updateFeedUsage = createAsyncThunk(
  "feedUsage/update",
  async ({ id, feedData }: { id: number; feedData: Partial<FeedUsage> }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/feed-usage/${id}`, feedData);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to update feed usage.";
      return rejectWithValue(errorMessage);
    }
  }
);

export const deleteFeedUsage = createAsyncThunk(
  "feedUsage/delete",
  async (id: number, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/feed-usage/${id}`);
      return id; // Return the ID of the deleted item
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to delete feed usage.";
      return rejectWithValue(errorMessage);
    }
  }
);

const feedUsageSlice = createSlice({
  name: "feedUsage",
  initialState,
  reducers: {
    clearFeedUsageStatus: (state) => {
      state.createSuccess = false;
      state.updateSuccess = false;
      state.deleteSuccess = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create
      .addCase(createFeedUsage.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.createSuccess = false;
      })
      .addCase(createFeedUsage.fulfilled, (state, action: PayloadAction<FeedUsage>) => {
        state.loading = false;
        state.feedUsages.push(action.payload);
        state.createSuccess = true;
      })
      .addCase(createFeedUsage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.createSuccess = false;
      })
      // Fetch All
      .addCase(fetchFeedUsages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFeedUsages.fulfilled, (state, action: PayloadAction<FeedUsage[]>) => {
        state.loading = false;
        state.feedUsages = action.payload;
      })
      .addCase(fetchFeedUsages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update
      .addCase(updateFeedUsage.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.updateSuccess = false;
      })
      .addCase(updateFeedUsage.fulfilled, (state, action: PayloadAction<FeedUsage>) => {
        state.loading = false;
        const index = state.feedUsages.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) {
          state.feedUsages[index] = action.payload;
        }
        state.updateSuccess = true;
      })
      .addCase(updateFeedUsage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.updateSuccess = false;
      })
      // Delete
      .addCase(deleteFeedUsage.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.deleteSuccess = false;
      })
      .addCase(deleteFeedUsage.fulfilled, (state, action: PayloadAction<number>) => {
        state.loading = false;
        state.feedUsages = state.feedUsages.filter((item) => item.id !== action.payload);
        state.deleteSuccess = true;
      })
      .addCase(deleteFeedUsage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.deleteSuccess = false;
      });
  },
});

export const { clearFeedUsageStatus } = feedUsageSlice.actions;
export default feedUsageSlice.reducer;