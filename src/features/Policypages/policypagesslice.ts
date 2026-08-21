import { createSlice } from "@reduxjs/toolkit";
import {
  bulkDeletePolicyPages,
  createPolicyPage,
  deletePolicyPage,
  fetchPolicyPages,
  updatePolicyPage,
  updatePolicyPageStatus,
} from "./policypagesThunk";

export interface PolicyPage {
  _id: string;
  page_name: string;
  slug: string;
  description?: string;
  meta_title?: string;
  meta_description?: string;
  meta_keyphrase?: string;
  seo_image?: string;
  order?: number;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

interface PolicyPagesState {
  policyPages: PolicyPage[];
  total: number;
  loading: boolean;
  error: string | null;
}

const initialState: PolicyPagesState = {
  policyPages: [],
  total: 0,
  loading: false,
  error: null,
};

const policyPagesSlice = createSlice({
  name: "policyPages",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPolicyPages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPolicyPages.fulfilled, (state, action) => {
        state.loading = false;
        state.policyPages = action.payload.policyPages;
        state.total = action.payload.total;
      })
      .addCase(fetchPolicyPages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(createPolicyPage.fulfilled, (state, action) => {
        state.policyPages.unshift(action.payload);
        state.total += 1;
      })

      .addCase(updatePolicyPage.fulfilled, (state, action) => {
        const index = state.policyPages.findIndex(
          (p) => p._id === action.payload._id,
        );
        if (index !== -1) state.policyPages[index] = action.payload;
      })

      .addCase(updatePolicyPageStatus.fulfilled, (state, action) => {
        const index = state.policyPages.findIndex(
          (p) => p._id === action.payload._id,
        );
        if (index !== -1) state.policyPages[index] = action.payload;
      })

      .addCase(deletePolicyPage.fulfilled, (state, action) => {
        state.policyPages = state.policyPages.filter(
          (p) => p._id !== action.payload,
        );
        state.total -= 1;
      })

      .addCase(bulkDeletePolicyPages.fulfilled, (state, action) => {
        state.policyPages = state.policyPages.filter(
          (p) => !action.payload.includes(p._id),
        );
        state.total -= action.payload.length;
      });
  },
});

export default policyPagesSlice.reducer;
