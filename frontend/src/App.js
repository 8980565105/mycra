import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import "./App.css";
import "./index.css";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import Offer from "./pages/Offer";
import ContactUs from "./pages/ContactUs";
import MyAccount from "./pages/Account";
import Orders from "./components/userAccount/Orders";
import Dashboard from "./components/userAccount/Dashbord";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Product from "./pages/ProductPage";
import Wishlist from "./pages/Wishlist";
import Updatecart from "./pages/Updatecart";
import Collections from "./pages/Collections";
import Address from "./components/Address/Address";
import AccountDetails from "./components/AccountDetails/AccountDetails";
import Faqs from "./pages/Faqs";
import AboutPage from "./pages/About";
import ScrollToTop from "./components/ScrollToTop";
import { fetchStoreInfo } from "./features/store/storeThunk";
import { useDispatch, useSelector } from "react-redux";

function App() {
  const RouterWrapper = () => {
    const location = useLocation();
    const isShopPage = location.pathname === "/shop";
    const dispatch = useDispatch();
    const storeData = useSelector((state) => state.store.info);

    useEffect(() => {
      dispatch(fetchStoreInfo());
    }, [dispatch]);

    useEffect(() => {
      const faviconUrl = storeData?.theme?.faviconUrl;
      if (!faviconUrl) return;
      const baseURL = process.env.REACT_APP_API_URL_IMAGE;
      const fullUrl = faviconUrl.startsWith("http")
        ? faviconUrl
        : `${baseURL}${faviconUrl}`;
      let link = document.querySelector("link[rel='icon']");
      if (!link) {
        link = document.createElement("link");
        link.rel = "icon";
        document.head.appendChild(link);
      }
      link.href = fullUrl;
    }, [storeData]);

    return (
      <>
        <ScrollToTop />

        <Header hideOnMobileShopPage={isShopPage} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/Home" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/collections" element={<Collections />} />
          <Route path="/offer" element={<Offer />} />
          <Route path="/contact-us" element={<ContactUs />} />
          <Route path="/my-account" element={<MyAccount />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="orders" element={<Orders />} />
            <Route path="address" element={<Address />} />
            <Route path="account-details" element={<AccountDetails />} />
            <Route path="logout" />
          </Route>
          <Route path="/cart" element={<Cart />}></Route>
          <Route path="/updatecart" element={<Updatecart />}></Route>
          <Route path="/checkout" element={<Checkout />}></Route>
          <Route path="/products/:id" element={<Product />}></Route>
          <Route path="/wishlist" element={<Wishlist />}></Route>
          <Route path="/faqs" element={<Faqs />} />
          <Route path="about" element={<AboutPage />} />
        </Routes>
        <Footer />
      </>
    );
  };
  return (
    <>
      <Router>
        <RouterWrapper />
      </Router>
    </>
  );
}
export default App;
