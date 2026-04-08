import { createSlice } from "@reduxjs/toolkit";
import {
  fetchAboutPage,
  fetchPublicAboutPage,
  saveAboutPage,
  updateHero,
  addContentItem,
  updateContentItem,
  updateContentStatus,
  deleteContentItem,
  addFeature,
  updateFeature,
  deleteFeature,
} from "./aboutThunk";

export interface ContentItem {
  _id: string;
  title: string;
  desc?: string;
  image?: string;
  order: number;
  status: "active" | "inactive";
}

export interface Feature {
  _id: string;
  icon: string;
  title: string;
  desc: string;
  order: number;
}

export interface AboutPageState {
  heroTitle: string;
  heroDesc: string;
  heroImage: string;
  content: ContentItem[];
  features: Feature[];
  loading: boolean;
  saving: boolean;
  error: string | null;
}

const initialState: AboutPageState = {
  heroTitle: "",
  heroDesc: "",
  heroImage: "",
  content: [],
  features: [],
  loading: false,
  saving: false,
  error: null,
};

const applyPage = (state: AboutPageState, data: any) => {
  state.heroTitle = data?.heroTitle ?? "";
  state.heroDesc = data?.heroDesc ?? "";
  state.heroImage = data?.heroImage ?? "";
  state.content = data?.content ?? [];
  state.features = data?.features ?? [];
};

const aboutSlice = createSlice({
  name: "aboutPage",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchAboutPage.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchAboutPage.fulfilled, (state, action) => {
      state.loading = false;
      applyPage(state, action.payload);
    });
    builder.addCase(fetchAboutPage.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    builder.addCase(fetchPublicAboutPage.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchPublicAboutPage.fulfilled, (state, action) => {
      state.loading = false;
      applyPage(state, action.payload);
    });
    builder.addCase(fetchPublicAboutPage.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    builder.addCase(saveAboutPage.pending, (state) => {
      state.saving = true;
      state.error = null;
    });
    builder.addCase(saveAboutPage.fulfilled, (state, action) => {
      state.saving = false;
      applyPage(state, action.payload);
    });
    builder.addCase(saveAboutPage.rejected, (state, action) => {
      state.saving = false;
      state.error = action.payload as string;
    });

    builder.addCase(updateHero.pending, (state) => {
      state.saving = true;
      state.error = null;
    });
    builder.addCase(updateHero.fulfilled, (state, action) => {
      state.saving = false;
      state.heroTitle = action.payload?.heroTitle ?? "";
      state.heroDesc = action.payload?.heroDesc ?? "";
      state.heroImage = action.payload?.heroImage ?? "";
    });
    builder.addCase(updateHero.rejected, (state, action) => {
      state.saving = false;
      state.error = action.payload as string;
    });

    builder.addCase(addContentItem.fulfilled, (state, action) => {
      state.content = action.payload?.content ?? state.content;
    });
    builder.addCase(updateContentItem.fulfilled, (state, action) => {
      state.content = action.payload?.content ?? state.content;
    });
    builder.addCase(updateContentStatus.fulfilled, (state, action) => {
      state.content = action.payload?.content ?? state.content;
    });
    builder.addCase(deleteContentItem.fulfilled, (state, action) => {
      state.content = action.payload?.content ?? state.content;
    });

    builder.addCase(addFeature.fulfilled, (state, action) => {
      state.features = action.payload?.features ?? state.features;
    });
    builder.addCase(updateFeature.fulfilled, (state, action) => {
      state.features = action.payload?.features ?? state.features;
    });
    builder.addCase(deleteFeature.fulfilled, (state, action) => {
      state.features = action.payload?.features ?? state.features;
    });
  },
});

export default aboutSlice.reducer;
