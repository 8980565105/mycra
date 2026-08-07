import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";
import { ROUTES } from "../../services/routes";

export const fetchAttributes = createAsyncThunk(
  "attributes/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get(ROUTES.attribute.getAll);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch attributes",
      );
    }
  },
);

export const fetchTypeAttributes = createAsyncThunk(
  "attributes/fetchTypeAttributes",
  async (typeIdOrIds, { rejectWithValue }) => {
    try {
      if (Array.isArray(typeIdOrIds)) {
        const promises = typeIdOrIds.map((id) =>
          api.get(`${ROUTES.attribute.getByType}/${id}`)
        );
        const responses = await Promise.all(promises);
        const combined = [];
        const seenIds = new Set();

        responses.forEach((res) => {
          const list = res.data?.data || [];
          list.forEach((attr) => {
            if (attr._id && !seenIds.has(attr._id)) {
              seenIds.add(attr._id);
              combined.push(attr);
            }
          });
        });

        return combined;
      } else {
        const res = await api.get(`${ROUTES.attribute.getByType}/${typeIdOrIds}`);
        return res.data.data;
      }
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch type attributes"
      );
    }
  }
);

export const fetchSubCategoryAttributes = createAsyncThunk(
  "attributes/fetchSubCategoryAttributes",
  async (subcategoryId, { rejectWithValue }) => {
    try {
      const res = await api.get(
        `${ROUTES.attribute.getBySubCategory}/${subcategoryId}`,
      );

      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch subcategory attributes",
      );
    }
  },
);
