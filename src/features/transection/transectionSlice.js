import { createSlice } from "@reduxjs/toolkit";
import {
  fetchTransections,
  fetchTransectionById,
  fetchAllTransectionsAdmin,
  updateTransectionStatus,
} from "./transectionThunk";

const initialState = {
  transections: [],
  total: 0,
  page: 1,
  totalPages: 1,
  loading: false,
  error: null,
  selectedTransection: null,
  adminTransections: [],
  adminTotal: 0,
  adminPage: 1,
  adminTotalPages: 1,
  adminLoading: false,
  adminError: null,
};

const transectionSlice = createSlice({
  name: "transection",
  initialState,
  reducers: {
    clearTransectionError: (state) => {
      state.error = null;
      state.adminError = null;
    },
    clearSelectedTransection: (state) => {
      state.selectedTransection = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTransections.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTransections.fulfilled, (state, action) => {
        state.loading = false;
        state.transections = action.payload.transactions;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchTransections.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchTransectionById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTransectionById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedTransection = action.payload;
      })
      .addCase(fetchTransectionById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchAllTransectionsAdmin.pending, (state) => {
        state.adminLoading = true;
        state.adminError = null;
      })
      .addCase(fetchAllTransectionsAdmin.fulfilled, (state, action) => {
        state.adminLoading = false;
        state.adminTransections = action.payload.transactions;
        state.adminTotal = action.payload.total;
        state.adminPage = action.payload.page;
        state.adminTotalPages = action.payload.totalPages;
      })
      .addCase(fetchAllTransectionsAdmin.rejected, (state, action) => {
        state.adminLoading = false;
        state.adminError = action.payload;
      })

      .addCase(updateTransectionStatus.fulfilled, (state, action) => {
        const updated = action.payload;
        const idx = state.adminTransections.findIndex(
          (t) => t._id === updated._id,
        );
        if (idx !== -1) state.adminTransections[idx] = updated;
      });
  },
});

export const { clearTransectionError, clearSelectedTransection } =
  transectionSlice.actions;
export default transectionSlice.reducer;
