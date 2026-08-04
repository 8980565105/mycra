import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";
import { ROUTES } from "../../services/routes";

export const fetchWallet = createAsyncThunk(
  "wallet/fetchWallet",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get(ROUTES.wallet.getBalance);
      return res.data.wallet;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Wallet load na thayu",
      );
    }
  },
);

export const addMoneyToWallet = createAsyncThunk(
  "wallet/addMoney",
  async ({ amount, paymentMode }, { rejectWithValue }) => {
    try {
      const res = await api.post(ROUTES.wallet.addMoney, {
        amount,
        paymentMode,
      });
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Paisa add na thaya",
      );
    }
  },
);

export const verifyKyc = createAsyncThunk(
  "wallet/verifyKyc",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.post(ROUTES.wallet.verifyKyc);
      return res.data.wallet;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "KYC verify na thayu",
      );
    }
  },
);

export const fetchAllWallets = createAsyncThunk(
  "wallet/fetchAllWallets",
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await api.get(ROUTES.wallet.adminAll, { params });
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Wallets load na thaya",
      );
    }
  },
);

export const adminAdjustBalance = createAsyncThunk(
  "wallet/adminAdjustBalance",
  async ({ userId, amount, type, reason }, { rejectWithValue }) => {
    try {
      const res = await api.put(ROUTES.wallet.adminAdjust(userId), {
        amount,
        type,
        reason,
      });
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Balance adjust na thayu",
      );
    }
  },
);

export const adminVerifyKyc = createAsyncThunk(
  "wallet/adminVerifyKyc",
  async (userId, { rejectWithValue }) => {
    try {
      const res = await api.put(ROUTES.wallet.adminVerifyKyc(userId));
      return res.data.wallet;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "KYC verify na thayu",
      );
    }
  },
);

export const validatePan = createAsyncThunk(
  "wallet/validatePan",
  async ({ mobile, pan, nameOnPan, dob }, { rejectWithValue }) => {
    try {
      const res = await api.post(ROUTES.kyc.validatePan, {
        mobile,
        pan,
        nameOnPan,
        dob,
      });
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "PAN details verify na thaya" },
      );
    }
  },
);

export const generateOtp = createAsyncThunk(
  "wallet/generateOtp",
  async ({ aadhaar }, { rejectWithValue }) => {
    try {
      const res = await api.post(ROUTES.kyc.generateOtp, { aadhaar });
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "OTP send na thayo",
      );
    }
  },
);

export const verifyOtp = createAsyncThunk(
  "wallet/verifyOtp",
  async ({ otp }, { rejectWithValue }) => {
    try {
      const res = await api.post(ROUTES.kyc.verifyOtp, { otp });
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "OTP verification failed",
      );
    }
  },
);

export const redeemGiftCard = createAsyncThunk(
  "wallet/redeemGiftCard",
  async ({ code }, { rejectWithValue }) => {
    try {
      const res = await api.post("/wallet/giftcard/redeem", { code });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);