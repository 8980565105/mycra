import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AdminLayout } from "./components/layout/AdminLayout";
import Register from "./pages/Register";
import VelzonDashboard from "./pages/VelzonDashboard";
import Products from "./pages/Products/Products";
import AddProduct from "./pages/Products/AddProduct";
import Users from "./pages/Users/Users";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Categories from "./pages/Categories/Categories";
import Attributes from "./pages/Attributes/Attributes";
import CategoryFormPage from "./pages/Categories/CategoryForm";
import BrandFormPage from "./pages/Brands/BrandFormPage";
import Brands from "./pages/Brands/Brands";
import TypeFormPage from "./pages/Types/TypeForm";
import Types from "./pages/Types/Types";
import ProductLabels from "./pages/ProductLabels/ProductLabels";
import ProductLabelFormPage from "./pages/ProductLabels/ProductLabelForm";
import CouponFormPage from "./pages/coupons/CouponForm";
import CouponsPage from "./pages/coupons/Coupons";
import Orders from "./pages/Orders/Orders";
import Payments from "./pages/Payments/Payments";
import UserFormPage from "./pages/Users/UserForm";
import CustomerReviews from "./pages/CustomerReviews/CustomerReviews";
import Cart from "./pages/carts/carts";
import Wishlist from "./pages/Wishlists/Wishlist";
import ContactUs from "./pages/ContactUs/ContactUs";
import Navbar from "./pages/Navbar/Navbar";
import NavbarFormPage from "./pages/Navbar/NavbarForm";
import Footer from "./pages/Footer/Footer";
import FooterFormPage from "./pages/Footer/FooterForm";
import Settings from "./pages/Settings/Settings";
import Stores from "./pages/Stores/Store";
import StoreFormPage from "./pages/Stores/StoreForm";
import StoreOwnerFormPage from "./pages/StoreOwner/StoreOwnerForm";
import Pages from "./pages/Pages/Pages";
import PageFormPage from "./pages/Pages/PagesForm";
import Warehouse from "./pages/Warehouse/Warehouse";
import WarehouseFormPage from "./pages/Warehouse/WarehouseForm";
import Forgatepassword from "./pages/Forgatepassword";
import Subcategories from "./pages/Subcategories/Subcategories"
import SubCategoryFormPage from "./pages/Subcategories/SubcategoryForm";
import ChildCategories from "./pages/ChildCategories/ChildCategories";
import ChildCategoryFormPage from "./pages/ChildCategories/ChildCategoryForm";
import FaqsFrom from "./pages/Faqs/FaqsFrom";
import Faqspage from "./pages/Faqs/Faqs";
import StoreView from "./pages/Stores/StoreView";
import UserView from "./pages/Users/UserView";
import GustUserHeader from "./components/layout/gustuserheader";
import GuestLayout from "./components/layout/GustLayout";
import Home from "./pages/Gustuser/home";
import UserWallets from "./pages/Wallets/UserWallets";
import WalletsPage from "./pages/Wallets/WalletsPage";
import ContinueWithKyc from "./pages/Wallets/ContinueWithKyc";
import KycForm from "./pages/Wallets/KycForm";
import SellerOnboarding from "./pages/SellerOnboarding";
import SellerApplications from "./pages/Stores/SellerApplications";
import CustomerReviewsFrom from "./pages/CustomerReviews/CustomerReviewsFrom";
import PolicypagesFrom from "./pages/Policypages/PolicypagesFrom";
import Policypages from "./pages/Policypages/Policypages";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<GuestLayout />}>
            <Route index element={<Home />} />
          </Route>
          <Route element={<ProtectedRoute />}>
            <Route element={<GuestLayout />}>
              <Route path="/wallets" element={<WalletsPage />} />
              <Route path="/walletkycintro" element={<ContinueWithKyc />} />
              <Route path="/kycform" element={<KycForm />} />
            </Route>
          </Route>

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/seller/onboarding" element={<SellerOnboarding />} />
          <Route path="/forgate-password" element={<Forgatepassword />}></Route>
          {/* ════════════════════════════════════════════════════════════════
              ADMIN ROUTES   —   prefix: /
          ════════════════════════════════════════════════════════════════ */}
          <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<VelzonDashboard />} />
              <Route path="products" element={<Products />} />
              <Route path="products/add" element={<AddProduct />} />
              <Route path="products/:id/edit" element={<AddProduct />} />
              <Route path="categories" element={<Categories />} />
              <Route path="categories/add" element={<CategoryFormPage />} />
              <Route path="categories/:id/edit" element={<CategoryFormPage />} />
              <Route path="subcategories" element={<Subcategories />} />
              <Route path="subcategories/add" element={<SubCategoryFormPage />} />
              <Route path="subcategories/:id/edit" element={<SubCategoryFormPage />} />
              <Route path="child-categories" element={<ChildCategories />} />
              <Route path="child-categories/add" element={<ChildCategoryFormPage />} />
              <Route path="child-categories/:id/edit" element={<ChildCategoryFormPage />} />
              <Route path="attributes" element={<Attributes />} />
              <Route path="brands" element={<Brands />} />
              <Route path="brands/add" element={<BrandFormPage />} />
              <Route path="brands/:id/edit" element={<BrandFormPage />} />
              <Route path="types" element={<Types />} />
              <Route path="types/add" element={<TypeFormPage />} />
              <Route path="types/:id/edit" element={<TypeFormPage />} />

              <Route path="product-labels" element={<ProductLabels />} />
              <Route path="product-labels/add" element={<ProductLabelFormPage />} />
              <Route path="product-labels/:id/edit" element={<ProductLabelFormPage />} />

              <Route path="coupons" element={<CouponsPage />} />
              <Route path="coupons/add" element={<CouponFormPage />} />
              <Route path="coupons/:id/edit" element={<CouponFormPage />} />
              <Route path="orders" element={<Orders />} />
              <Route path="payments" element={<Payments />} />
              <Route path="warehouse" element={<Warehouse />} />
              <Route path="warehouse/add" element={<WarehouseFormPage />} />
              <Route path="warehouse/:id/edit" element={<WarehouseFormPage />} />
              <Route path="users" element={<Users />} />
              <Route path="users/add" element={<UserFormPage />} />
              <Route path="users/:id/edit" element={<UserFormPage />} />
              <Route path="users/:id/view" element={<UserView />} />

              <Route path="customer-reviews" element={<CustomerReviews />} />
              <Route path="customer-reviews/add" element={<CustomerReviewsFrom />} />
              <Route path="customer-reviews/:id/edit" element={<CustomerReviewsFrom />} />

              <Route path="wishlists" element={<Wishlist />} />
              <Route path="carts" element={<Cart />} />
              <Route path="faqs" element={<Faqspage />} />
              <Route path="faqs/add" element={<FaqsFrom />} />\
              <Route path="faqs/:id/edit" element={<FaqsFrom />} />
              <Route path="pages" element={<Pages />} />
              <Route path="pages/add" element={<PageFormPage />} />
              <Route path="pages/:id/edit" element={<PageFormPage />} />

              {/* <Route path="Policypages" element={<Policypages />} />
              <Route path="Policypages/add" element={<PolicypagesFrom />} />
              <Route path="Policypages/:id/edit" element={<PolicypagesFrom />} /> */}
              <Route path="policypages" element={<Policypages />} />
              <Route path="policypages/add" element={<PolicypagesFrom />} />
              <Route path="policypages/:id/edit" element={<PolicypagesFrom />} />

              <Route path="navbar" element={<Navbar />} />
              <Route path="navbar/add" element={<NavbarFormPage />} />
              <Route path="navbar/:id/edit" element={<NavbarFormPage />} />
              <Route path="footer" element={<Footer />} />
              <Route path="footer/add" element={<FooterFormPage />} />
              <Route path="footer/:id/edit" element={<FooterFormPage />} />
              <Route path="contact-messages" element={<ContactUs />} />
              <Route path="settings" element={<Settings />} />
              <Route path="stores" element={<Stores />} />
              <Route path="stores/add" element={<StoreFormPage />} />
              <Route path="stores/:id/edit" element={<StoreFormPage />} />
              <Route path="stores/:id/view" element={<StoreView />} />
              <Route path="seller-applications" element={<SellerApplications />} />
              <Route path="store-owners/add" element={<StoreOwnerFormPage />} />
              <Route path="store-owners/:id/edit" element={<StoreOwnerFormPage />} />
              <Route path="wallets/users" element={<UserWallets />} />
              {/* <Route path="business" element={<Business />} /> */}

              {/* <Route path="business" element={<Business />} />
              <Route path="business/add" element={<BusinessFromPage />} />
              <Route path="business/:id/edit" element={<BusinessFromPage />} /> */}


            </Route>
            <Route path="*" element={<NotFound />} />
          </Route>

          {/* ════════════════════════════════════════════════════════════════
              STORE-OWNER ROUTES   —   prefix: /store_owner
          ════════════════════════════════════════════════════════════════ */}
          <Route element={<ProtectedRoute allowedRoles={["store_owner"]} />}>
            <Route path="/seller/onboarding" element={<SellerOnboarding />} />
            <Route path="/store_owner" element={<AdminLayout />}>
              <Route index element={<VelzonDashboard />} />
              <Route path="products" element={<Products />} />
              <Route path="products/add" element={<AddProduct />} />
              <Route path="products/:id/edit" element={<AddProduct />} />
              <Route path="categories" element={<Categories />} />
              <Route path="categories/add" element={<CategoryFormPage />} />
              <Route path="categories/:id/edit" element={<CategoryFormPage />} />
              <Route path="subcategories" element={<Subcategories />} />
              <Route path="subcategories/add" element={<SubCategoryFormPage />} />
              <Route path="subcategories/:id/edit" element={<SubCategoryFormPage />} />
              {/* <Route path="brands" element={<Brands />} />
              <Route path="brands/add" element={<BrandFormPage />} />
              <Route path="brands/:id/edit" element={<BrandFormPage />} /> */}
              <Route path="types" element={<Types />} />
              <Route path="types/add" element={<TypeFormPage />} />
              <Route path="types/:id/edit" element={<TypeFormPage />} />
              <Route path="attributes" element={<Attributes />} />

              {/* <Route path="fabrics" element={<Fabrics />} />
              <Route path="fabrics/add" element={<FabricFormPage />} />
              <Route path="fabrics/:id/edit" element={<FabricFormPage />} /> */}
              <Route path="product-labels" element={<ProductLabels />} />
              <Route path="product-labels/add" element={<ProductLabelFormPage />} />
              <Route path="product-labels/:id/edit" element={<ProductLabelFormPage />} />
              {/* <Route path="colors" element={<Colors />} />
              <Route path="colors/add" element={<ColorFormPage />} />
              <Route path="colors/:id/edit" element={<ColorFormPage />} /> */}
              {/* <Route path="sizes" element={<Sizes />} />
              <Route path="sizes/add" element={<SizeFormPage />} />
              <Route path="sizes/:id/edit" element={<SizeFormPage />} /> */}
              <Route path="coupons" element={<CouponsPage />} />
              <Route path="coupons/add" element={<CouponFormPage />} />
              <Route path="coupons/:id/edit" element={<CouponFormPage />} />
              <Route path="orders" element={<Orders />} />
              <Route path="payments" element={<Payments />} />
              <Route path="warehouse" element={<Warehouse />} />
              <Route path="warehouse/add" element={<WarehouseFormPage />} />
              <Route path="warehouse/:id/edit" element={<WarehouseFormPage />} />
              <Route path="stores" element={<Stores />} />
              <Route path="stores/add" element={<StoreFormPage />} />
              <Route path="stores/:id/edit" element={<StoreFormPage />} />
              <Route path="users" element={<Users />} />
              <Route path="users/add" element={<UserFormPage />} />
              <Route path="users/:id/edit" element={<UserFormPage />} />
              <Route path="customer-reviews" element={<CustomerReviews />} />
              <Route path="customer-reviews/add" element={<CustomerReviewsFrom />} />
              <Route path="customer-reviews/:id/edit" element={<CustomerReviewsFrom />} />
              <Route path="wishlists" element={<Wishlist />} />
              <Route path="carts" element={<Cart />} />
              <Route path="faqs" element={<Faqspage />} />
              <Route path="faqs/add" element={<FaqsFrom />} />
              <Route path="faqs/:id/edit" element={<FaqsFrom />} />
              <Route path="pages" element={<Pages />} />
              <Route path="pages/add" element={<PageFormPage />} />
              <Route path="pages/:id/edit" element={<PageFormPage />} />
              <Route path="navbar" element={<Navbar />} />
              <Route path="navbar/add" element={<NavbarFormPage />} />
              <Route path="navbar/:id/edit" element={<NavbarFormPage />} />
              <Route path="footer" element={<Footer />} />
              <Route path="footer/add" element={<FooterFormPage />} />
              <Route path="footer/:id/edit" element={<FooterFormPage />} />
              <Route path="contact-messages" element={<ContactUs />} />
              <Route path="settings" element={<Settings />} />
            </Route>
            <Route path="/store_owner/*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;