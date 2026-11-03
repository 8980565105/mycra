import api from "@/services/api";
import { ROUTES } from "@/services/routes";
import { createAsyncThunk } from "@reduxjs/toolkit";

export interface TransactionFilters {
  page?: number;
  limit?: number;
  search?: string;
  isDownload?: boolean;
  category?: string;
  type?: string;
  paymentMode?: string;
  status?: string;
  userId?: string;
  // timePeriod?: string;
}

interface UpdateTransactionStatusPayload {
  id: string
  status: "Pending" | "Success" | "Failed";
}

export const fetchAllTransactionsAdmin = createAsyncThunk(
  "transection/fetchAllTransactionsAdmin",
  async (params: any, { rejectWithValue }) => {
    try {
      const res = await api.get(ROUTES.transection.adminAll, {
        params,
      });

      return res.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch transactions"
      );
    }
  }
);

export const updateAdminTransactionStatus = createAsyncThunk(
  "transection/updateAdminTransactionStatus",
  async (
    { id, status }: UpdateTransactionStatusPayload,
    { rejectWithValue }
  ) => {
    try {
      const res = await api.put( ROUTES.transection.adminUpdateStatus(id),
        { status }
      );

      if (!res.data.success) {
        return rejectWithValue(res.data.message || "Failed to update status");
      }

      return res.data.transaction || res.data.transection;

    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update transaction status"
      );
    }
  }
);

export const deleteTransaction = createAsyncThunk(
  "transection/deleteTransaction",
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await api.delete(ROUTES.transection.adminDelete(id));
      if (res.data.success) return id;
      return rejectWithValue(res.data.message || "Failed to delete transection");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);

export const bulkDeleteTransactions = createAsyncThunk(
  "transection/bulkDeleteTransactions",
  async (ids: string[], { rejectWithValue }) => {
    try {
      const res = await api.post(ROUTES.transection.adminBulkDelete, { ids });
      if (res.data.success) return ids;
      return rejectWithValue(res.data.message || "Failed to delete transection");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);
