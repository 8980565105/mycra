import { createSlice } from "@reduxjs/toolkit";
import {
  fetchWallet,
  addMoneyToWallet,
  verifyKyc,
  fetchAllWallets,
  adminAdjustBalance,
  adminVerifyKyc,
} from "./walletThunk";

const initialState = {
  wallet: null,
  loading: false,
  error: null,

  // admin
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
      // fetch balance
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
        state.error = action.payload;
      })

      // add money
      .addCase(addMoneyToWallet.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addMoneyToWallet.fulfilled, (state, action) => {
        state.loading = false;
        state.wallet = action.payload.wallet;
      })
      .addCase(addMoneyToWallet.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // verify kyc (self)
      .addCase(verifyKyc.fulfilled, (state, action) => {
        state.wallet = action.payload;
      })

      // admin - fetch all wallets
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
        state.adminError = action.payload;
      })

      // admin - adjust balance
      .addCase(adminAdjustBalance.fulfilled, (state, action) => {
        const updatedWallet = action.payload.wallet;
        const idx = state.adminWallets.findIndex(
          (w) => w._id === updatedWallet._id,
        );
        if (idx !== -1) state.adminWallets[idx] = updatedWallet;
      })

      // admin - verify kyc
      .addCase(adminVerifyKyc.fulfilled, (state, action) => {
        const updatedWallet = action.payload;
        const idx = state.adminWallets.findIndex(
          (w) => w._id === updatedWallet._id,
        );
        if (idx !== -1) state.adminWallets[idx] = updatedWallet;
      });
  },
});

export const { clearWalletError } = walletSlice.actions;
export default walletSlice.reducer;
