import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";
import { ROUTES } from "../../services/routes";

export const getMyGiftCards = createAsyncThunk(
  "giftCards/my",

  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(ROUTES.giftCards.my);

      if (!response.data.success) {
        return rejectWithValue(
          response.data.message ||
            "Failed to fetch gift cards"
        );
      }

      return response.data;
    } catch (error) {
      console.error(
        "getMyGiftCards error:",
        error
      );

      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to fetch gift cards"
      );
    }
  }
);