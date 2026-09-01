const dotenv = require("dotenv");
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const connectDB = require("./src/config/db");
const path = require("path");
const fs = require("fs");
const Page = require("./src/models/Page");
const Product = require("./src/models/Product");
const Subcategory = require("./src/models/Subcategory");
const { limiter, authLimiter } = require("./src/middlewares/rateLimiter");
const { errorHandler } = require("./src/middlewares/errorMiddleware");
const authRoutes = require("./src/routes/authRoutes");
const settingRoutes = require("./src/routes/settingRoutes");
const userRoutes = require("./src/routes/userRoutes");
const pageRoutes = require("./src/routes/pageRoutes");
const navbarRoutes = require("./src/routes/navbarRoutes");
const footerRoutes = require("./src/routes/footerRoutes");
const typeRoutes = require("./src/routes/typeRoutes");
const categoryRoutes = require("./src/routes/categoryRoutes");
const subcategoryRoutes = require("./src/routes/subcategoryRoutes");
const childCategoryRoutes = require("./src/routes/childCategoryRoutes");
const productRoutes = require("./src/routes/productRoutes");
const productVariantRoutes = require("./src/routes/productVariantRoutes");
const couponRoutes = require("./src/routes/couponRoutes");
const warehouseRoutes = require("./src/routes/warehouseRoutes");
const orderRoutes = require("./src/routes/orderRoutes");
const paymentRoutes = require("./src/routes/paymentRoutes");
const cartRoutes = require("./src/routes/cartRoutes");
const wishlistRoutes = require("./src/routes/wishlistRoutes");
const contactUsRoutes = require("./src/routes/contactUsRoutes");
const customerReviewRoutes = require("./src/routes/customerReviewRoutes");
const uploadsRoutes = require("./src/routes/upload");
const storeRoutes = require("./src/routes/storeRoutes");
const dashboardRoutes = require("./src/routes/dashboardRoutes");
const walletRoutes = require("./src/routes/walletRoutes");
const transectionRoutes = require("./src/routes/transectionRoutes");
const kycRoutes = require("./src/routes/kycRoutes");
const sellerRoutes = require("./src/routes/sellerRoutes");
const attributeRoutes = require("./src/routes/attributeRoutes");
const brandRoutes = require("./src/routes/brandRoutes");
const pageVisitRoutes = require("./src/routes/pageRoutes");
const policypageRoutes = require("./src/routes/policypageRoutes");
const emailRoutes = require("./src/routes/emailRoute");
const {
  handleStripeWebhook,
} = require("./src/controllers/stripeWebhookController");
const helmet = require("helmet");
const { off } = require("pdfkit");
connectDB();
const app = express();
const ADMIN_ORIGINS = (process.env.ADMIN_ORIGINS || "http://localhost:8080")
  .split(",")
  .map((o) => o.trim());
let allowedOriginsCache = [];
let cacheTime = 0;
const CACHE_TTL = 60 * 1000;
const getAllowedOrigins = async () => {
  const now = Date.now();
  if (allowedOriginsCache.length > 0 && now - cacheTime < CACHE_TTL) {
    return allowedOriginsCache;
  }
  try {
    const Store = require("./src/models/Store");
    const stores = await Store.find({ status: "active" })
      .select("domain website")
      .lean();

    const storeOrigins = [];
    stores.forEach((store) => {
      if (store.domain) {
        const d = store.domain.trim();
        if (d.startsWith("http")) {
          storeOrigins.push(d);
        } else {
          storeOrigins.push(`http://${d}`);
        }
      }
      if (store.website) {
        storeOrigins.push(store.website.trim());
      }
    });

    allowedOriginsCache = [...new Set([...ADMIN_ORIGINS, ...storeOrigins])];
    cacheTime = now;
    console.log("✅ CORS allowed origins updated:", allowedOriginsCache);
    return allowedOriginsCache;
  } catch (err) {
    console.error("CORS origin fetch error:", err.message);
    return ADMIN_ORIGINS;
  }
};
app.use(
  cors({
    origin: async function (origin, callback) {
      if (!origin) return callback(null, true);
      try {
        const allowed = await getAllowedOrigins();
        if (allowed.includes(origin)) {
          callback(null, true);
        } else {
          console.warn(`❌ CORS blocked: ${origin}`);
          callback(new Error(`CORS: Origin not allowed: ${origin}`));
        }
      } catch (err) {
        callback(err);
      }
    },
    credentials: true,
  }),
);

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: [
          "'self'",
          "data:",
          "blob:",
          "http://localhost:5000",
          "https://your-production-url.com",
        ],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        connectSrc: [
          "'self'",
          "http://localhost:5000",
          "https://your-production-url.com",
        ],
      },
    },
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);

app.post(
  "/api/payments/webhook",
  express.raw({ type: "application/json" }),
  handleStripeWebhook,
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
// app.use("/api/", limiter);
app.use("/uploads", express.static("uploads"));
app.use("/api/auth", authRoutes, authLimiter);
app.use("/api/settings", settingRoutes);
app.use("/api/users", userRoutes);
app.use("/api/stores", storeRoutes);
app.use("/api/pages", pageRoutes);
app.use("/api/navbar", navbarRoutes);
app.use("/api/footer", footerRoutes);
app.use("/api/types", typeRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/subcategories", subcategoryRoutes);
app.use("/api/child-categories", childCategoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/attributes", attributeRoutes);
app.use("/api/products/:product_id/variants", productVariantRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/warehouses", warehouseRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/carts", cartRoutes);
app.use("/api/wishlists", wishlistRoutes);
app.use("/api/contact-us", contactUsRoutes);
app.use("/api/customer-reviews", customerReviewRoutes);
app.use("/api/uploads", uploadsRoutes);
app.use("/api/brands", brandRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/page-visit", pageVisitRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/transactions", transectionRoutes);
app.use("/api/kyc", kycRoutes);
app.use("/api/seller", sellerRoutes);
app.use("/api/policypages", policypageRoutes);
app.use("/api/emails", emailRoutes);
app.use(errorHandler);

// ═══════════════════════════════════════════════════════
// REACT BUILD SERVE + DYNAMIC SEO META INJECT
// ═══════════════════════════════════════════════════════
const BRAND = "Mycra";
const IMAGE_URL = (
  process.env.IMAGE_BASE_URL || "http://localhost:5000"
).replace(/\/$/, "");
const FRONTEND_BUILD = path.join(__dirname, "build");

const ROUTE_SLUG_MAP = {
  "/": "home",
  "/home": "home",
  "/about": "about",
  "/contact-us": "contact",
  "/collections": "collections",
  "/faqs": "faqs",
  "/offer": "offer",
};

function injectMeta(html, { title, description, image, url } = {}) {
  const fullTitle = title ? `${BRAND} | ${title}` : BRAND;
  const desc = (description || "").replace(/"/g, "&quot;").substring(0, 200);
  const img = image || "";

  const tags = `
      <title>${fullTitle}</title>
      <meta name="description" content="${desc}" />
      <meta property="og:title" content="${fullTitle}" />
      <meta property="og:description" content="${desc}" />
      <meta property="og:type" content="website" />
      ${url ? `<meta property="og:url" content="${url}" />` : ""}
      ${img ? `<meta property="og:image" content="${img}" />` : ""}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="${fullTitle}" />
      <meta name="twitter:description" content="${desc}" />
      ${img ? `<meta name="twitter:image" content="${img}" />` : ""}
    `;

  return html
    .replace(/<title>.*?<\/title>/s, "")
    .replace("</head>", `${tags}\n</head>`);
}

function buildImageUrl(imgPath) {
  if (!imgPath) return "";
  if (imgPath.startsWith("http")) return imgPath;
  return `${IMAGE_URL}/${imgPath.replace(/^\/+/, "")}`;
}

if (fs.existsSync(FRONTEND_BUILD)) {
  app.use(express.static(FRONTEND_BUILD));

  app.use(async (req, res) => {
    const htmlPath = path.join(FRONTEND_BUILD, "index.html");

    if (!fs.existsSync(htmlPath)) {
      return res
        .status(404)
        .send("Frontend build not found. Run: npm run build");
    }

    let html = fs.readFileSync(htmlPath, "utf-8");
    const pathname = req.path.toLowerCase().replace(/\/$/, "") || "/";

    try {
      if (pathname.startsWith("/products/")) {
        const productId = pathname.split("/products/")[1];
        const product = await Product.findById(productId)
          .select("name description images")
          .lean();

        if (product) {
          html = injectMeta(html, {
            title: product.name,
            description: product.description,
            image: buildImageUrl(product.images?.[0]),
          });
        }
        return res.send(html);
      }

      if (pathname.startsWith("/collections/")) {
        const slug = pathname.split("/collections/")[1];

        const subcategory = await Subcategory.findOne({ slug })
          .select("name description image_url")
          .lean();

        if (subcategory) {
          html = injectMeta(html, {
            title: subcategory.name,
            description:
              subcategory.description ||
              `Shop the best ${subcategory.name} collection - handpicked styles for everyday and celebration wear.`,
            image: buildImageUrl(subcategory.image_url),
            url: `${process.env.FRONTEND_URL}${pathname}`,
          });
          return res.send(html);
        }

        const page = await Page.findOne({ slug, status: "active" }).lean();
        if (page) {
          html = injectMeta(html, {
            title: page.meta_title,
            description: page.meta_description,
            image: buildImageUrl(page.seo_image),
            url: `${process.env.FRONTEND_URL}${pathname}`,
          });
        }
        return res.send(html);
      }

      const slug = ROUTE_SLUG_MAP[pathname];
      if (slug) {
        const page = await Page.findOne({ slug, status: "active" }).lean();
        if (page) {
          html = injectMeta(html, {
            title: page.meta_title,
            description: page.meta_description,
            image: buildImageUrl(page.seo_image),
            url: `${process.env.FRONTEND_URL}${pathname}`,
          });
        }
      }
    } catch (err) {
      console.error("SEO meta inject error:", err.message);
    }

    res.send(html);
  });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
