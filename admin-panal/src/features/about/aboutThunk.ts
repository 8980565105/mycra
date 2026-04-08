import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

const BASE = "/about";

const ok = (res: any) => res?.data?.success;
const get = (res: any) => res?.data?.data;

// ── FETCH admin ───────────────────────────────────────────────────────────────
export const fetchAboutPage = createAsyncThunk(
  "aboutPage/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get(BASE);
      if (ok(res)) return get(res);
      return rejectWithValue("Failed to fetch About page");
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || "Server error");
    }
  },
);

// ── FETCH public (storefront) ─────────────────────────────────────────────────
export const fetchPublicAboutPage = createAsyncThunk(
  "aboutPage/fetchPublic",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get(`${BASE}/public`);
      if (ok(res)) return get(res);
      return rejectWithValue("Failed to fetch About page");
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || "Server error");
    }
  },
);

// ── SAVE full page (upsert) ───────────────────────────────────────────────────
export const saveAboutPage = createAsyncThunk(
  "aboutPage/save",
  async (data: FormData | Record<string, any>, { rejectWithValue }) => {
    try {
      const isFormData = data instanceof FormData;
      const res = await api.post(BASE, data, {
        headers: isFormData ? { "Content-Type": "multipart/form-data" } : {},
      });
      if (ok(res)) return get(res);
      return rejectWithValue("Failed to save About page");
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || "Server error");
    }
  },
);

// ── HERO ──────────────────────────────────────────────────────────────────────
export const updateHero = createAsyncThunk(
  "aboutPage/updateHero",
  async (data: FormData | Record<string, any>, { rejectWithValue }) => {
    try {
      const isFormData = data instanceof FormData;
      const res = await api.put(`${BASE}/hero`, data, {
        headers: isFormData ? { "Content-Type": "multipart/form-data" } : {},
      });
      if (ok(res)) return get(res);
      return rejectWithValue("Failed to update hero");
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || "Server error");
    }
  },
);

export const addContentItem = createAsyncThunk(
  "aboutPage/addContent",
  async (data: FormData | Record<string, any>, { rejectWithValue }) => {
    try {
      const isFormData = data instanceof FormData;
      const res = await api.post(`${BASE}/content`, data, {
        headers: isFormData ? { "Content-Type": "multipart/form-data" } : {},
      });
      if (ok(res)) return get(res);
      return rejectWithValue("Failed to add content item");
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || "Server error");
    }
  },
);

export const updateContentItem = createAsyncThunk(
  "aboutPage/updateContent",
  async (
    { itemId, data }: { itemId: string; data: FormData | Record<string, any> },
    { rejectWithValue },
  ) => {
    try {
      const isFormData = data instanceof FormData;
      const res = await api.put(`${BASE}/content/${itemId}`, data, {
        headers: isFormData ? { "Content-Type": "multipart/form-data" } : {},
      });
      if (ok(res)) return get(res);
      return rejectWithValue("Failed to update content item");
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || "Server error");
    }
  },
);

export const updateContentStatus = createAsyncThunk(
  "aboutPage/updateContentStatus",
  async (
    { itemId, status }: { itemId: string; status: "active" | "inactive" },
    { rejectWithValue },
  ) => {
    try {
      const res = await api.put(`${BASE}/content/${itemId}/status`, { status });
      if (ok(res)) return get(res);
      return rejectWithValue("Failed to update status");
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || "Server error");
    }
  },
);

export const deleteContentItem = createAsyncThunk(
  "aboutPage/deleteContent",
  async (itemId: string, { rejectWithValue }) => {
    try {
      const res = await api.delete(`${BASE}/content/${itemId}`);
      if (ok(res)) return get(res);
      return rejectWithValue("Failed to delete content item");
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || "Server error");
    }
  },
);

export const addFeature = createAsyncThunk(
  "aboutPage/addFeature",
  async (data: FormData | Record<string, any>, { rejectWithValue }) => {
    try {
      const isFormData = data instanceof FormData;

      const res = await api.post(`${BASE}/feature`, data, {
        headers: isFormData ? { "Content-Type": "multipart/form-data" } : {},
      });

      if (ok(res)) return get(res);
      return rejectWithValue("Failed to add feature");
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || "Server error");
    }
  }
);

export const updateFeature = createAsyncThunk(
  "aboutPage/updateFeature",
  async (
    { featureId, data }: { featureId: string; data: Record<string, any> },
    { rejectWithValue },
  ) => {
    try {
      const res = await api.put(`${BASE}/feature/${featureId}`, data);
      if (ok(res)) return get(res);
      return rejectWithValue("Failed to update feature");
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || "Server error");
    }
  },
);

export const deleteFeature = createAsyncThunk(
  "aboutPage/deleteFeature",
  async (featureId: string, { rejectWithValue }) => {
    try {
      const res = await api.delete(`${BASE}/feature/${featureId}`);
      if (ok(res)) return get(res);
      return rejectWithValue("Failed to delete feature");
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || "Server error");
    }
  },
);
