import authReducer from "./features/auth/authSlice";
import productsReducer from "./features/products/productsSlice";
import categoriesReducer from "./features/categories/categoriesSlice";
import typesReducer from "./features/types/typesSlice";
import productLabelsReducer from "./features/productLabels/productLabelsSlice";
import couponsReducer from "./features/coupons/couponsSlice";
import ordersReducer from "./features/orders/ordersSlice";
import paymentsReducer from "./features/payments/paymentsSlice";
import usersReducer from "./features/users/usersSlice";
import customerReviewsReducer from "./features/customerReviews/customerReviewsSlice";
import cartsReducer from "./features/carts/cartSlice";
import wishlistsReducer from "./features/wishlists/wishlistSlice";
import contactUsReducer from "./features/contactUs/contactUsSlice";
import navbarReducer from "./features/navbar/navbarSlice";
import footerReducer from "./features/footer/footerSlice";
import profileReducer from "./features/profile/profileSlice";
import settingReducer from "./features/settings/settingsSlice";
import storesReducer from "./features/stores/storeSlice";
import pagesReducer from "./features/pages/pagesSlice";
import dashboardReducer from "./features/dashboard/dashboardSlice";
import warehouseReducer from "./features/warehouse/warehouseSlice";
import subcategoriReducer from "./features/subcategories/subcategoriesSlice";
// import faqsReducer from "./features/faqs/faqsSlice";
import walletReducer from "./features/wallets/walletsSlice";
// import businessReducer from "./features/Business/businessSlice";
import policyPagesReducer from "./features/Policypages/policypagesslice";
import attributesReducer from "./features/attributes/attributesSlice";
import brandsReducer from "./features/brands/brandsSlice";
import childCategoriesReducer from "./features/childCategories/childCategoriesSlice";
import emailReducer from "./features/Email/emailSlice"

export const rootReducer = {
  auth: authReducer,
  products: productsReducer,
  warehouse: warehouseReducer,
  brands: brandsReducer,
  categories: categoriesReducer,
  subcategori: subcategoriReducer,
  childCategories: childCategoriesReducer,
  types: typesReducer,
  productLabels: productLabelsReducer,
  attributes: attributesReducer,
  coupons: couponsReducer,
  orders: ordersReducer,
  payments: paymentsReducer,
  users: usersReducer,
  customerReviews: customerReviewsReducer,
  carts: cartsReducer,
  wishlists: wishlistsReducer,
  contactUs: contactUsReducer,
  pages: pagesReducer,
  navbar: navbarReducer,
  footer: footerReducer,
  profile: profileReducer,
  setting: settingReducer,
  stores: storesReducer,
  dashboard: dashboardReducer,
  // faqs: faqsReducer,
  wallet: walletReducer,
  policyPages: policyPagesReducer,
   emails: emailReducer,
  // business: businessReducer,
};
