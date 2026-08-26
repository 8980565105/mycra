import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";
import { ROUTES } from "../../services/routes";

export const fetchEmails = createAsyncThunk(
  "emails/fetchEmails",

  async (
    {
      page = 1,
      limit = 10,
      search = "",
    }: {
      page?: number;
      limit?: number;
      search?: string;
    },
    { rejectWithValue },
  ) => {
    try {
      const response = await api.get(ROUTES.emails.getAll, {
        params: {
          page,
          limit,
          search,
        },
      });

      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to fetch emails",
      );
    }
  },
);

export const fetchEmailById = createAsyncThunk(
  "emails/fetchEmailById",

  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(ROUTES.emails.getById(id));

      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to fetch email",
      );
    }
  },
);

export const createEmails = createAsyncThunk(
  "emails/createEmails",

  async (emailData: { email: string }, { rejectWithValue }) => {
    try {
      const response = await api.post(ROUTES.emails.create, emailData);

      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to create email",
      );
    }
  },
);

export const updateEmail = createAsyncThunk(
  "emails/updateEmail",

  async (
    {
      id,
      email,
    }: {
      id: string;
      email: string;
    },
    { rejectWithValue },
  ) => {
    try {
      const response = await api.put(ROUTES.emails.update(id), {
        email,
      });

      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to update email",
      );
    }
  },
);

export const deleteEmail = createAsyncThunk(
  "emails/deleteEmail",

  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.delete(ROUTES.emails.delete(id));

      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to delete email",
      );
    }
  },
);

export const bulkDeleteEmails = createAsyncThunk(
  "emails/bulkDeleteEmails",

  async (ids: string[], { rejectWithValue }) => {
    try {
      const response = await api.post(ROUTES.emails.bulkDelete, {
        ids,
      });

      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to delete emails",
      );
    }
  },
);
