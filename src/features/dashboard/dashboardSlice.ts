import { createSlice } from "@reduxjs/toolkit";
import { fetchDashboard } from "./dashboardThunk";
export interface SalesOverviewItem {
  _id: string;
  revenue: number;
  orders: number;
}
export interface OrdersByStatusItem {
  _id: string;
  count: number;
}
export interface TopSellingProduct {
  name: string;
  quantity: number;
  revenue: number;
}
export interface RecentOrderItem {
  _id: string;
  order_number: string;
  total_price: number;
  status: string;
  createdAt: string;
  user_id: { name: string; email: string };
  items: Array<{
    _id: string;
    product_id: { name: string };
    variant_id: { sku: string; price: number };
    quantity: number;
    price_at_order: number;
  }>;
}
export interface MonthlyStatItem {
  current: number;
  previous: number;
}
export interface MonthlyStats {
  products: MonthlyStatItem;
  orders: MonthlyStatItem;
  users: MonthlyStatItem;
  revenue: MonthlyStatItem;
  coupons: MonthlyStatItem;
}
export interface DashboardData {
  totalProducts: number;
  totalStores: number;
  totalUsers: number;
  totalRevenue: number;
  activeCoupons: number;
  totalCategories: number;
  totalSubCategories: number;
  totalTypes: number;
  totalOrders: number;
  pendingOrders: number;
  refundOrders: number;
  returnOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  salesOverview: SalesOverviewItem[];
  ordersByStatus: OrdersByStatusItem[];
  topSellingProducts: TopSellingProduct[];
  recentOrders: RecentOrderItem[];
  monthlyStats: MonthlyStats;
}
export interface DashboardState extends DashboardData {
  loading: boolean;
  error: string | null;
}

const defaultMonthlyStats: MonthlyStats = {
  products: { current: 0, previous: 0 },
  orders: { current: 0, previous: 0 },
  users: { current: 0, previous: 0 },
  revenue: { current: 0, previous: 0 },
  coupons: { current: 0, previous: 0 },
};

const initialState: DashboardState = {
  totalProducts: 0,
  totalCategories: 0,
  totalSubCategories: 0,
  totalTypes: 0,
  totalOrders: 0,
  pendingOrders: 0,
  refundOrders: 0,
  returnOrders: 0,
  deliveredOrders: 0,
  cancelledOrders: 0,
  totalStores: 0,
  totalUsers: 0,
  totalRevenue: 0,
  activeCoupons: 0,
  salesOverview: [],
  ordersByStatus: [],
  topSellingProducts: [],
  recentOrders: [],
  monthlyStats: defaultMonthlyStats,
  loading: false,
  error: null,
};

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.totalProducts = action.payload.totalProducts ?? 0;
        state.totalCategories = action.payload.totalCategories ?? 0;
        state.totalSubCategories = action.payload.totalSubCategories ?? 0;
        state.totalOrders = action.payload.totalOrders ?? 0;
        state.pendingOrders = action.payload.pendingOrders ?? 0;
        state.refundOrders = action.payload.refundOrders ?? 0;
        state.returnOrders = action.payload.returnOrders ?? 0;
        state.deliveredOrders = action.payload.deliveredOrders ?? 0;
        state.cancelledOrders = action.payload.cancelledOrders ?? 0;
        state.totalStores = action.payload.totalStores ?? 0;
        state.totalUsers = action.payload.totalUsers ?? 0;
        state.totalRevenue = action.payload.totalRevenue ?? 0;
        state.activeCoupons = action.payload.activeCoupons ?? 0;
        state.salesOverview = action.payload.salesOverview ?? [];
        state.ordersByStatus = action.payload.ordersByStatus ?? [];
        state.topSellingProducts = action.payload.topSellingProducts ?? [];
        state.recentOrders = action.payload.recentOrders ?? [];
        state.monthlyStats = action.payload.monthlyStats ?? defaultMonthlyStats;
      })
      .addCase(fetchDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default dashboardSlice.reducer;
