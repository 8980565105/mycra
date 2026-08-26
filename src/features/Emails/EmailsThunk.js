import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";
import { ROUTES } from "../../services/routes";

export const createEmails = createAsyncThunk(
  "emails/createEmails",
  async (emailData, { rejectWithValue }) => {
    try {
      const response = await api.post(ROUTES.Emails.create, emailData);

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.message ||
          "Something went wrong",
      );
    }
  },
);
