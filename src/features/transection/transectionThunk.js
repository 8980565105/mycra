import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";
import { ROUTES } from "../../services/routes";

// GET user transactions (with filters)
export const fetchTransections = createAsyncThunk(
  "transection/fetchTransections",
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await api.get(ROUTES.transection.getAll, { params });
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Transactions load na thaya"
      );
    }
  }
);

// GET single transaction
export const fetchTransectionById = createAsyncThunk(
  "transection/fetchTransectionById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.get(ROUTES.transection.getById(id));
      return res.data.transection;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Transaction na madyu"
      );
    }
  }
);

// ============ ADMIN / STORE_OWNER ============

// GET all transactions (admin, store_owner)
export const fetchAllTransectionsAdmin = createAsyncThunk(
  "transection/fetchAllTransectionsAdmin",
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await api.get(ROUTES.transection.adminAll, { params });
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Transactions load na thaya"
      );
    }
  }
);

// PUT update transaction status (admin)
export const updateTransectionStatus = createAsyncThunk(
  "transection/updateTransectionStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const res = await api.put(ROUTES.transection.adminUpdateStatus(id), {
        status,
      });
      return res.data.transection;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Status update na thayu"
      );
    }
  }
);