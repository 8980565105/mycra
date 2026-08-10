// import { createAsyncThunk } from "@reduxjs/toolkit";
// import api from "../../services/api";
// import { ROUTES } from "../../services/routes";

// export const fetchBusinesses = createAsyncThunk(
//   "business/fetchBusinesses",
//   async (
//     params: {
//       page?: number;
//       limit?: number;
//       search?: string;
//       isDownload?: boolean;
//       status?: "active" | "inactive";
//       role?: string;
//       store?: string;
//     } = {},
//     { rejectWithValue },
//   ) => {
//     try {
//       const { isDownload = false, ...query } = params;
//       const res = await api.get(ROUTES.business.getAll, {
//         params: { ...query, isDownload },
//       });
//       if (res.data.success) return res.data.data;
//       return rejectWithValue(res.data.message || "Failed to fetch businesses");
//     } catch (err: any) {
//       return rejectWithValue(err.response?.data?.message || "Server Error");
//     }
//   },
// );

// export const getBusinessById = createAsyncThunk(
//   "business/getBusinessById",
//   async (id: string, { rejectWithValue }) => {
//     try {
//       const res = await api.get(ROUTES.business.getById(id));
//       if (res.data.success) return res.data.data;
//       return rejectWithValue(res.data.message || "Business not found");
//     } catch (err: any) {
//       return rejectWithValue(err.response?.data?.message || "Server Error");
//     }
//   },
// );

// export const createBusiness = createAsyncThunk(
//   "business/createBusiness",
//   async (data: any, { rejectWithValue }) => {
//     try {
//       const res = await api.post(ROUTES.business.create, data);
//       if (res.data.success) return res.data.data;
//       return rejectWithValue(res.data.message || "Failed to create business");
//     } catch (err: any) {
//       return rejectWithValue(err.response?.data?.message || "Server Error");
//     }
//   },
// );

// export const updateBusiness = createAsyncThunk(
//   "business/updateBusiness",
//   async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
//     try {
//       const res = await api.put(ROUTES.business.update(id), data);
//       if (res.data.success) return res.data.data;
//       return rejectWithValue(res.data.message || "Failed to update business");
//     } catch (err: any) {
//       return rejectWithValue(err.response?.data?.message || "Server Error");
//     }
//   },
// );

// export const updateBusinessStatus = createAsyncThunk(
//   "business/updateBusinessStatus",
//   async (
//     { id, status }: { id: string; status: "active" | "inactive" },
//     { rejectWithValue },
//   ) => {
//     try {
//       const res = await api.put(ROUTES.business.updateStatus(id), { status });
//       if (res.data.success) return res.data.data;
//       return rejectWithValue(res.data.message || "Failed to update status");
//     } catch (err: any) {
//       return rejectWithValue(err.response?.data?.message || "Server Error");
//     }
//   },
// );

// export const deleteBusiness = createAsyncThunk(
//   "business/deleteBusiness",
//   async (id: string, { rejectWithValue }) => {
//     try {
//       const res = await api.delete(ROUTES.business.delete(id));
//       if (res.data.success) return id;
//       return rejectWithValue(res.data.message || "Failed to delete business");
//     } catch (err: any) {
//       return rejectWithValue(err.response?.data?.message || "Server Error");
//     }
//   },
// );

// export const bulkDeleteBusinesses = createAsyncThunk(
//   "business/bulkDeleteBusinesses",
//   async (ids: string[], { rejectWithValue }) => {
//     try {
//       const res = await api.post(ROUTES.business.bulkDelete, { ids });
//       if (res.data.success) return ids;
//       return rejectWithValue(res.data.message || "Failed to delete businesses");
//     } catch (err: any) {
//       return rejectWithValue(err.response?.data?.message || "Server Error");
//     }
//   },
// );

// export const fetchActiveBusinesses = createAsyncThunk(
//   "business/fetchActiveBusinesses",
//   async (_, { rejectWithValue }) => {
//     try {
//       const res = await api.get(ROUTES.business.getActiveList);
//       if (res.data.success) return res.data.data.businesses;
//       return rejectWithValue(res.data.message || "Failed to fetch businesses");
//     } catch (err: any) {
//       return rejectWithValue(err.response?.data?.message || "Server Error");
//     }
//   },
// );
