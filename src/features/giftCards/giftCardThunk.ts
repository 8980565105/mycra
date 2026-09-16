import api from "@/services/api";
import { ROUTES } from "@/services/routes";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const adminCreateGiftCard = createAsyncThunk(
  "giftCards/adminCreate",

  async (
    { amount, userId, recipientName, recipientEmail, expiresAt, }: {
      amount: number;
      userId: string;
      recipientName?: string;
      recipientEmail?: string;
      expiresAt?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post(ROUTES.giftCards.adminCreate, {
          amount,
          userId,
          recipientName,
          recipientEmail,
          expiresAt,
        }
      );

      console.log(
        "BACKEND GIFT CARD RESPONSE:",
        response.data
      );

      if (!response.data.success) {
        return rejectWithValue(
          response.data.message ||
            "Gift card creation failed"
        );
      }

      return response.data;
    } catch (error: any) {
      console.error(
        "Gift card API error:",
        error
      );

      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to create gift card"
      );
    }
  }
);

export const adminGetAllGiftCards = createAsyncThunk(
  "giftCards/adminAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get(ROUTES.giftCards.adminAll );

      if (res.data.success) {
        return res.data;
      }

      return rejectWithValue(
        res.data.message ||
          "Failed to fetch gift cards"
      );
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to fetch gift cards"
      );
    }
  }
);