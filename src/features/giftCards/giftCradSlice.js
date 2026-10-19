import { createSlice } from "@reduxjs/toolkit";
import { getGiftCardProducts, getMyGiftCards, purchaseGiftCard, validateGiftCard } from "./giftCardThunk";

const initialState = {
  giftCards: [],
  purchaseProducts: [],
  appliedGiftCard: null,
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
    removeAppliedGiftCard: (state) => {
      state.appliedGiftCard = null;
      state.error = null;
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
        })
        .addCase(validateGiftCard.pending, (state) => {
          state.loading = true;
          state.error = null;
        })

        .addCase(validateGiftCard.fulfilled, (state, action) => {
          state.loading = false;
          state.appliedGiftCard = action.payload?.data?.giftCard || null;
          state.error = null;
        })

        .addCase(validateGiftCard.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload || "Gift card validation failed";
        });
  },
});

export const { removeAppliedGiftCard, clearPurchaseState} = giftCardSlice.actions;

export default giftCardSlice.reducer;