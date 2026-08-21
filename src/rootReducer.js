import authReducer from "./features/auth/authSlice";
import userReducer from "./features/user/userSlice";
import navbarReducer from "./features/navbar/navbarSlice";
import footerReducer from "./features/footer/footerSlice";
import productsReducer from "./features/products/productsSlice";
import couponsReducer from "./features/coupons/couponsSlice";
import categoriesReducer from "./features/categories/categoriesSlice";
import subcategoriesReducer from "./features/subcategories/subcategoriesSlice";
import pagesReducer from "./features/pages/pagesSlice";
import typesReducer from "./features/types/typesSlice";
import productLabelsReducer from "./features/productLabels/productLabelsSlice";
import wishlistReducer from "./features/wishlist/wishlistSlice";
import cartReducer from "./features/cart/cartSlice";
import orderReducer from "./features/orders/orderSlice";
import paymentReducer from "./features/payments/paymentSlice";
import contactReducer from "./features/contact/contactSlice";
import reviewsReducer from "./features/reivews/reviewsSlice";
import addressReducer from "./features/address/addressSlice";
import offersReducer from "./features/offers/offersSlice";
import faqsReducer from "./features/faqs/faqsSlice";
import settingReducer from "./features/setting/settingSlice";
import walletReducer from "./features/wallet/walletSlice";
import transectionReducer from "./features/transection/transectionSlice";
import attributeReducer from "./features/attribut/attributSlice";
import childcategoryReducer from "./features/childcategory/childcategorySlice";

export const rootReducer = {
  auth: authReducer,
  user: userReducer,
  navbar: navbarReducer,  
  footer: footerReducer,
  contact: contactReducer,
  products: productsReducer,
  categories: categoriesReducer,
  subcategories: subcategoriesReducer,
  coupons: couponsReducer,
  pages: pagesReducer,
  types: typesReducer,
  productLabels: productLabelsReducer,
  wishlist: wishlistReducer,
  cart: cartReducer,
  orders: orderReducer,
  payments: paymentReducer,
  reviews: reviewsReducer,
  address: addressReducer,
  offers: offersReducer,
  faqs: faqsReducer,
  settings: settingReducer,
  wallet: walletReducer,
  transection: transectionReducer,
  childcategory: childcategoryReducer,
  attributes: attributeReducer,
};
