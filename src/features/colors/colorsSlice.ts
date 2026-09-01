// import { createSlice } from "@reduxjs/toolkit";
// import {
//   fetchColors,
//   createColor,
//   updateColor,
//   deleteColor,
//   bulkDeleteColors,
//   updateColorStatus,
// } from "./colorsThunk";

// interface Color {
//   _id: string;
//   name: string;
//   code?: string;
//   status: string;
//   createdAt: string;
//   updatedAt: string;
// }

// interface ColorsState {
//   colors: Color[];
//   total: number;
//   loading: boolean;
//   error: string | null;
// }

// const initialState: ColorsState = {
//   colors: [],
//   total: 0,
//   loading: false,
//   error: null,
// };

// const colorsSlice = createSlice({
//   name: "colors",
//   initialState,
//   reducers: {},
//   extraReducers: (builder) => {
//     builder
//       .addCase(fetchColors.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchColors.fulfilled, (state, action) => {
//         state.loading = false;
//         state.colors = action.payload.colors;
//         state.total = action.payload.total;
//       })
//       .addCase(fetchColors.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload as string;
//       })
//       .addCase(createColor.fulfilled, (state, action) => {
//         state.colors.unshift(action.payload);
//         state.total += 1;
//       })
//       .addCase(updateColor.fulfilled, (state, action) => {
//         const index = state.colors.findIndex(
//           (c) => c._id === action.payload._id
//         );
//         if (index !== -1) state.colors[index] = action.payload;
//       })
//       .addCase(updateColorStatus.fulfilled, (state, action) => {
//         const index = state.colors.findIndex(
//           (c) => c._id === action.payload._id
//         );
//         if (index !== -1) {
//           state.colors[index] = action.payload;
//         }
//       })
//       .addCase(deleteColor.fulfilled, (state, action) => {
//         state.colors = state.colors.filter((c) => c._id !== action.payload);
//         state.total -= 1;
//       })
//       .addCase(bulkDeleteColors.fulfilled, (state, action) => {
//         state.colors = state.colors.filter(
//           (c) => !action.payload.includes(c._id)
//         );
//         state.total -= action.payload.length;
//       });
//   },
// });

// export default colorsSlice.reducer;
