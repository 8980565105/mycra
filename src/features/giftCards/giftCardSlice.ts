import { createSlice } from "@reduxjs/toolkit";

import { adminCreateGiftCard, adminGetAllGiftCards } from "./giftCardThunk";

interface GiftCard {
  _id?: string;
  cardNumber: string;
  pin?: string;
  originalAmount: number;
  remainingBalance: number;
  status: string;
  assignedTo?: string;
  recipientName?: string;
  recipientEmail?: string;
  expiresAt?: string | null;
  source?: string;
  createdAt?: string;
}

interface GiftCardState {
  giftCards: GiftCard[];
  createdGiftCard: GiftCard | null;
  loading: boolean;
  error: string | null;
}

const initialState: GiftCardState = {
  giftCards: [],
  createdGiftCard: null,
  loading: false,
  error: null,
};

const giftCardSlice = createSlice({
  name: "giftCards",
  initialState,
  reducers: {
    clearGiftCardError: (state) => {
      state.error = null;
    },
    clearCreatedGiftCard: (state) => {
      state.createdGiftCard = null;
    },
  },

  extraReducers: (builder) => {
    builder

      .addCase(adminCreateGiftCard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(adminCreateGiftCard.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.createdGiftCard = action.payload.giftCard;
        if (action.payload.giftCard) {
          state.giftCards.unshift(
            action.payload.giftCard
          );
        }
      })
      .addCase(adminCreateGiftCard.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || action.error.message || "Failed to create gift card";
      })

      .addCase(adminGetAllGiftCards.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(adminGetAllGiftCards.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.giftCards = action.payload.giftCards || [];
      })
      .addCase(adminGetAllGiftCards.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || action.error.message || "Failed to fetch gift cards";
      });
  },
});

export const { clearGiftCardError, clearCreatedGiftCard } = giftCardSlice.actions;

export default giftCardSlice.reducer;