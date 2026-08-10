import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

export interface ChildCategory {
  _id: string;
  name: string;
  subCategoryId: any;
  status: "active" | "inactive";
  createdAt?: string;
  updatedAt?: string;
}

export interface FetchChildCategoriesParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  subCategoryId?: string;
}

export const fetchChildCategories = createAsyncThunk(
  "childCategories/fetchChildCategories",
  async (params: FetchChildCategoriesParams | undefined, { rejectWithValue }) => {
    try {
      const response = await api.get("/child-categories", { params });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch level 3 categories"
      );
    }
  }
);

export const fetchAllChildCategories = createAsyncThunk(
  "childCategories/fetchAllChildCategories",
  async (subCategoryId: string | undefined, { rejectWithValue }) => {
    try {
      const params = subCategoryId ? { subCategoryId } : {};
      const response = await api.get("/child-categories/all", { params });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch all level 3 categories"
      );
    }
  }
);

export const createChildCategory = createAsyncThunk(
  "childCategories/createChildCategory",
  async (data: { name: string; subCategoryId: string; status?: string }, { rejectWithValue }) => {
    try {
      const response = await api.post("/child-categories", data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create level 3 category"
      );
    }
  }
);

export const updateChildCategory = createAsyncThunk(
  "childCategories/updateChildCategory",
  async (
    { id, data }: { id: string; data: { name: string; subCategoryId: string; status?: string } },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.put(`/child-categories/${id}`, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update level 3 category"
      );
    }
  }
);

export const deleteChildCategory = createAsyncThunk(
  "childCategories/deleteChildCategory",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/child-categories/${id}`);
      return { id, ...response.data };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete level 3 category"
      );
    }
  }
);
