import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";
import { ROUTES } from "../../services/routes";

export const fetchBrands = createAsyncThunk(
  "brands/fetchBrands",
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryParams = { page: 1, limit: 0, status: "active", ...params };
      const res = await api.get(ROUTES.brands.getPublic, {
        params: queryParams,
      });

      if (res.data.success) {
        const data = res.data.data;

        if (Array.isArray(data)) {
          return { brands: data, total: data.length };
        }
        return { brands: data.brands || [], total: data.total || 0 };
      }

      return rejectWithValue(res.data.message || "Failed to fetch brands");
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);
