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
          response.data.message || "Failed to fetch gift cards"
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

const errorMessage = (error) => {
  return (
    error?.response?.data?.message ||
    error?.message ||
    "Gift Card request failed."
  );
};

export const getGiftCardProducts = createAsyncThunk(
  "giftCards/getGiftCardProducts",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(ROUTES.giftCards.products);

      return response.data.products || [];
    } catch (error) {
      return rejectWithValue(errorMessage(error));
    }
  }
);

export const purchaseGiftCard = createAsyncThunk(
  "giftCards/purchaseGiftCard",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await api.post(ROUTES.giftCards.purchase, payload);

      return response.data;
    } catch (error) {
      return rejectWithValue(errorMessage(error));
    }
  }
);

export const adminCreateGiftCardProduct = createAsyncThunk(
  "giftCards/adminCreateGiftCardProduct",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await api.post(ROUTES.giftCards.AdminCreateCardProduct, payload);

      return response.data;
    } catch (error) {
      return rejectWithValue(errorMessage(error));
    }
  }
);
