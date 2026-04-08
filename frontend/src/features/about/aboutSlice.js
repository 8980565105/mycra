import { createSlice } from "@reduxjs/toolkit";
import {
  fetchPublicAboutPage,
  fetchAdminAboutPage,
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

const initialState = {
  page: null,
  loading: false,
  saving: false,
  error: null,
  successMsg: null,
};

const aboutSlice = createSlice({
  name: "about",
  initialState,
  reducers: {
    clearAboutMessages(state) {
      state.error = null;
      state.successMsg = null;
    },
  },
  extraReducers: (builder) => {
    const startLoading = (state) => {
      state.loading = true;
      state.error = null;
    };
    const startSaving = (state) => {
      state.saving = true;
      state.error = null;
    };
    const setPage = (state, { payload }) => {
      state.loading = false;
      state.saving = false;
      state.page = payload?.data ?? payload ?? null;
      state.successMsg = payload?.message ?? null;
    };
    const setError = (state, { payload }) => {
      state.loading = false;
      state.saving = false;
      state.error = payload;
    };

    builder
      .addCase(fetchPublicAboutPage.pending, startLoading)
      .addCase(fetchPublicAboutPage.fulfilled, setPage)
      .addCase(fetchPublicAboutPage.rejected, setError)

      .addCase(fetchAdminAboutPage.pending, startLoading)
      .addCase(fetchAdminAboutPage.fulfilled, setPage)
      .addCase(fetchAdminAboutPage.rejected, setError)

      .addCase(saveAboutPage.pending, startSaving)
      .addCase(saveAboutPage.fulfilled, setPage)
      .addCase(saveAboutPage.rejected, setError)

      .addCase(updateHero.pending, startSaving)
      .addCase(updateHero.fulfilled, setPage)
      .addCase(updateHero.rejected, setError)

      .addCase(addContentItem.pending, startSaving)
      .addCase(addContentItem.fulfilled, setPage)
      .addCase(addContentItem.rejected, setError)

      .addCase(updateContentItem.pending, startSaving)
      .addCase(updateContentItem.fulfilled, setPage)
      .addCase(updateContentItem.rejected, setError)

      .addCase(updateContentStatus.pending, startSaving)
      .addCase(updateContentStatus.fulfilled, setPage)
      .addCase(updateContentStatus.rejected, setError)

      .addCase(deleteContentItem.pending, startSaving)
      .addCase(deleteContentItem.fulfilled, setPage)
      .addCase(deleteContentItem.rejected, setError)

      .addCase(addFeature.pending, startSaving)
      .addCase(addFeature.fulfilled, setPage)
      .addCase(addFeature.rejected, setError)

      .addCase(updateFeature.pending, startSaving)
      .addCase(updateFeature.fulfilled, setPage)
      .addCase(updateFeature.rejected, setError)

      .addCase(deleteFeature.pending, startSaving)
      .addCase(deleteFeature.fulfilled, setPage)
      .addCase(deleteFeature.rejected, setError);
  },
});

export const { clearAboutMessages } = aboutSlice.actions;
export default aboutSlice.reducer;
