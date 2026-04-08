import { createSlice } from "@reduxjs/toolkit";
import { fetchNavbar } from "./navbarThunk";

const initialState = {
  navbars: [],
  total: 0,
  loading: false,
  error: null,
};

const navbarSlice = createSlice({
  name: "navbar",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNavbar.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNavbar.fulfilled, (state, action) => {
        state.loading = false;
        state.navbars = action.payload.navbars;
        state.total = action.payload.total;
      })
      .addCase(fetchNavbar.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Something went wrong";
      });
  },
});

export default navbarSlice.reducer;
