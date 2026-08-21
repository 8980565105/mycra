import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";
import { ROUTES } from "../../services/routes";

export const fetchPolicyPages = createAsyncThunk(
  "policyPages/fetchPolicyPages",
  async (
    params: {
      page?: number;
      limit?: number;
      search?: string;
      status?: "active" | "inactive";
      isDownload?: boolean;
    } = {},
    { rejectWithValue },
  ) => {
    try {
      const res = await api.get(ROUTES.policyPages.getAll, { params });
      if (res.data.success) return res.data.data;
      return rejectWithValue(
        res.data.message || "Failed to fetch policy pages",
      );
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);

export const getPolicyPageById = createAsyncThunk(
  "policyPages/getPolicyPageById",
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await api.get(ROUTES.policyPages.getById(id));
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Policy page not found");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);

export const createPolicyPage = createAsyncThunk(
  "policyPages/createPolicyPage",
  async (data: any, { rejectWithValue }) => {
    try {
      const res = await api.post(ROUTES.policyPages.create, data);
      if (res.data.success) return res.data.data;
      return rejectWithValue(
        res.data.message || "Failed to create policy page",
      );
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);

export const updatePolicyPage = createAsyncThunk(
  "policyPages/updatePolicyPage",
  async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
    try {
      const res = await api.put(ROUTES.policyPages.update(id), data);
      if (res.data.success) return res.data.data;
      return rejectWithValue(
        res.data.message || "Failed to update policy page",
      );
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);

export const updatePolicyPageStatus = createAsyncThunk(
  "policyPages/updatePolicyPageStatus",
  async (
    { id, status }: { id: string; status: "active" | "inactive" },
    { rejectWithValue },
  ) => {
    try {
      const res = await api.put(ROUTES.policyPages.updateStatus(id), {
        status,
      });
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Failed to update status");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);

export const deletePolicyPage = createAsyncThunk(
  "policyPages/deletePolicyPage",
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await api.delete(ROUTES.policyPages.delete(id));
      if (res.data.success) return id;
      return rejectWithValue(
        res.data.message || "Failed to delete policy page",
      );
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);

export const bulkDeletePolicyPages = createAsyncThunk(
  "policyPages/bulkDeletePolicyPages",
  async (ids: string[], { rejectWithValue }) => {
    try {
      const res = await api.post(ROUTES.policyPages.bulkDelete, { ids });
      if (res.data.success) return ids;
      return rejectWithValue(
        res.data.message || "Failed to delete policy pages",
      );
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);
