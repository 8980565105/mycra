
import { createSlice } from "@reduxjs/toolkit";
import { bulkDeleteFestivalOffers, createFestivalOffer, deleteFestivalOffer, fetchFestivalOffers, updateFestivalOffer, updateFestivalOfferStatus } from "./festivalOffersThunk";

export type BannerLinkType =
  | "none"
  | "category"
  | "subcategory"
  | "childcategory"
  | "product"
  | "shop"
  | "custom";

export interface FestivalBanner {
  _id?: string;
  image: string;
  title: string;
  description: string;
  link_type: BannerLinkType;
  link_id: string;
  link_slug: string;
  link_url: string;
}


export interface FestivalOffer {
  _id: string;
  name: string;
  banners: FestivalBanner[];
  description: string;
  display_on: 
    | "shop" 
    | "collection" 
    | "home";
  start_date: string;
  end_date: string;
  status:
    | "active"
    | "inactive";

  createdAt?: string;
  updatedAt?: string;
}

interface FestivaloffersState {
  festivalOffers: FestivalOffer[];
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

      .addCase(updateFestivalOfferStatus.fulfilled, (state, action) => {
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

      .addCase(bulkDeleteFestivalOffers.fulfilled, (state, action) => {
        state.festivalOffers = state.festivalOffers.filter(
          (fo) => !action.payload.includes(fo._id),
        );
        state.total -= action.payload.length;
      }); 
         
  },
});

export default festivalOfferSlice.reducer;
