import { createSlice } from "@reduxjs/toolkit";
import { bulkDeleteTransactions, deleteTransaction, fetchAllTransactionsAdmin, updateAdminTransactionStatus, } from "./transectionThunk";

interface TransectionState {
  adminTransactions: any[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;

  summary: {
    totalTransactions: number;
    successCount: number;
    pendingCount: number;
    failedCount: number;
    successAmount: number;
    pendingAmount: number;
    failedAmount: number;
  };

  loading: boolean;
  updating: boolean;
  error: string | null;
}

const initialState: TransectionState = {
  adminTransactions: [],
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 0,

  summary: {
    totalTransactions: 0,
    successCount: 0,
    pendingCount: 0,
    failedCount: 0,
    successAmount: 0,
    pendingAmount: 0,
    failedAmount: 0,
  },

  loading: false,
  updating: false,
  error: null,
};


const transectionSlice = createSlice({
  name: "transection",
  initialState,

  reducers: {
    clearAdminTransactions: (state) => {
      state.adminTransactions = [];
      state.total = 0;
      state.page = 1;
      state.totalPages = 0;
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder

      .addCase(fetchAllTransactionsAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchAllTransactionsAdmin.fulfilled, (state, action) => {
        state.loading = false;

        state.adminTransactions = action.payload?.transactions || [];

        state.total = action.payload?.total || 0;
        state.page = action.payload?.page || 1;
        state.limit = action.payload?.limit || 10;
        state.totalPages = action.payload?.totalPages || 0;

        state.summary = {
          ...state.summary,
          ...(action.payload?.summary || {}),
        };
      })

      .addCase(fetchAllTransactionsAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error =
            typeof action.payload === "string"
            ? action.payload
            : action.error.message || "Failed to fetch transactions";
      })

      .addCase(updateAdminTransactionStatus.pending, (state) => {
        state.updating = true;
        state.error = null;
      })

      .addCase(updateAdminTransactionStatus.fulfilled, (state, action) => {
        state.updating = false;

        const updatedTransaction = action.payload?.transaction || action.payload;

        if (!updatedTransaction?._id) return;

        state.adminTransactions = state.adminTransactions.map(
          (item: any) => item._id === updatedTransaction._id
              ? updatedTransaction
              : item
        );
      })

      .addCase(updateAdminTransactionStatus.rejected, (state, action) => {
        state.updating = false;
        state.error =
          typeof action.payload === "string"
            ? action.payload
            : action.error.message || "Status update failed";
      })

      .addCase(deleteTransaction.fulfilled, (state, action) => {
        state.adminTransactions = state.adminTransactions.filter(
            (c) => c._id !== action.payload,
        );
        state.total -= 1;
      })
      .addCase(bulkDeleteTransactions.fulfilled, (state, action) => {
        state.adminTransactions = state.adminTransactions.filter(
            (c) => !action.payload.includes(c._id),
        );
        state.total -= action.payload.length;
      });
  },
});

export const {
  clearAdminTransactions,
} = transectionSlice.actions;

export default transectionSlice.reducer;
