import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";
import { ROUTES } from "../../services/routes";

export const fetchtypes = createAsyncThunk(
  "types/fetchtypes",
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryParams = { page: 1, limit: 0, status: "active", ...params };
      const res = await api.get(ROUTES.types.getPublic, {
        params: queryParams,
      });

      if (res.data.success) {
        const data = res.data.data;

        if (Array.isArray(data)) {
          return { types: data, total: data.length };
        }
        return { types: data.types || [], total: data.total || 0 };
      }

      return rejectWithValue(res.data.message || "Failed to fetch types");
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);
