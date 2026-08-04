import { createSlice } from "@reduxjs/toolkit";
import {
  fetchBusinesses,
  createBusiness,
  updateBusiness,
  deleteBusiness,
  bulkDeleteBusinesses,
  updateBusinessStatus,
  fetchActiveBusinesses,
} from "./businessThunk";

interface Business {
  _id: string;
  name: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface BusinessState {
  businesses: Business[];
  total: number;
  loading: boolean;
  error: string | null;
}

const initialState: BusinessState = {
  businesses: [],
  total: 0,
  loading: false,
  error: null,
};

const businessSlice = createSlice({
  name: "business",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBusinesses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBusinesses.fulfilled, (state, action) => {
        state.loading = false;
        state.businesses = action.payload.businesses;
        state.total = action.payload.total;
      })
      .addCase(fetchBusinesses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createBusiness.fulfilled, (state, action) => {
        state.businesses.unshift(action.payload);
        state.total += 1;
      })
      .addCase(updateBusiness.fulfilled, (state, action) => {
        const index = state.businesses.findIndex(
          (b) => b._id === action.payload._id,
        );
        if (index !== -1) state.businesses[index] = action.payload;
      })
      .addCase(updateBusinessStatus.fulfilled, (state, action) => {
        const index = state.businesses.findIndex(
          (b) => b._id === action.payload._id,
        );
        if (index !== -1) {
          state.businesses[index] = action.payload;
        }
      })
      .addCase(deleteBusiness.fulfilled, (state, action) => {
        state.businesses = state.businesses.filter(
          (b) => b._id !== action.payload,
        );
        state.total -= 1;
      })
      .addCase(bulkDeleteBusinesses.fulfilled, (state, action) => {
        state.businesses = state.businesses.filter(
          (b) => !action.payload.includes(b._id),
        );
        state.total -= action.payload.length;
      })
      .addCase(fetchActiveBusinesses.fulfilled, (state, action) => {
        state.businesses = action.payload;
      });
  },
});

export default businessSlice.reducer;
