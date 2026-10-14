import api from "@/services/api";
import { ROUTES } from "@/services/routes";
import { createAsyncThunk } from "@reduxjs/toolkit";

export type CreateGiftCardProductPayload = {
  productName: string;
  productDescription?: string;
  productImage?: string;
  amount: number;
  isPurchaseEnabled: boolean;
};

const getErrorMessage = (error: any, fallback: string): string => {
  return (
    error?.response?.data?.message ||
    error?.message ||
    fallback
  );
};


export const adminCreateGiftCard = createAsyncThunk(
  "giftCards/adminCreateGiftCard",

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
  "giftCards/adminGetAllGiftCards",
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


export const adminGetAllPurchasedGiftCards = createAsyncThunk(
  "giftCards/adminGetAllPurchasedGiftCards",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(ROUTES.giftCards.purchaseGiftCard);

      return response.data.giftCards;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch purchased gift cards"
      );
    }
  }
);


export const getGiftCardProducts = createAsyncThunk(
  "giftCards/getGiftCardProducts",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/gift-cards/products");

      return response.data.products || [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch gift card product");
    }
  }
);


export const adminCreateGiftCardProduct = createAsyncThunk(
  "giftCards/adminCreateGiftCardProduct",
  async (
    payload: CreateGiftCardProductPayload,
    { rejectWithValue }
  ) => {
    try {

      const response = await api.post(
        ROUTES.giftCards.adminProducts,
        payload
      );

      if (!response.data?.success) {
        return rejectWithValue(response.data?.message || "Unable to create Gift Card product.");
      }

      return response.data;
    } catch (error: any) {

      return rejectWithValue(
        getErrorMessage(error, "Unable to create Gift Card product.")
      );
    }
  }
);


export const adminGetAllGiftCardProducts = createAsyncThunk(
  "giftCards/adminGetAllGiftCardProducts",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(
        ROUTES.giftCards.adminProducts
      );

      if (!response.data?.success) {
        return rejectWithValue(
          response.data?.message || "Failed to load products."
        );
      }

      return response.data.products || [];
    } catch (error: any) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to load products.")
      );
    }
  }
);

export const adminUpdateGiftCardProduct = createAsyncThunk(
  "giftCards/adminUpdateProduct",
  async ({ id, ...payload } : {
      id: string;
      productName?: string;
      productDescription?: string;
      productImage?: string;
      amount?: number;
      isPurchaseEnabled?: boolean;
      productExpiresAt?: string | null;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.patch(
        ROUTES.giftCards.adminUpdateProduct(id),
        payload
      );

      if (!response.data?.success) {
        return rejectWithValue(
          response.data?.message || "Failed to update product."
        );
      }

      return response.data.product;
    } catch (error: any) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to update product.")
      );
    }
  }
);

export const adminUpdateGiftCardProductStatus = createAsyncThunk(
  "giftCards/adminProductStatus",
  async (
    { id, isPurchaseEnabled }: {
      id: string;
      isPurchaseEnabled: boolean;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.patch(
        ROUTES.giftCards.adminProductStatus(id),
        { isPurchaseEnabled }
      );

      if (!response.data?.success) {
        return rejectWithValue(
          response.data?.message || "Failed to change status."
        );
      }

      return response.data.product;
    } catch (error: any) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to change status.")
      );
    }
  }
);