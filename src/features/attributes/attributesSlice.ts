import { createSlice } from "@reduxjs/toolkit";
import {
  Attribute,
  AttributeValue,
  fetchAttributes,
  createAttribute,
  updateAttribute,
  deleteAttribute,
  fetchAttributeValues,
  createAttributeValue,
  updateAttributeValue,
  deleteAttributeValue,
  fetchCategoryAttributes,
  fetchTypeAttributes,
} from "./attributesThunk";

interface AttributesState {
  attributes: Attribute[];
  attributeValues: AttributeValue[];
  categoryAttributes: any[];
  total: number;
  page: number;
  pages: number;
  loading: boolean;
  error: string | null;
}

const initialState: AttributesState = {
  attributes: [],
  attributeValues: [],
  categoryAttributes: [],
  total: 0,
  page: 1,
  pages: 1,
  loading: false,
  error: null,
};

const attributesSlice = createSlice({
  name: "attributes",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAttributes.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAttributes.fulfilled, (state, action) => {
        state.loading = false;
        state.attributes = action.payload.data || [];
        if (action.payload.pagination) {
          state.total = action.payload.pagination.total;
          state.page = action.payload.pagination.page;
          state.pages = action.payload.pagination.pages;
        }
      })
      .addCase(fetchAttributes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch attributes";
      })
      .addCase(createAttribute.fulfilled, (state, action) => {
        if (action.payload.data) {
          state.attributes.unshift(action.payload.data);
        }
      })
      .addCase(updateAttribute.fulfilled, (state, action) => {
        if (action.payload.data) {
          const index = state.attributes.findIndex(
            (a) => a._id === action.payload.data._id,
          );
          if (index !== -1) {
            state.attributes[index] = action.payload.data;
          }
        }
      })
      .addCase(deleteAttribute.fulfilled, (state, action) => {
        state.attributes = state.attributes.filter(
          (a) => a._id !== action.payload.id,
        );
      })
      .addCase(fetchAttributeValues.fulfilled, (state, action) => {
        state.attributeValues = action.payload.data || [];
      })
      .addCase(createAttributeValue.fulfilled, (state, action) => {
        if (action.payload.data) {
          state.attributeValues.push(action.payload.data);
        }
      })
      .addCase(updateAttributeValue.fulfilled, (state, action) => {
        if (action.payload.data) {
          const index = state.attributeValues.findIndex(
            (v) => v._id === action.payload.data._id,
          );
          if (index !== -1) {
            state.attributeValues[index] = action.payload.data;
          }
        }
      })
      .addCase(deleteAttributeValue.fulfilled, (state, action) => {
        state.attributeValues = state.attributeValues.filter(
          (v) => v._id !== action.payload.id,
        );
      })
      .addCase(fetchCategoryAttributes.fulfilled, (state, action) => {
        state.categoryAttributes = action.payload.data || [];
      })
      .addCase(fetchTypeAttributes.fulfilled, (state, action) => {
        state.categoryAttributes = action.payload.data || [];
      });
  },
});
export default attributesSlice.reducer;
