import { createSlice } from "@reduxjs/toolkit";
import { createEmails } from "./EmailsThunk";

const initialState = {
  email: null,
  loading: false,
  error: null,
  success: false,
  message: "",
};

const emailSlice = createSlice({
  name: "emails",
  initialState,

  reducers: {
    resetEmailState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
      state.message = "";
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(createEmails.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })

      .addCase(createEmails.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.email = action.payload?.data || action.payload;
        state.message =
          action.payload?.message || "Email subscribed successfully";
      })

      .addCase(createEmails.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload || "Unable to subscribe email";
      });
  },
});

export const { resetEmailState } = emailSlice.actions;

export default emailSlice.reducer;
