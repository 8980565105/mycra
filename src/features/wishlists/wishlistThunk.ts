import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/services/api";
import { ROUTES } from "@/services/routes";

export const fetchWishlistItems = createAsyncThunk(
  "wishlist/fetchAll",
  async (
    params: {
      page?: number;
      limit?: number;
      search?: string;
      isDownload?: boolean;
    } = {},
    { rejectWithValue },
  ) => {
    try {
      const { isDownload = false, ...query } = params;

      const res = await api.get(ROUTES.wishlist.getAll, {
        params: { ...query, isDownload },
      });
      if (res.data.success) return res.data.data;
      return rejectWithValue(
        res.data.message || "Failed to fetch wishlist items",
      );
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server error");
    }
  },
);

export const getWishlistItemById = createAsyncThunk(
  "wishlist/getById",
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await api.get(ROUTES.wishlist.getById(id));
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Wishlist item not found");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server error");
    }
  },
);

export const deleteWishlistItem = createAsyncThunk(
  "wishlist/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await api.delete(ROUTES.wishlist.delete(id));
      if (res.data.success) return id;
      return rejectWithValue(res.data.message || "Failed to delete item");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server error");
    }
  },
);

export const bulkDeleteWishlistItems = createAsyncThunk(
  "wishlist/bulkDelete",
  async (ids: string[], { rejectWithValue }) => {
    try {
      const res = await api.post(ROUTES.wishlist.bulkDelete, { ids });
      if (res.data.success) return ids;
      return rejectWithValue(res.data.message || "Failed to delete items");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server error");
    }
  },
);
