import { createSlice } from "@reduxjs/toolkit";
import {
  addMoneyToWallet,
  adminAdjustBalance,
  adminVerifyKyc,
  fetchAllWallets,
  fetchWallet,
  verifyKyc,
  verifyOtp,
} from "./walletsThunk";

interface WalletState {
  wallet: any | null;
  loading: boolean;
  error: string | null;

  adminWallets: any[];
  adminTotal: number;
  adminPage: number;
  adminTotalPages: number;
  adminLoading: boolean;
  adminError: string | null;
}

const initialState: WalletState = {
  wallet: null,
  loading: false,
  error: null,

  adminWallets: [],
  adminTotal: 0,
  adminPage: 1,
  adminTotalPages: 1,
  adminLoading: false,
  adminError: null,
};

const walletSlice = createSlice({
  name: "wallet",
  initialState,
  reducers: {
    clearWalletError: (state) => {
      state.error = null;
      state.adminError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWallet.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWallet.fulfilled, (state, action) => {
        state.loading = false;
        state.wallet = action.payload;
      })
      .addCase(fetchWallet.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(addMoneyToWallet.fulfilled, (state, action) => {
        state.wallet = action.payload.wallet;
      })

      .addCase(verifyKyc.fulfilled, (state, action) => {
        state.wallet = action.payload;
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.wallet = action.payload.wallet || action.payload;
      })

      .addCase(fetchAllWallets.pending, (state) => {
        state.adminLoading = true;
        state.adminError = null;
      })
      .addCase(fetchAllWallets.fulfilled, (state, action) => {
        state.adminLoading = false;
        state.adminWallets = action.payload.wallets;
        state.adminTotal = action.payload.total;
        state.adminPage = action.payload.page;
        state.adminTotalPages = action.payload.totalPages;
      })
      .addCase(fetchAllWallets.rejected, (state, action) => {
        state.adminLoading = false;
        state.adminError = action.payload as string;
      })

      .addCase(adminAdjustBalance.fulfilled, (state, action) => {
        const updated = action.payload.wallet;
        const idx = state.adminWallets.findIndex((w) => w._id === updated._id);
        if (idx !== -1) state.adminWallets[idx] = updated;
      })

      .addCase(adminVerifyKyc.fulfilled, (state, action) => {
        const updated = action.payload;
        const idx = state.adminWallets.findIndex((w) => w._id === updated._id);
        if (idx !== -1) state.adminWallets[idx] = updated;
      });
  },
});

export const { clearWalletError } = walletSlice.actions;
export default walletSlice.reducer;
