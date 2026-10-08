import { createSlice } from "@reduxjs/toolkit";
import { fetchFestivalOffers } from "./FestivalOfferThunk";

const initialState = {
  items: [],
  loading: false,
  error: null,
};

const FestivalOfferSlice = createSlice({
  name: "festivalOffers",
  initialState,
  reducers: {
    clearFestivalOffers(state) {
      state.items = [];
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchFestivalOffers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchFestivalOffers.fulfilled, (state, action) => {
        state.loading = false;
        state.items = Array.isArray(action.payload) ? action.payload : [];
      })

      .addCase(fetchFestivalOffers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch festival offers";
      });
  },
});

export const { clearFestivalOffers } = FestivalOfferSlice.actions;

export default FestivalOfferSlice.reducer;