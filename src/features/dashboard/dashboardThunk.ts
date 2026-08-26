import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";
import { ROUTES } from "../../services/routes";


export const fetchDashboard = createAsyncThunk(
  "dashboard/fetchDashboard",
  async (range: "day" | "month" | "year" = "day", { rejectWithValue }) => {
    try {
      const res = await api.get(ROUTES.dashboard.getData, {
        params: { range },
      });
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Failed to fetch dashboard");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);
