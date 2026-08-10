export const ROUTES = {
  auth: {
    login: "/auth/login",
    register: "/auth/register",
    me: "/auth/me",
    logout: "/auth/logout",
    forgotPassword: "/auth/forgot-password",
    resetPassword: "/auth/reset-password",
    googleLogin: "/auth/google-login",
    changePassword: "/auth/change-password",
  },
  navbar: {
    getAll: "/navbar",
    getPublic: "/navbar/public",
  },
  footer: {
    getAll: "/footer",
    public: "/footer/public",
  },
  products: {
    getPublic: "/products/public",
    getPublicById: (id) => `/products/public/${id}`,
  },
  categories: {
    getAll: "/categories/public",
  },
  subcategories: {
    getAll: "/subcategories/public",
  },

  pages: {
    getAll: "/pages",
    getById: (id) => `/pages/${id}`,
    getBySlug: (slug) => `/pages/get/${slug}`,
    create: "/pages",
    update: (id) => `/pages/${id}`,
    updateStatus: (id) => `/pages/${id}/status`,
    delete: (id) => `/pages/${id}`,
    bulkDelete: "/pages/bulk-delete",
  },
  types: {
    getAll: "/types",
    getPublic: "/types/public",
  },
  productLabels: {
    getPublic: "/product-labels/Public",
    getAll: "/product-labels",
  },
  wishlist: {
    getAll: "/wishlists",
    addItem: "/wishlists/items",
    removeItem: "/wishlists/items",
    getByUser: (id) => `/wishlists/user/${id}`,
    bulkDelete: "/wishlists/bulk-delete",
  },
  cart: {
    getAll: "/carts",
    getById: (id) => `/carts/${id}`,
    addItem: "/carts/add-item",
    updateItem: "/carts/update-item",
    deleteItem: "/carts/delete-item",
  },
  updatecart: {
    getAll: "/carts",
    getById: (id) => `/carts/${id}`,
    addItem: "/carts/items",
    updateItem: "/carts/items",
    deleteCart: "/carts/items",
  },
  orders: {
    getPublic: "/orders/public",
    getAll: "/orders",
    getById: (id) => `/orders/${id}`,
    deleteById: (id) => `/orders/${id}`,
    getUserOrders: (userId) => `/orders?user=${userId}`,
  },
  payments: {
    getAll: "/payments",
  },
  contact: {
    getAll: "/contact-us",
  },
  user: {
    updateOneProfile: "/users/me",
    updateProfile: (id) => `/users/${id}`,
    addresses: "/users/me/addresses",
    addressById: (id) => `/users/me/addresses/${id}`,
    setDefaultAddress: (id) => `/users/me/addresses/${id}/default`,
  },
  collections: {
    getAll: "/categories",
  },
  coupons: {
    getAll: "/coupons",
    getPublic: "/coupons/public",
    getById: (id) => `/coupons/${id}`,
  },
  faqs: {
    getPublic: "/faqs/public",
    getAll: "/faqs",
    getById: (id) => `/faqs/${id}`,
    getBanner: "/faqs/banner/public",
  },
  about: {
    get: "/about",
    getPublic: "/about/public",
  },
  store: {
    getinfo: "/stores/info",
  },
  settings: {
    public: "/settings/public",
    get: "/settings",
    update: "/settings",
  },
  pageVisit: {
    create: "/page-visit",
  },
  wallet: {
    getBalance: "/wallet/balance",
    addMoney: "/wallet/add-money",
    verifyKyc: "/wallet/verify-kyc",
    adminAll: "/wallet/admin/all",
    adminAdjust: (userId) => `/wallet/admin/adjust/${userId}`,
    adminVerifyKyc: (userId) => `/wallet/admin/verify-kyc/${userId}`,
  },
  kyc: {
    validatePan: "/kyc/validate-pan",
    generateOtp: "/kyc/generate-otp",
    verifyOtp: "/kyc/verify-otp",
  },
  transection: {
    getAll: "/transactions",
    getById: (id) => `/transactions/${id}`,
    adminAll: "/transactions/admin/all",
    adminUpdateStatus: (id) => `/transactions/admin/status/${id}`,
  },
  attribute: {
    getAll: "/attributes",
    getByType: "/attributes/type",
    getBySubCategory: "/attributes/subcategory",
  },
  childcategory: {
    getAll: "child-categories/public"
  }
};
