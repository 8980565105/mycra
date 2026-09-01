import { createSlice } from "@reduxjs/toolkit";
import {
  fetchCustomerReviews,
  deleteCustomerReview,
  bulkDeleteCustomerReviews,
  getCustomerReviewById,
  updateReviewsStatus,
  createCustomerReview,
  updateCustomerReview,
  fetchPublicProductReviews,
} from "./customerReviewsThunk";

interface CustomerReviewState {
  customerReviews: any[]; 
  publicReviews: any[]; 
  total: number;
  publicTotal: number;
  loading: boolean;
  submitting: boolean; 
  error: string | null;
  selectedReview: any | null;
}

const initialState: CustomerReviewState = {
  customerReviews: [],
  publicReviews: [],
  total: 0,
  publicTotal: 0,
  loading: false,
  submitting: false,
  error: null,
  selectedReview: null,
};

const customerReviewsSlice = createSlice({
  name: "customerReviews",
  initialState,
  reducers: {
    clearPublicReviews: (state) => {
      state.publicReviews = [];
      state.publicTotal = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCustomerReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomerReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.customerReviews = action.payload.customerReviews;
        state.total = action.payload.total;
      })
      .addCase(fetchCustomerReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(getCustomerReviewById.fulfilled, (state, action) => {
        state.selectedReview = action.payload;
      })

      .addCase(updateCustomerReview.fulfilled, (state, action) => {
        const updated = action.payload;
        const index = state.customerReviews.findIndex(
          (r) => r._id === updated._id,
        );
        if (index !== -1) {
          state.customerReviews[index] = updated;
        }
      })

      .addCase(updateReviewsStatus.fulfilled, (state, action) => {
        const updated = action.payload;
        const index = state.customerReviews.findIndex(
          (r) => r._id === updated._id,
        );
        if (index !== -1) {
          state.customerReviews[index] = updated;
        }
      })

      .addCase(deleteCustomerReview.fulfilled, (state, action) => {
        state.customerReviews = state.customerReviews.filter(
          (r) => r._id !== action.payload,
        );
        state.total -= 1;
      })

      .addCase(bulkDeleteCustomerReviews.fulfilled, (state, action) => {
        state.customerReviews = state.customerReviews.filter(
          (r) => !action.payload.includes(r._id),
        );
        state.total -= action.payload.length;
      })

      .addCase(createCustomerReview.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(createCustomerReview.fulfilled, (state, action) => {
        state.submitting = false;
        state.publicReviews.unshift(action.payload);
        state.publicTotal += 1;
      })
      .addCase(createCustomerReview.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload as string;
      })

      .addCase(fetchPublicProductReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPublicProductReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.publicReviews = action.payload.reviews;
        state.publicTotal = action.payload.total;
      })
      .addCase(fetchPublicProductReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearPublicReviews } = customerReviewsSlice.actions;
export default customerReviewsSlice.reducer;
