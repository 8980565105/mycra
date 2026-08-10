import { createSlice } from "@reduxjs/toolkit";
import { fetchChildCategory } from "./childcategoryThunk";

const initialState = {
  items: [],
  loading: false,
  error: null,
};

const childcategorySlice = createSlice({
  name: "childcategory",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchChildCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChildCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.childcategory;
      })
      .addCase(fetchChildCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default childcategorySlice.reducer;
