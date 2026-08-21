import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";
import { ROUTES } from "../../services/routes";

export const fetchPolicyPages = createAsyncThunk(
  "policyPages/fetchPolicyPages",

  async (params = {}, { rejectWithValue }) => {
    try {
      const queryParams = {
        status: "active",
        ...params,
      };

      const res = await api.get(ROUTES.pages.getAll, {
        params: queryParams,
      });

      if (res.data.success) {
        return res.data.data;
      }

      return rejectWithValue(
        res.data.message || "Failed to fetch policy pages",
      );
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);

export const fetchPolicyPageBySlug = createAsyncThunk(
  "policyPages/fetchPolicyPageBySlug",

  async (slug, { rejectWithValue }) => {
    try {
      const res = await api.get(ROUTES.policypage.getBySlug(slug));

      if (res.data.success) {
        return res.data.data;
      }

      return rejectWithValue(res.data.message || "Policy page not found");
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch policy page",
      );
    }
  },
);
