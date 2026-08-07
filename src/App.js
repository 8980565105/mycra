import React, { useEffect, useRef } from "react";
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
import { useDispatch, useSelector } from "react-redux";
import { trackPageVisit } from "./utils/trackPageVisit";
import Wallets from "./pages/Wallets";
import TransactionHistory from "./pages/paytransection";
import WalletKycIntro from "./components/wallets/walletkycintro";
import ContinueWithKyc from "./components/wallets/continuewithkyc";
import KycForm from "./components/wallets/kycform";
import GiftCardToBalance from "./components/wallets/giftcardtobalance";
import { fetchPublicSettings } from "./features/setting/settingThunk";
import { fetchCart } from "./features/cart/cartThunk";

const hexToRgba = (hex, opacity) => {
  if (!hex) return null;
  const clean = hex.replace("#", "");
  const r = parseInt(clean.substr(0, 2), 16);
  const g = parseInt(clean.substr(2, 2), 16);
  const b = parseInt(clean.substr(4, 2), 16);
  return `rgba(${r},${g},${b},${opacity})`;
};

const injectThemeColors = (theme) => {
  if (!theme) return;
  const root = document.documentElement;

  const primary = theme.primary_color;
  const secondary = theme.secondary_color;
  const font = theme.font_family || theme.fontFamily || theme?.theme?.fontFamily;

  if (primary) {
    root.style.setProperty("--primary-color", primary);
    root.style.setProperty("--theme-color", primary);
    root.style.setProperty("--theme-hover-color", hexToRgba(primary, 0.5));
    root.style.setProperty("--theme-bg-100", primary);
    root.style.setProperty("--ef3a96-9", hexToRgba(primary, 0.09));
    root.style.setProperty("--theme-bg-rgba", hexToRgba(primary, 0.3));
    root.style.setProperty("--theme-bg-light", hexToRgba(primary, 0.15));
  }

  if (secondary) {
    root.style.setProperty("--secondary-color", secondary);
    root.style.setProperty("--sec-theme-color-30", hexToRgba(secondary, 0.5));
  }

  if (font) {
    const fontBaseName = font.split(",")[0].replace(/['"]/g, "").trim();
    root.style.setProperty("--font-family-main", `'${fontBaseName}', sans-serif`);
    root.style.setProperty("--font-inter", `'${fontBaseName}', sans-serif`);
  }
};

function PageTracker() {
  const location = useLocation();
  const lastTracked = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const currentPage = location.pathname;
    if (lastTracked.current === currentPage) return;
    lastTracked.current = currentPage;

    trackPageVisit(currentPage);
  }, [location.pathname]);

  return null;
}

function App() {
  const SYSTEM_FONTS = [
    "Arial",
    "Helvetica",
    "Times New Roman",
    "Georgia",
    "serif",
    "sans-serif",
    "Roboto",
  ];

  const DEFAULT_FONT = "'Roboto', sans-serif";

  const RouterWrapper = () => {
    const location = useLocation();
    const isShopPage = location.pathname === "/shop";
    const dispatch = useDispatch();
    const settings = useSelector((state) => state.settings.data);

    useEffect(() => {
      if (!settings) {
        document.documentElement.style.setProperty(
          "--font-family-main",
          DEFAULT_FONT,
        );
        return;
      }

      const font = settings?.font_family || settings?.fontFamily || settings?.theme?.fontFamily;
      if (!font) {
        document.documentElement.style.setProperty(
          "--font-family-main",
          DEFAULT_FONT,
        );
        return;
      }

      const fontBaseName = font.split(",")[0].replace(/['"]/g, "").trim();

      if (SYSTEM_FONTS.includes(fontBaseName)) {
        document.documentElement.style.setProperty(
          "--font-family-main",
          `'${fontBaseName}', sans-serif`,
        );
        return;
      }

      const existingLink = document.getElementById("dynamic-google-font");
      if (existingLink) existingLink.remove();

      const link = document.createElement("link");
      link.id = "dynamic-google-font";
      link.rel = "stylesheet";
      link.href = `https://fonts.googleapis.com/css2?family=${fontBaseName.replace(/\s+/g, "+")}:wght@300;400;500;600;700&display=swap`;

      link.onload = () => {
        document.documentElement.style.setProperty(
          "--font-family-main",
          `'${fontBaseName}', sans-serif`,
        );
      };
      link.onerror = () => {
        console.warn(`Font load failed: ${fontBaseName}, using Roboto fallback`);
        document.documentElement.style.setProperty(
          "--font-family-main",
          DEFAULT_FONT,
        );
      };

      document.head.appendChild(link);
    }, [settings]);

    useEffect(() => {
      dispatch(fetchPublicSettings());
      const cartId = localStorage.getItem("cart_id");
      if (cartId) {
        dispatch(fetchCart(cartId));
      }
    }, [dispatch]);

    useEffect(() => {
      const faviconUrl = settings?.favicon_url;
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
    }, [settings]);

    useEffect(() => {
      if (settings) {
        injectThemeColors(settings);
      }
    }, [settings]);

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
            <Route path="wallets" element={<Wallets />} />
            <Route path="logout" />
          </Route>
          <Route path="/cart" element={<Cart />}></Route>
          <Route path="/updatecart" element={<Updatecart />}></Route>
          <Route path="/checkout" element={<Checkout />}></Route>
          <Route path="/products/:id" element={<Product />}></Route>
          <Route path="/wishlist" element={<Wishlist />}></Route>
          <Route path="/faqs" element={<Faqs />} />
          <Route path="/about" element={<AboutPage />} />
          {/* <Route path="/wallets" element={<Wallets />} /> */}
          <Route path="/transectionhistory" element={<TransactionHistory />} />
          <Route path="/walletkycintro" element={<WalletKycIntro />} />
          <Route path="/continuewithkyc" element={<ContinueWithKyc />} />
          <Route path="/kycform" element={<KycForm />} />
          <Route path="/gifcard" element={<GiftCardToBalance />} />
        </Routes>
        <Footer />
      </>
    );
  };
  return (
    <>
      <Router>
        <PageTracker />
        <RouterWrapper />
      </Router>
    </>
  );
}
export default App;
