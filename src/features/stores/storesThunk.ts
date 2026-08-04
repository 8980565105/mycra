import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";
import { ROUTES } from "../../services/routes";

export const fetchStores = createAsyncThunk(
  "stores/fetchStores",
  async (
    params: {
      page?: number;
      limit?: number;
      search?: string;
      status?: "active" | "inactive";
    } = {},
    { rejectWithValue },
  ) => {
    try {
      const res = await api.get(ROUTES.stores.getAll, { params });
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Failed to fetch stores");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);

export const getStoreById = createAsyncThunk(
  "stores/getStoreById",
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await api.get(ROUTES.stores.getById(id));
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Store not found");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);

export const createStore = createAsyncThunk(
  "stores/createStore",
  async (data: any, { rejectWithValue }) => {
    try {
      const res = await api.post(ROUTES.stores.create, data);
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Failed to create store");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);

export const updateStore = createAsyncThunk(
  "stores/updateStore",
  async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
    try {
      const res = await api.put(ROUTES.stores.update(id), data);
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Failed to update store");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);

export const deleteStore = createAsyncThunk(
  "stores/deleteStore",
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await api.delete(ROUTES.stores.delete(id));
      if (res.data.success) return id;
      return rejectWithValue(res.data.message || "Failed to delete store");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);

export const bulkDeleteStores = createAsyncThunk(
  "stores/bulkDeleteStores",
  async (ids: string[], { rejectWithValue }) => {
    try {
      const res = await api.post(ROUTES.stores.bulkDelete, { ids });
      if (res.data.success) return ids;
      return rejectWithValue(res.data.message || "Failed to delete stores");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);

export const fetchMyStore = createAsyncThunk(
  "stores/fetchMyStore",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get(ROUTES.stores.getMy);
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Failed to fetch store");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);

export const updateMyStore = createAsyncThunk(
  "stores/updateMyStore",
  async (data: any, { rejectWithValue }) => {
    try {
      const res = await api.put(ROUTES.stores.updateMy, data);
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Failed to update store");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);

export const fetchStoreDashboard = createAsyncThunk(
  "stores/dashboard",
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await api.get(ROUTES.stores.dashboard(id));

      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message);
    }
  },
);