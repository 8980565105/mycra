import { createSlice } from "@reduxjs/toolkit";
import { fetchFooter } from "./footerThunk";
const initialState = {
  footers: [],
  total: 0,
  loading: false,
  error: null,
};
const footerSlice = createSlice({
  name: "footer",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFooter.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFooter.fulfilled, (state, action) => {
        state.loading = false;
        if (Array.isArray(action.payload)) {
          state.footers = action.payload;
          state.total = action.payload.length;
        } else {
          state.footers = action.payload?.footers ?? [];
          state.total = action.payload?.total ?? 0;
        }
      })
      .addCase(fetchFooter.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Something went wrong";
      });
  },
});

export default footerSlice.reducer;
