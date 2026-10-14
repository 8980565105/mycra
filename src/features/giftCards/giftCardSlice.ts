import { createSlice } from "@reduxjs/toolkit";

import {
  adminCreateGiftCard,
  adminGetAllGiftCards,
  adminGetAllPurchasedGiftCards,
  getGiftCardProducts,
  adminCreateGiftCardProduct,
  adminGetAllGiftCardProducts,
  adminUpdateGiftCardProduct,
} from "./giftCardThunk";

export interface GiftCard {
  _id?: string;
  cardNumber?: string;
  pin?: string;
  originalAmount: number;
  remainingBalance: number;
  status: string;
  assignedTo?: string;
  recipientName?: string;
  recipientEmail?: string;
  expiresAt?: string | null;
  source?: string;
  recordType?: "Product" | "Issued";
  createdAt?: string;
}

export interface GiftCardProduct {
  _id: string;
  productName: string;
  productDescription?: string;
  productImage?: string;
  amount?: number;
  originalAmount?: number;
  isPurchaseEnabled?: boolean;
  productExpiresAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

interface GiftCardState {
  giftCards: GiftCard[];
  createdGiftCard: GiftCard | null;
  loading: boolean;
  error: string | null;
  adminProducts: GiftCardProduct[];
  productsLoading: boolean;
  productsError: string | null;
  createProductLoading: boolean;
  createProductError: string | null;
  createdProduct: GiftCardProduct | null;
  updateProductLoading: boolean;
  updateProductError: string | null;
  purchaseProducts: GiftCardProduct[];
}

const initialState: GiftCardState = {
  giftCards: [],
  createdGiftCard: null,
  loading: false,
  error: null,
  adminProducts: [],
  productsLoading: false,
  productsError: null,
  createProductLoading: false,
  createProductError: null,
  createdProduct: null,
  updateProductLoading: false,
  updateProductError: null,
  purchaseProducts: [],
};

const giftCardSlice = createSlice({
  name: "giftCards",
  initialState,
  reducers: {
    clearGiftCardError: (state) => {
      state.error = null;
    },
    clearCreatedGiftCard: (state) => {
      state.createdGiftCard = null;
    },
    clearCreateProductError: (state) => {
      state.createProductError = null;
    },
    clearProductsError: (state) => {
      state.productsError = null;
    },
    clearUpdateProductError: (state) => {
      state.updateProductError = null;
    },
    clearCreatedProduct: (state) => {
      state.createdProduct = null;
    },
  },

  extraReducers: (builder) => {
    builder

      .addCase(adminCreateGiftCard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(adminCreateGiftCard.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        const giftCard = action.payload?.giftCard || null;
        state.createdGiftCard = giftCard;
        if (giftCard) {
          state.giftCards.unshift(giftCard);
        }
      })
      .addCase(adminCreateGiftCard.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || action.error.message || "Failed to create gift card";
      })

      .addCase(adminGetAllGiftCards.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(adminGetAllGiftCards.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.giftCards = action.payload?.giftCards || [];
      })
      .addCase(adminGetAllGiftCards.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || action.error.message || "Failed to fetch gift cards";
      })

      .addCase(adminGetAllPurchasedGiftCards.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(adminGetAllPurchasedGiftCards.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.giftCards = action.payload || [];
      })
      .addCase(adminGetAllPurchasedGiftCards.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || action.error.message || "Failed to fetch purchased gift cards.";
      })

      .addCase(getGiftCardProducts.pending, (state) => {
        state.productsError = null;
      })
      .addCase(getGiftCardProducts.fulfilled, (state, action) => {
        state.purchaseProducts = action.payload || [];
        state.productsError = null;
      })
      .addCase(getGiftCardProducts.rejected, (state, action) => {
        state.productsError = (action.payload as string) || action.error.message || "Failed to fetch gift card products.";
      })

      .addCase(adminGetAllGiftCardProducts.pending, (state) => {
        state.productsLoading = true;
        state.productsError = null;
      })
      .addCase(adminGetAllGiftCardProducts.fulfilled, (state, action) => {
        state.productsLoading = false;
        state.productsError = null;
        state.adminProducts = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(adminGetAllGiftCardProducts.rejected, (state, action) => {
        state.productsLoading = false;
        state.productsError = (action.payload as string) || action.error.message || "Failed to load gift card products.";
      })

      .addCase(adminCreateGiftCardProduct.pending, (state) => {
        state.createProductLoading = true;
        state.createProductError = null;
        state.createdProduct = null;
      })
      .addCase(adminCreateGiftCardProduct.fulfilled, (state, action) => {
        state.createProductLoading = false;
        state.createProductError = null;
        const product: GiftCardProduct | null = action.payload?.product || null;
        state.createdProduct = product;

        if (product?._id) {
          const alreadyExists = state.adminProducts.some(
            (item) => item._id === product._id
          );

          if (!alreadyExists) {
            state.adminProducts.unshift(product);
          }
          if (product.isPurchaseEnabled) {
            const alreadyPurchasable = state.purchaseProducts.some(
              (item) => item._id === product._id
            );

            if (!alreadyPurchasable) {
              state.purchaseProducts.unshift(product);
            }
          }
        }
      })
      .addCase( adminCreateGiftCardProduct.rejected, (state, action) => {
        state.createProductLoading = false;
        state.createProductError = (action.payload as string) || action.error.message || "Failed to create gift card product.";
      })

      .addCase(adminUpdateGiftCardProduct.pending, (state) => {
        state.updateProductLoading = true;
        state.updateProductError = null;
      })

      .addCase(adminUpdateGiftCardProduct.fulfilled, (state, action) => {
        state.updateProductLoading = false;
        state.updateProductError = null;
        const product: GiftCardProduct | null = action.payload || null;

        if (!product?._id) return;

        const productIndex = state.adminProducts.findIndex(
          (item) => item._id === product._id
        );

        if (productIndex !== -1) {
          state.adminProducts[productIndex] = product;
        } else {
          state.adminProducts.unshift(product);
        }

        const purchaseIndex = state.purchaseProducts.findIndex(
          (item) => item._id === product._id
        );

        if (product.isPurchaseEnabled) {
          if (purchaseIndex !== -1) {
            state.purchaseProducts[purchaseIndex] = product;
          } else {
            state.purchaseProducts.unshift(product);
          }
        } else if (purchaseIndex !== -1) {
          state.purchaseProducts.splice(purchaseIndex, 1);
        }
      })
      .addCase(adminUpdateGiftCardProduct.rejected, (state, action) => {
        state.updateProductLoading = false;
        state.updateProductError = (action.payload as string) || action.error.message || "Failed to update gift card product.";
      });
  },
});

export const {
  clearGiftCardError,
  clearCreatedGiftCard,
  clearCreateProductError,
  clearProductsError,
  clearUpdateProductError,
  clearCreatedProduct,
} = giftCardSlice.actions;

export default giftCardSlice.reducer;
