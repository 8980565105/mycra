import api from "@/services/api";
import { ROUTES } from "@/services/routes";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const fetchFestivalOffers = createAsyncThunk(
  "festivalOffers/fetchFestivalOffers",
  async (
    params: {
      page?: number;
      limit?: number;
      search?: string;
      isDownload?: boolean;
      status?: "active" | "inactive";
      role?: string;
    } = {},
    { rejectWithValue },
  ) => {
    try {
      const { isDownload = false, ...query } = params;
      const res = await api.get(ROUTES.festivalOffers.getAll, {
        params: { ...query, isDownload },
      });
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Failed to fetch festival offers");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);

export const getFestivalOfferById = createAsyncThunk(
  "festivalOffers/getFestivalOfferById",
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await api.get(ROUTES.festivalOffers.getById(id));
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Festival offer not found");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);

export const createFestivalOffer = createAsyncThunk(
  "festivalOffers/createFestivalOffer",
  async ( data: any, { rejectWithValue }) => {
    try {
      const res = await api.post(ROUTES.festivalOffers.create, data);

      if (res.data.success) {
        return res.data.data;
      }
      return rejectWithValue(res.data.message || "Failed to create festival offer");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  }
);

export const updateFestivalOffer = createAsyncThunk(
  "festivalOffers/updateFestivalOffer",
  async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
    try {
      const res = await api.put(ROUTES.festivalOffers.update(id), data);

      if (res.data.success) {
        return res.data.data;
      }

      return rejectWithValue(res.data.message || "Failed to update festival offer");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  }
);



export const deleteFestivalOffer = createAsyncThunk(
  "festivalOffers/deleteFestivalOffer",
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await api.delete(ROUTES.festivalOffers.delete(id));
      if (res.data.success) return id;
      return rejectWithValue(res.data.message || "Failed to delete festival offer");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);
