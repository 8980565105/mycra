import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

export interface Attribute {
  _id: string;
  name: string;
  code: string;
  inputType: "select" | "multi-select" | "text" | "number";
  status: "active" | "inactive";
  createdAt?: string;
}

export interface AttributeValue {
  _id: string;
  attributeId: string | Attribute;
  value: string;
  colorHex?: string;
  status: "active" | "inactive";
}

export const fetchAttributes = createAsyncThunk(
  "attributes/fetchAttributes",
  async (
    params: {
      page?: number;
      limit?: number;
      search?: string;
      status?: string;
    } = {},
  ) => {
    const response = await api.get("/attributes", { params });
    return response.data;
  },
);

export const createAttribute = createAsyncThunk(
  "attributes/createAttribute",
  async (data: Partial<Attribute>) => {
    const response = await api.post("/attributes", data);
    return response.data;
  },
);

export const updateAttribute = createAsyncThunk(
  "attributes/updateAttribute",
  async ({ id, data }: { id: string; data: Partial<Attribute> }) => {
    const response = await api.put(`/attributes/${id}`, data);
    return response.data;
  },
);

export const deleteAttribute = createAsyncThunk(
  "attributes/deleteAttribute",
  async (id: string) => {
    const response = await api.delete(`/attributes/${id}`);
    return { id, ...response.data };
  },
);

export const fetchAttributeValues = createAsyncThunk(
  "attributes/fetchAttributeValues",
  async (params?: { attributeId?: string; status?: string }) => {
    const response = await api.get("/attributes/values", { params });
    return response.data;
  },
);

export const createAttributeValue = createAsyncThunk(
  "attributes/createAttributeValue",
  async (data: Partial<AttributeValue>) => {
    const response = await api.post("/attributes/values", data);
    return response.data;
  },
);

export const updateAttributeValue = createAsyncThunk(
  "attributes/updateAttributeValue",
  async ({ id, data }: { id: string; data: Partial<AttributeValue> }) => {
    const response = await api.put(`/attributes/values/${id}`, data);
    return response.data;
  },
);

export const deleteAttributeValue = createAsyncThunk(
  "attributes/deleteAttributeValue",
  async (id: string) => {
    const response = await api.delete(`/attributes/values/${id}`);
    return { id, ...response.data };
  },
);

export const fetchCategoryAttributes = createAsyncThunk(
  "attributes/fetchCategoryAttributes",
  async (subcategoryId: string) => {
    const response = await api.get(`/attributes/subcategory/${subcategoryId}`);
    return response.data;
  },
);

export const fetchTypeAttributes = createAsyncThunk(
  "attributes/fetchTypeAttributes",
  async (typeId: string) => {
    try {
      const response = await api.get(`/attributes/type/${typeId}`);
      return response.data;
    } catch {
      const response = await api.get(`/types/${typeId}/attributes`);
      return response.data;
    }
  },
);
