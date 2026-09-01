import { createSlice } from "@reduxjs/toolkit";

import {
  createEmails,
  fetchEmails,
  fetchEmailById,
  updateEmail,
  deleteEmail,
  bulkDeleteEmails,
} from "./emailsThunk";

interface EmailItem {
  _id: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

interface EmailState {
  emails: EmailItem[];
  selectedEmail: EmailItem | null;
  total: number;
  loading: boolean;
  error: string | null;
}

const initialState: EmailState = {
  emails: [],
  selectedEmail: null,
  total: 0,
  loading: false,
  error: null,
};

const emailSlice = createSlice({
  name: "emails",

  initialState,

  reducers: {
    clearSelectedEmail: (state) => {
      state.selectedEmail = null;
    },
  },

  extraReducers: (builder) => {
    builder

      .addCase(fetchEmails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchEmails.fulfilled, (state, action) => {
        state.loading = false;

        const payload = action.payload?.data;

        state.emails = payload?.emails || [];
        state.total = payload?.total || 0;
      })

      .addCase(fetchEmails.rejected, (state, action) => {
        state.loading = false;

        state.error = (action.payload as string) || "Failed to fetch emails";
      })

      .addCase(fetchEmailById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchEmailById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedEmail = action.payload?.data || null;
      })

      .addCase(fetchEmailById.rejected, (state, action) => {
        state.loading = false;

        state.error = (action.payload as string) || "Failed to fetch email";
      })

      .addCase(createEmails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(createEmails.fulfilled, (state) => {
        state.loading = false;
      })

      .addCase(createEmails.rejected, (state, action) => {
        state.loading = false;

        state.error = (action.payload as string) || "Failed to create email";
      })

      .addCase(updateEmail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(updateEmail.fulfilled, (state) => {
        state.loading = false;
      })

      .addCase(updateEmail.rejected, (state, action) => {
        state.loading = false;

        state.error = (action.payload as string) || "Failed to update email";
      })

      .addCase(deleteEmail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(deleteEmail.fulfilled, (state) => {
        state.loading = false;
      })

      .addCase(deleteEmail.rejected, (state, action) => {
        state.loading = false;

        state.error = (action.payload as string) || "Failed to delete email";
      })

      .addCase(bulkDeleteEmails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(bulkDeleteEmails.fulfilled, (state) => {
        state.loading = false;
      })

      .addCase(bulkDeleteEmails.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to delete emails";
      });
  },
});

export const { clearSelectedEmail } = emailSlice.actions;

export default emailSlice.reducer;
