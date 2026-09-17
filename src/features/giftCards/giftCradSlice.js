import { createSlice } from "@reduxjs/toolkit";
import { getMyGiftCards } from "./giftCardThunk";

const initialState = {
  giftCards: [],

  loading: false,
  error: null,
};

const giftCardSlice = createSlice({
  name: "giftCards",
  initialState,
  reducers: {},

  extraReducers: (builder) => {
    builder
      .addCase(getMyGiftCards.pending, (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addCase(getMyGiftCards.fulfilled, (state, action) => {
          state.loading = false;
          state.giftCards = action.payload.giftCards || [];
        }
      )
      .addCase(getMyGiftCards.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload || "Failed to fetch gift cards";
        }
      );
  },
});

export default giftCardSlice.reducer;