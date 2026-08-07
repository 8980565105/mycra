import { createSlice } from "@reduxjs/toolkit";
import {
  fetchAttributes,
  fetchSubCategoryAttributes,
  fetchTypeAttributes,
} from "./attributThunk";

const initialState = {
  attributes: [],
  typeAttributes: [],
  subCategoryAttributes: [],

  loading: false,
  error: null,
};

const attributeSlice = createSlice({
  name: "attributes",
  initialState,

  reducers: {
    clearTypeAttributes: (state) => {
      state.typeAttributes = [];
    },

    clearSubCategoryAttributes: (state) => {
      state.subCategoryAttributes = [];
    },
  },

  extraReducers: (builder) => {
    builder

      .addCase(fetchAttributes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchAttributes.fulfilled, (state, action) => {
        state.loading = false;
        state.attributes = action.payload;
      })

      .addCase(fetchAttributes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchTypeAttributes.pending, (state) => {
        state.loading = true;
      })

      .addCase(fetchTypeAttributes.fulfilled, (state, action) => {
        state.loading = false;
        state.typeAttributes = action.payload;
      })

      .addCase(fetchTypeAttributes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchSubCategoryAttributes.pending, (state) => {
        state.loading = true;
      })

      .addCase(fetchSubCategoryAttributes.fulfilled, (state, action) => {
        state.loading = false;
        state.subCategoryAttributes = action.payload;
      })

      .addCase(fetchSubCategoryAttributes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearTypeAttributes, clearSubCategoryAttributes } =
  attributeSlice.actions;

export default attributeSlice.reducer;
