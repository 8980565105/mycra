import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";
import { ROUTES } from "../../services/routes";

export const fetchWallet = createAsyncThunk(
  "wallet/fetchWallet",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get(ROUTES.wallet.getBalance);
      return res.data.wallet;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Wallet load na thayu",
      );
    }
  },
);

export const addMoneyToWallet = createAsyncThunk(
  "wallet/addMoney",
  async (
    { amount, paymentMode }: { amount: number; paymentMode: string },
    { rejectWithValue },
  ) => {
    try {
      const res = await api.post(ROUTES.wallet.addMoney, {
        amount,
        paymentMode,
      });
      return res.data;
    } catch (error: any) {
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
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "KYC verify na thayu",
      );
    }
  },
);

interface FetchWalletsParams {
  page?: number;
  limit?: number;
  search?: string;
}

export const fetchAllWallets = createAsyncThunk(
  "wallet/fetchAllWallets",
  async (params: FetchWalletsParams, { rejectWithValue }) => {
    try {
      const res = await api.get(ROUTES.wallet.adminAll, { params });
      return res.data; 
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Wallets load na thaya",
      );
    }
  },
);

export const adminAdjustBalance = createAsyncThunk(
  "wallet/adminAdjustBalance",
  async (
    {
      userId,
      amount,
      type,
      reason,
    }: {
      userId: string;
      amount: number;
      type: "credit" | "debit";
      reason?: string;
    },
    { rejectWithValue },
  ) => {
    try {
      const res = await api.put(ROUTES.wallet.adminAdjust(userId), {
        amount,
        type,
        reason,
      });
      return res.data; 
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Balance adjust na thayu",
      );
    }
  },
);

export const adminVerifyKyc = createAsyncThunk(
  "wallet/adminVerifyKyc",
  async (userId: string, { rejectWithValue }) => {
    try {
      const res = await api.put(ROUTES.wallet.adminVerifyKyc(userId));
      return res.data.wallet;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "KYC verify na thayu",
      );
    }
  },
);

export const adminSetKycData = createAsyncThunk(
  "wallet/adminSetKycData",
  async (
    {
      userId,
      mobile,
      pan,
      nameOnPan,
      dob,
      aadhaar,
    }: {
      userId: string;
      mobile: string;
      pan: string;
      nameOnPan: string;
      dob: string;
      aadhaar: string;
    },
    { rejectWithValue },
  ) => {
    try {
      const res = await api.put(ROUTES.kyc.adminSet(userId), {
        mobile,
        pan,
        nameOnPan,
        dob,
        aadhaar,
      });
      return res.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "KYC record set na thayu",
      );
    }
  },
);

export const validatePan = createAsyncThunk(
  "wallet/validatePan",
  async (
    {
      mobile,
      pan,
      nameOnPan,
      dob,
    }: {
      mobile: string;
      pan: string;
      nameOnPan: string;
      dob: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const res = await api.post(ROUTES.kyc.validatePan, {
        mobile,
        pan,
        nameOnPan,
        dob,
      });
      return res.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "PAN Validation failed"
      );
    }
  }
);

export const generateOtp = createAsyncThunk(
  "wallet/generateOtp",
  async (
    {
      aadhaar,
    }: {
      aadhaar: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const res = await api.post(ROUTES.kyc.generateOtp, {
        aadhaar,
      });
      return res.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to generate OTP"
      );
    }
  }
);

export const verifyOtp = createAsyncThunk(
  "wallet/verifyOtp",
  async (
    {
      otp,
    }: {
      otp: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const res = await api.post(ROUTES.kyc.verifyOtp, {
        otp,
      });
      return res.data; 
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "OTP verification failed"
      );
    }
  }
);

