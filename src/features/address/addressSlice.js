// import { createSlice } from "@reduxjs/toolkit";
// import {
//   fetchMyAddress,
//   updateMyAddress,
//   updateUserAddressById,
// } from "./addressThunk";

// const initialState = {
//   address: {
//     street: "",
//     city: "",
//     state: "",
//     country: "",
//     zip_code: "",
//   },
//   loading: false,
//   error: null,
//   successMessage: null,
// };

// const addressSlice = createSlice({
//   name: "address",
//   initialState,
//   reducers: {
//     clearAddressStatus(state) {
//       state.error = null;
//       state.successMessage = null;
//     },
//     resetAddress(state) {
//       state.address = initialState.address;
//       state.error = null;
//       state.successMessage = null;
//     },
//   },
//   extraReducers: (builder) => {
//     builder
//       .addCase(fetchMyAddress.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchMyAddress.fulfilled, (state, action) => {
//         state.loading = false;
//         state.address = action.payload || initialState.address;
//       })
//       .addCase(fetchMyAddress.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       });

//     builder
//       .addCase(updateMyAddress.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//         state.successMessage = null;
//       })
//       .addCase(updateMyAddress.fulfilled, (state, action) => {
//         state.loading = false;
//         state.address = action.payload || initialState.address;
//         state.successMessage = "Address saved successfully!";
//       })
//       .addCase(updateMyAddress.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       });

//     builder
//       .addCase(updateUserAddressById.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//         state.successMessage = null;
//       })
//       .addCase(updateUserAddressById.fulfilled, (state, action) => {
//         state.loading = false;
//         state.address = action.payload || initialState.address;
//         state.successMessage = "Address updated successfully!";
//       })
//       .addCase(updateUserAddressById.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       });
//   },
// });

// export const { clearAddressStatus, resetAddress } = addressSlice.actions;
// export default addressSlice.reducer;


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