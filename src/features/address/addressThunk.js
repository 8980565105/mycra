import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";
import { ROUTES } from "../../services/routes";

export const fetchAddresses = createAsyncThunk(
  "address/fetchAddresses",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get(ROUTES.user.addresses);
      return res.data.data; // array of addresses
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch addresses",
      );
    }
  },
);

export const addAddress = createAsyncThunk(
  "address/addAddress",
  async (addressData, { rejectWithValue }) => {
    try {
      const res = await api.post(ROUTES.user.addresses, addressData);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to add address",
      );
    }
  },
);

export const updateAddress = createAsyncThunk(
  "address/updateAddress",
  async ({ addressId, addressData }, { rejectWithValue }) => {
    try {
      const res = await api.put(
        ROUTES.user.addressById(addressId),
        addressData,
      );
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to update address",
      );
    }
  },
);

export const deleteAddress = createAsyncThunk(
  "address/deleteAddress",
  async (addressId, { rejectWithValue }) => {
    try {
      const res = await api.delete(ROUTES.user.addressById(addressId));
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to delete address",
      );
    }
  },
);

export const setDefaultAddress = createAsyncThunk(
  "address/setDefaultAddress",
  async (addressId, { rejectWithValue }) => {
    try {
      const res = await api.put(ROUTES.user.setDefaultAddress(addressId));
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to set default address",
      );
    }
  },
);
