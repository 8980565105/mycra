
import { createSlice } from "@reduxjs/toolkit";
import { createFestivalOffer, deleteFestivalOffer, fetchFestivalOffers, updateFestivalOffer } from "./festivalOffersThunk";

interface Festivaloffer {
  _id: string;
  name: string;
  image: string[];
  description: string;
  start_date: string;
  end_date: string;
  createdAt?: string;
  updatedAt?: string;
}

interface FestivaloffersState {
  festivalOffers: Festivaloffer[];
  total: number;
  loading: boolean;
  error: string | null;
}

const initialState: FestivaloffersState = {
  festivalOffers: [],
  total: 0,
  loading: false,
  error: null,
};

const festivalOfferSlice = createSlice({
  name: "festivalOffers",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFestivalOffers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFestivalOffers.fulfilled, (state, action) => {
        state.loading = false;
        state.festivalOffers = action.payload?.offers || [];
        state.total = action.payload?.total || 0;
      })
      .addCase(fetchFestivalOffers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(createFestivalOffer.fulfilled, (state, action) => {
        state.festivalOffers.unshift(action.payload);
        state.total += 1;
      })

      .addCase(updateFestivalOffer.fulfilled, (state, action) => {
        const index = state.festivalOffers.findIndex(
          (f) => f._id === action.payload._id,
        );
        if (index !== -1) {
          state.festivalOffers[index] = action.payload;
        }
      })

      .addCase(deleteFestivalOffer.fulfilled, (state, action) => {
        state.festivalOffers = state.festivalOffers.filter((fo) => fo._id !== action.payload);
        state.total -= 1;
      })

         
  },
});

export default festivalOfferSlice.reducer;
