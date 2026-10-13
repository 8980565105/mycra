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
          state.loading = true;
          state.error = null;
        }
      )
      .addCase(getMyGiftCards.fulfilled, (state, action) => {
          state.loading = false;
          // state.giftCards = action.payload.giftCards || [];
          state.giftCards = Array.isArray(action.payload.giftCards)
            ? action.payload.giftCards
            : [];

          state.giftCardBalance = Number(
            action.payload.giftCardBalance || 0
          );

          state.error = null;
        }
      )
      .addCase(getMyGiftCards.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload || "Failed to fetch gift cards";
        }
      )
      
        .addCase(purchaseGiftCard.pending, (state) => {
          state.purchaseLoading = true;
          state.purchaseError = null;
          state.purchaseResult = null;
        })
        .addCase(purchaseGiftCard.fulfilled, (state, action) => {
          state.purchaseLoading = false;
          state.purchaseResult = action.payload;
        })
        .addCase(purchaseGiftCard.rejected, (state, action) => {
          state.purchaseLoading = false;
          state.purchaseError =
            action.payload || "Gift card purchase failed";
        })
       .addCase(getGiftCardProducts.pending, (state) => {
          state.productsLoading = true;
          state.productsError = null;
        })
        .addCase(getGiftCardProducts.fulfilled, (state, action) => {
          state.productsLoading = false;
          state.purchaseProducts = action.payload;
        })
        .addCase(getGiftCardProducts.rejected, (state, action) => {
          state.productsLoading = false;
          state.productsError =
            action.payload || "Unable to load Gift Card products.";
        })
  },
});

export default giftCardSlice.reducer;