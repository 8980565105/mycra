import { createSlice } from "@reduxjs/toolkit";
import {
  fetchAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from "./addressThunk";

const initialState = {
  addresses: [],
  loading: false,
  error: null,
  successMessage: null,
};

const addressSlice = createSlice({
  name: "address",
  initialState,
  reducers: {
    clearAddressStatus(state) {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    const pending = (state) => {
      state.loading = true;
      state.error = null;
    };
    const rejected = (state, action) => {
      state.loading = false;
      state.error = action.payload;
    };

    builder
      .addCase(fetchAddresses.pending, pending)
      .addCase(fetchAddresses.fulfilled, (state, action) => {
        state.loading = false;
        state.addresses = action.payload || [];
      })
      .addCase(fetchAddresses.rejected, rejected)

      .addCase(addAddress.pending, pending)
      .addCase(addAddress.fulfilled, (state, action) => {
        state.loading = false;
        state.addresses = action.payload || [];
        state.successMessage = "Address added successfully!";
      })
      .addCase(addAddress.rejected, rejected)

      .addCase(updateAddress.pending, pending)
      .addCase(updateAddress.fulfilled, (state, action) => {
        state.loading = false;
        state.addresses = action.payload || [];
        state.successMessage = "Address updated successfully!";
      })
      .addCase(updateAddress.rejected, rejected)

      .addCase(deleteAddress.pending, pending)
      .addCase(deleteAddress.fulfilled, (state, action) => {
        state.loading = false;
        state.addresses = action.payload || [];
        state.successMessage = "Address deleted";
      })
      .addCase(deleteAddress.rejected, rejected)

      .addCase(setDefaultAddress.pending, pending)
      .addCase(setDefaultAddress.fulfilled, (state, action) => {
        state.loading = false;
        state.addresses = action.payload || [];
        state.successMessage = "Default address updated";
      })
      .addCase(setDefaultAddress.rejected, rejected);
  },
});

export const { clearAddressStatus } = addressSlice.actions;
export default addressSlice.reducer;