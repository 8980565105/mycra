import { createSlice } from "@reduxjs/toolkit";
import {
  fetchPages,
  getPageById,
  createPage,
  updatePage,
  deletePage,
  bulkDeletePages,
  updatePageStatus,
} from "./pagesThunk";

export type Slide = {
  title: string;
  description: string;
  background_image_url: string;
  is_button: boolean;
  button_name: string;
  button_link: string;
  order: number;
};

export type FeatureItem = {
  image_url: string;
  title: string;
  description: string;
  order: number;
};

export type FaqItem = {
  question: string;
  answer: string;
  order: number;
};

export interface Faq1Item {
  category: string;
  question: string;
  answer: string;
  order: number;
}

export interface FaqCategory {
  key: string;
  label: string;
  order: number;
}

export type SectionType = {
  type: "content" | "hero_slider" | "feature" | "banner" | "faqs" | "faqs1";
  title: string;
  description: string;
  image_url?: string;
  background_image_url?: string;
  is_button?: boolean;
  button_name?: string;
  rs?: number;
  button_link?: string;
  order: number;
  status: string;
  slides?: Slide[];
  items?: FeatureItem[];
  faqs?: FaqItem[];
  faqs1?: Faq1Item[];
  faqCategories?: FaqCategory[];
};

interface Page {
  _id: string;
  page_name: string;
  slug: string;
  description?: string;
  sections?: SectionType[];
  meta_title?: string;
  meta_description?: string;
  meta_keyphrase?: string;
  seo_image?: string;
  order?: number;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

interface PagesState {
  pages: Page[];
  total: number;
  loading: boolean;
  error: string | null;
}

const initialState: PagesState = {
  pages: [],
  total: 0,
  loading: false,
  error: null,
};

const pagesSlice = createSlice({
  name: "pages",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPages.fulfilled, (state, action) => {
        state.loading = false;
        state.pages = action.payload.pages;
        state.total = action.payload.total;
      })
      .addCase(fetchPages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(createPage.fulfilled, (state, action) => {
        state.pages.unshift(action.payload);
        state.total += 1;
      })

      .addCase(updatePage.fulfilled, (state, action) => {
        const index = state.pages.findIndex(
          (p) => p._id === action.payload._id,
        );
        if (index !== -1) state.pages[index] = action.payload;
      })

      .addCase(updatePageStatus.fulfilled, (state, action) => {
        const index = state.pages.findIndex(
          (p) => p._id === action.payload._id,
        );
        if (index !== -1) state.pages[index] = action.payload;
      })

      .addCase(deletePage.fulfilled, (state, action) => {
        state.pages = state.pages.filter((p) => p._id !== action.payload);
        state.total -= 1;
      })

      .addCase(bulkDeletePages.fulfilled, (state, action) => {
        state.pages = state.pages.filter(
          (p) => !action.payload.includes(p._id),
        );
        state.total -= action.payload.length;
      });
  },
});

export default pagesSlice.reducer;
