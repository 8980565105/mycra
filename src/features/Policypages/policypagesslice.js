import { createSlice } from "@reduxjs/toolkit";
import { fetchPolicyPageBySlug, fetchPolicyPages } from "./policypagesThunk";

const initialState = {
  pages: [],
  loading: false,
  error: null,
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 0,
};

const policyPagesSlice = createSlice({
  name: "policyPages",

  initialState,

  reducers: {
    clearPolicyPages: (state) => {
      state.pages = [];
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder

      .addCase(fetchPolicyPages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchPolicyPages.fulfilled, (state, action) => {
        state.loading = false;

        state.pages = action.payload?.policyPages || [];

        state.total = action.payload?.total || 0;
        state.page = action.payload?.page || 1;
        state.limit = action.payload?.limit || 10;
        state.totalPages = action.payload?.totalPages || 0;
      })

      .addCase(fetchPolicyPages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch policy pages";
      })
      .addCase(fetchPolicyPageBySlug.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchPolicyPageBySlug.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPage = action.payload;
      })

      .addCase(fetchPolicyPageBySlug.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch policy page";
      });
  },
});

export const { clearPolicyPages } = policyPagesSlice.actions;

export default policyPagesSlice.reducer;
