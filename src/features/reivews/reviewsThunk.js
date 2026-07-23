import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

export const addReview = createAsyncThunk(
  "reviews/addReview",
  async (reviewData, { rejectWithValue }) => {
    try {
      const response = await api.post("/customer-reviews", reviewData);
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to add review",
      );
    }
  },
);

export const fetchProductReviews = createAsyncThunk(
  "reviews/fetchProductReviews",
  async ({ productId, page = 1, limit = 5 }, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/customer-reviews/product/${productId}?page=${page}&limit=${limit}`,
      );
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch reviews",
      );
    }
  },
);
