// storeSlice.ts
import { createSlice } from "@reduxjs/toolkit";
import {
  fetchStores,
  getStoreById,
  createStore,
  updateStore,
  deleteStore,
  bulkDeleteStores,
} from "./storesThunk";

interface Store {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  website?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    country: string;
    zip_code: string;
  };
  assignedName?:string;
  status?: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
}

interface StoresState {
  stores: Store[];
  total: number;
  loading: boolean;
  error: string | null;
}

const initialState: StoresState = {
  stores: [],
  total: 0,
  loading: false,
  error: null,
};

const storesSlice = createSlice({
  name: "stores",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch all
      .addCase(fetchStores.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStores.fulfilled, (state, action) => {
        state.loading = false;
        state.stores = action.payload.stores;
        state.total = action.payload.total;
      })
      .addCase(fetchStores.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Get by ID
      .addCase(getStoreById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getStoreById.fulfilled, (state, action) => {
        state.loading = false;
        // Optionally, you can update the store in the list if needed
      })
      .addCase(getStoreById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Create
      .addCase(createStore.fulfilled, (state, action) => {
        state.stores.unshift(action.payload);
        state.total += 1;
      })

      // Update
      .addCase(updateStore.fulfilled, (state, action) => {
        const index = state.stores.findIndex((s) => s._id === action.payload._id);
        if (index !== -1) state.stores[index] = action.payload;
      })

      // Delete
      .addCase(deleteStore.fulfilled, (state, action) => {
        state.stores = state.stores.filter((s) => s._id !== action.payload);
        state.total -= 1;
      })

      // Bulk Delete
      .addCase(bulkDeleteStores.fulfilled, (state, action) => {
        state.stores = state.stores.filter((s) => !action.payload.includes(s._id));
        state.total -= action.payload.length;
      });
  },
});

export default storesSlice.reducer;
