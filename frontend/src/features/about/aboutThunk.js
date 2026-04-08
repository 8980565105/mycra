import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";
import { ROUTES } from "../../services/routes";

export const fetchPublicAboutPage = createAsyncThunk(
  "about/fetchPublic",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get(ROUTES.about.getPublic);
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Failed to fetch about page");
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);

export const fetchAdminAboutPage = createAsyncThunk(
  "about/fetchAdmin",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get(ROUTES.about.getAdmin);
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Failed to fetch about page");
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);

export const saveAboutPage = createAsyncThunk(
  "about/save",
  async (payload, { rejectWithValue }) => {
    try {
      const { contentImages = {}, ...rest } = payload;
      const fd = new FormData();

      ["heroTitle", "heroDesc", "storeId"].forEach((k) => {
        if (rest[k] !== undefined) fd.append(k, rest[k]);
      });

      if (rest.heroImage instanceof File) {
        fd.append("heroImage", rest.heroImage);
      } else if (rest.heroImage) {
        fd.append("heroImage", rest.heroImage);
      }

      fd.append("content", JSON.stringify(rest.content || []));

      Object.entries(contentImages).forEach(([idx, file]) => {
        if (file) fd.append(`contentImage_${idx}`, file);
      });

      fd.append("features", JSON.stringify(rest.features || []));

      const res = await api.post(ROUTES.about.save, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Failed to save about page");
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);

export const updateHero = createAsyncThunk(
  "about/updateHero",
  async (payload, { rejectWithValue }) => {
    try {
      const fd = new FormData();
      fd.append("heroTitle", payload.heroTitle || "");
      fd.append("heroDesc", payload.heroDesc || "");
      if (payload.storeId) fd.append("storeId", payload.storeId);
      if (payload.heroImage instanceof File) {
        fd.append("heroImage", payload.heroImage);
      } else if (payload.heroImage) {
        fd.append("heroImage", payload.heroImage);
      }

      const res = await api.put(ROUTES.about.updateHero, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Failed to update hero");
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);

export const addContentItem = createAsyncThunk(
  "about/addContent",
  async (payload, { rejectWithValue }) => {
    try {
      const fd = new FormData();
      fd.append("title", payload.title || "");
      fd.append("desc", payload.desc || "");
      fd.append("order", payload.order ?? 0);
      fd.append("status", payload.status || "active");
      if (payload.storeId) fd.append("storeId", payload.storeId);
      if (payload.image instanceof File) fd.append("image", payload.image);

      const res = await api.post(ROUTES.about.addContent, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Failed to add content item");
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);

export const updateContentItem = createAsyncThunk(
  "about/updateContent",
  async (payload, { rejectWithValue }) => {
    try {
      const { itemId, ...rest } = payload;
      const fd = new FormData();
      fd.append("title", rest.title || "");
      fd.append("desc", rest.desc || "");
      fd.append("order", rest.order ?? 0);
      fd.append("status", rest.status || "active");
      if (rest.storeId) fd.append("storeId", rest.storeId);
      if (rest.image instanceof File) fd.append("image", rest.image);
      else if (rest.image) fd.append("image", rest.image);

      const res = await api.put(ROUTES.about.updateContent(itemId), fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.success) return res.data.data;
      return rejectWithValue(
        res.data.message || "Failed to update content item",
      );
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);

export const updateContentStatus = createAsyncThunk(
  "about/updateContentStatus",
  async ({ itemId, status }, { rejectWithValue }) => {
    try {
      const res = await api.put(ROUTES.about.updateContentStatus(itemId), {
        status,
      });
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Failed to update status");
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);

export const deleteContentItem = createAsyncThunk(
  "about/deleteContent",
  async ({ itemId, storeId }, { rejectWithValue }) => {
    try {
      const params = storeId ? { storeId } : {};
      const res = await api.delete(ROUTES.about.deleteContent(itemId), {
        params,
      });
      if (res.data.success) return res.data.data;
      return rejectWithValue(
        res.data.message || "Failed to delete content item",
      );
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);

export const addFeature = createAsyncThunk(
  "about/addFeature",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await api.post(ROUTES.about.addFeature, payload);
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Failed to add feature");
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);

export const updateFeature = createAsyncThunk(
  "about/updateFeature",
  async ({ featureId, ...rest }, { rejectWithValue }) => {
    try {
      const res = await api.put(ROUTES.about.updateFeature(featureId), rest);
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Failed to update feature");
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);

export const deleteFeature = createAsyncThunk(
  "about/deleteFeature",
  async ({ featureId, storeId }, { rejectWithValue }) => {
    try {
      const params = storeId ? { storeId } : {};
      const res = await api.delete(ROUTES.about.deleteFeature(featureId), {
        params,
      });
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Failed to delete feature");
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);
