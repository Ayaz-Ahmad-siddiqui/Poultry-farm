import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../../API/axiosInstance";

export const fetchMetrics = createAsyncThunk(
  "metrics/fetchMetrics",
  async () => {
    const [feedUsage, eggProduction, environment, mortality] =
      await Promise.all([
        axios.get("/feed-usage"),
        axios.get("/egg-production"),
        axios.get("/environment"),
        axios.get("/mortality-rate"),
      ]);

    return {
      feedUsage: feedUsage.data,
      eggProduction: eggProduction.data,
      environment: environment.data,
      mortality: mortality.data,
    };
  }
);

const metricsSlice = createSlice({
  name: "metrics",
  initialState: {
    loading: false,
    error: null,
    data: null as any,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMetrics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMetrics.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchMetrics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch metrics";
      });
  },
});

export default metricsSlice.reducer;
