import { createAsyncThunk, isRejectedWithValue } from "@reduxjs/toolkit";
import api from "../../services/api";
import { ROUTES } from "../../services/routes";

export const fetchChildCategory = createAsyncThunk(
  "childcategory/fetchChildCategory",
  async (_params = {}, { rejectWithValue, getState }) => {
    const { childcategory } = getState();
    if (
      Array.isArray(childcategory.items) &&
      childcategory.items.length > 0 &&
      !childcategory.error
    ) {
      return { childcategory: childcategory.items };
    }
    try {
      const res = await api.get(ROUTES.childcategory.getAll);
      if (res.data.success) {
        return { childcategory: res.data.data };
      }
      return rejectWithValue(
        res.data.message || "Failed to fetch child category",
      );
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Something went wrong",
      );
    }
  },
);
