import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";
import { ROUTES } from "../../services/routes";

export const fetchFestivalOffers = createAsyncThunk(
  "festivalOffers/fetchFestivalOffers",

  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(ROUTES.festivalOffers.getAll);
      return response.data?.data?.offers || [];
    } catch (error) {
      console.error("Festival Offer API Error:", error);

      return rejectWithValue(
        error?.response?.data?.message || "Failed to fetch festival offers"
      );
    }
  }
);