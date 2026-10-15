import { createSlice } from "@reduxjs/toolkit";
import { getGiftCardProducts, getMyGiftCards, purchaseGiftCard } from "./giftCardThunk";

const initialState = {
  giftCards: [],
  purchaseProducts: [],
  loading: false,
  error: null,
   purchaseLoading: false,
  purchaseError: null,
  purchaseResult: null,
  giftCardBalance: 0,
  myGiftCardsLoading: false,
  myGiftCardsError: null,
};

const giftCardSlice = createSlice({
  name: "giftCards",
  initialState,
  reducers: {
    clearPurchaseState: (state) => {
      state.purchaseError = null;
      state.purchaseResult = null;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(getMyGiftCards.pending, (state) => {
        state.myGiftCardsLoading = true;
        state.myGiftCardsError = null;
      })
      .addCase(getMyGiftCards.fulfilled, (state, action) => {
        state.myGiftCardsLoading = false;
        state.giftCards = action.payload?.giftCards || [];
        state.giftCardBalance = Number(
          action.payload?.giftCardBalance ??
          action.payload?.wallet?.giftCardBalance ??
          0
        );

        state.myGiftCardsError = null;
      })
      .addCase(getMyGiftCards.rejected, (state, action) => {
        state.myGiftCardsLoading = false;
        state.giftCardBalance = 0;
        state.myGiftCardsError = action.payload || "Unable to fetch your Gift Cards.";
      })
      
        .addCase(purchaseGiftCard.fulfilled, (state, action) => {
          state.purchaseLoading = false;
          state.purchaseResult = action.payload;
        })

        .addCase(getGiftCardProducts.fulfilled, (state, action) => {
          state.productsLoading = false;
          state.purchaseProducts = action.payload;
        });
  },
});

export default giftCardSlice.reducer;