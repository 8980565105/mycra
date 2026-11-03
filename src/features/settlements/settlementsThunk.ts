import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";
import { ROUTES } from "../../services/routes";

export const fetchSettlements = createAsyncThunk(
  "settlements/fetchSettlements",
  async (
    params: {
      page?: number;
      limit?: number;
      search?: string;
      isDownload?: boolean;
      status?: string;
      role?: string;
      store?: string;
    } = {},
    { rejectWithValue },
  ) => {
    try {
      const { isDownload = false, ...query } = params;
      const res = await api.get(ROUTES.settlements.getAll, {
        params: { ...query, isDownload },
      });

      if (res.data.success) {
        return res.data.data;
      }

      return rejectWithValue(res.data.message || "Failed to fetch settlements");
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch settlements",
      );
    }
  },
);

export const withdrawSettlement = createAsyncThunk(
  "settlements/withdraw",
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await api.post(ROUTES.settlements.withdraw(id));

      if (res.data.success) {
        return res.data.settlement;
      }

      return rejectWithValue(res.data.message || "Withdrawal failed");
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Withdrawal failed",
      );
    }
  },
);

export const processAvailableSettlements = createAsyncThunk(
  "settlements/processAvailable",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.post(ROUTES.settlements.processAvailable);

      if (res.data.success) {
        return res.data;
      }

      return rejectWithValue(
        res.data.message || "Failed to process settlements",
      );
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to process settlements",
      );
    }
  },
);

export const markSettlementProcessing = createAsyncThunk(
  "settlements/processing",
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await api.put(ROUTES.settlements.processing(id));

      return res.data.settlement;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to process settlement",
      );
    }
  },
);

export const markSettlementPaid = createAsyncThunk(
  "settlements/paid",
  async (
    {
      id,
      payout_reference,
      notes,
    }: {
      id: string;
      payout_reference: string;
      notes?: string;
    },
    { rejectWithValue },
  ) => {
    try {
      const res = await api.put(ROUTES.settlements.paid(id), {
        payout_reference,
        notes,
      });

      return res.data.settlement;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to mark settlement paid",
      );
    }
  },
);

export const markSettlementFailed = createAsyncThunk(
  "settlements/failed",
  async (
    {
      id,
      reason,
    }: {
      id: string;
      reason: string;
    },
    { rejectWithValue },
  ) => {
    try {
      const res = await api.put(ROUTES.settlements.failed(id), {
        reason,
      });

      return res.data.settlement;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to mark settlement failed",
      );
    }
  },
);


export const deleteSettlement = createAsyncThunk(
  "settlements/deleteSettlement",
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await api.delete(ROUTES.settlements.delete(id));
      if (res.data.success) return id;
      return rejectWithValue(res.data.message || "Failed to delete settlement");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);

export const bulkDeleteSettlements = createAsyncThunk(
  "settlements/bulkDeleteSettlements",
  async (ids: string[], { rejectWithValue }) => {
    try {
      const res = await api.post(ROUTES.settlements.bulkDelete, { ids });
      if (res.data.success) return ids;
      return rejectWithValue(res.data.message || "Failed to delete settlements");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);
