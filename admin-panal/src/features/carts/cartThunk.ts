import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/services/api";
import { ROUTES } from "@/services/routes";

// Fetch all cart items
export const fetchCartItems = createAsyncThunk(
  "cart/fetchAll",
  async (
    params: { page?: number; limit?: number; search?: string, isDownload?: boolean } = {},
    { rejectWithValue }
  ) => {
    try {
      const res = await api.get(ROUTES.cart.getAll, { params });
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Failed to fetch cart items");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server error");
    }
  }
);

// Get cart item by ID
export const getCartItemById = createAsyncThunk(
  "cart/getById",
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await api.get(ROUTES.cart.getById(id));
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Cart item not found");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server error");
    }
  }
);

// Delete single cart item
export const deleteCartItem = createAsyncThunk(
  "cart/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await api.delete(ROUTES.cart.delete(id));
      if (res.data.success) return id;
      return rejectWithValue(res.data.message || "Failed to delete item");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server error");
    }
  }
);

// Bulk delete cart items
export const bulkDeleteCartItems = createAsyncThunk(
  "cart/bulkDelete",
  async (ids: string[], { rejectWithValue }) => {
    try {
      const res = await api.post(ROUTES.cart.bulkDelete, { ids });
      if (res.data.success) return ids;
      return rejectWithValue(res.data.message || "Failed to delete items");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server error");
    }
  }
);
