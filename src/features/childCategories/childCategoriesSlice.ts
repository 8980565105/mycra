import { createSlice } from "@reduxjs/toolkit";
import {
  fetchChildCategories,
  fetchAllChildCategories,
  createChildCategory,
  updateChildCategory,
  deleteChildCategory,
  ChildCategory,
} from "./childCategoriesThunk";

interface ChildCategoriesState {
  childCategories: ChildCategory[];
  allChildCategories: ChildCategory[];
  total: number;
  page: number;
  limit: number;
  pages: number;
  loading: boolean;
  error: string | null;
}

const initialState: ChildCategoriesState = {
  childCategories: [],
  allChildCategories: [],
  total: 0,
  page: 1,
  limit: 10,
  pages: 0,
  loading: false,
  error: null,
};

const childCategoriesSlice = createSlice({
  name: "childCategories",
  initialState,
  reducers: {
    clearChildCategoriesError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Paginated
      .addCase(fetchChildCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChildCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.childCategories = action.payload.data;
        if (action.payload.pagination) {
          state.total = action.payload.pagination.total;
          state.page = action.payload.pagination.page;
          state.limit = action.payload.pagination.limit;
          state.pages = action.payload.pagination.pages;
        }
      })
      .addCase(fetchChildCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch All
      .addCase(fetchAllChildCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllChildCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.allChildCategories = action.payload.data;
      })
      .addCase(fetchAllChildCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create
      .addCase(createChildCategory.fulfilled, (state, action) => {
        state.allChildCategories.push(action.payload.data);
      })
      // Update
      .addCase(updateChildCategory.fulfilled, (state, action) => {
        const index = state.childCategories.findIndex((c) => c._id === action.payload.data._id);
        if (index !== -1) {
          state.childCategories[index] = action.payload.data;
        }
      })
      // Delete
      .addCase(deleteChildCategory.fulfilled, (state, action) => {
        state.childCategories = state.childCategories.filter((c) => c._id !== action.payload.id);
        state.allChildCategories = state.allChildCategories.filter((c) => c._id !== action.payload.id);
      });
  },
});

export const { clearChildCategoriesError } = childCategoriesSlice.actions;
export default childCategoriesSlice.reducer;
