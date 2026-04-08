import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";
import { ROUTES } from "../../services/routes";

export const fetchNavbar = createAsyncThunk(
  "navbar/fetchNavbar",
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await api.get(ROUTES.navbar.getAll, { params });

      if (res.data.success) {
        return res.data.data; 
      }

      return rejectWithValue(
        res.data.message || "Failed to fetch navbar items",
      );
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
  {
    condition: (params = {}, { getState }) => {
      if (params && Object.keys(params).length > 0) return true;

      const { navbar } = getState();
      if (navbar.loading) return false;
      if (Array.isArray(navbar.navbars) && navbar.navbars.length > 0) {
        return false;
      }

      return true;
    },
  },
);
