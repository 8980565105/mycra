import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  fetchSettlements,
  withdrawSettlement,
  processAvailableSettlements,
  markSettlementProcessing,
  markSettlementPaid,
  markSettlementFailed,
} from "./settlementsThunk";

export interface SettlementState {
  settlements: any[];
  pagination: any;
  loading: boolean;
  error: string | null;
}

const initialState: SettlementState = {
  settlements: [],
  pagination: {},
  loading: false,
  error: null,
};

const settlementsSlice = createSlice({
  name: "settlements",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchSettlements.fulfilled, (state, action) => {
      state.settlements = action.payload.data || action.payload;
      state.pagination = action.payload.pagination || {};
      state.error = null;
    });
    builder.addCase(fetchSettlements.rejected, (state, action) => {
      state.error = action.payload as string;
    });

    builder.addCase(withdrawSettlement.fulfilled, (state, action) => {
      const updatedSettlement = action.payload;
      state.settlements = state.settlements.map((settlement) =>
        settlement._id === updatedSettlement._id
          ? updatedSettlement
          : settlement
      );
      state.error = null;
    });
    builder.addCase(withdrawSettlement.rejected, (state, action) => {
      state.error = action.payload as string;
    });

    builder.addCase(processAvailableSettlements.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(
      processAvailableSettlements.fulfilled,
      (state, action: PayloadAction<any>) => {
        state.loading = false;
        const { settlements, pagination } = action.payload;
        state.settlements = settlements;
        state.pagination = pagination;
        state.error = null;
      }
    );
    builder.addCase(
      processAvailableSettlements.rejected,
      (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      }
    );

    builder.addCase(markSettlementProcessing.fulfilled, (state, action) => {
      const updatedSettlement = action.payload;
      state.settlements = state.settlements.map((settlement) =>
        settlement._id === updatedSettlement._id
          ? updatedSettlement
          : settlement
      );
      state.error = null;
    });
    builder.addCase(markSettlementProcessing.rejected, (state, action) => {
      state.error = action.payload as string;
    });

    builder.addCase(markSettlementPaid.fulfilled, (state, action) => {
      const updatedSettlement = action.payload;
      state.settlements = state.settlements.map((settlement) =>
        settlement._id === updatedSettlement._id
          ? updatedSettlement
          : settlement
      );
      state.error = null;
    });
    builder.addCase(markSettlementPaid.rejected, (state, action) => {
      state.error = action.payload as string;
    });

    builder.addCase(markSettlementFailed.fulfilled, (state, action) => {
      const updatedSettlement = action.payload;
      state.settlements = state.settlements.map((settlement) =>
        settlement._id === updatedSettlement._id
          ? updatedSettlement
          : settlement
      );
      state.error = null;
    });
    builder.addCase(markSettlementFailed.rejected, (state, action) => {
      state.error = action.payload as string;
    });
  },
});

export default settlementsSlice.reducer;