const express = require("express");
const router = express.Router();

const {
  authMiddleware,
  authorizeMinRole,
} = require("../middlewares/authMiddleware");

const {
  injectOwnershipFilter,
  injectPublicStoreFilter,
} = require("../middlewares/ownershipFilter");

const upload = require("../middlewares/upload");

const {
  getPublicAboutPage,
  getAboutPage,
  saveAboutPage,
  updateHero,
  addContentItem,
  updateContentItem,
  updateContentStatus,
  deleteContentItem,
  addFeature,
  updateFeature,
  deleteFeature,
} = require("../controllers/aboutcontroller");

router.get("/public", injectPublicStoreFilter, getPublicAboutPage);
router.use(authMiddleware);
router.get("/", injectOwnershipFilter, getAboutPage);
router.post(
  "/",
  authorizeMinRole("store_owner"),
  upload.fields([
    { name: "heroImage", maxCount: 1 },
    { name: "contentImage_0", maxCount: 1 },
    { name: "contentImage_1", maxCount: 1 },
    { name: "contentImage_2", maxCount: 1 },
    { name: "contentImage_3", maxCount: 1 },
    { name: "contentImage_4", maxCount: 1 },
  ]),
  saveAboutPage,
);

router.put(
  "/hero",
  authorizeMinRole("store_owner"),
  upload.single("heroImage"),
  updateHero,
);

router.post(
  "/content",
  authorizeMinRole("store_owner"),
  upload.single("image"),
  addContentItem,
);

router.put(
  "/content/:itemId",
  authorizeMinRole("store_owner"),
  upload.single("image"),
  updateContentItem,
);

router.put(
  "/content/:itemId/status",
  authorizeMinRole("store_owner"),
  updateContentStatus,
);

router.delete(
  "/content/:itemId",
  authorizeMinRole("store_owner"),
  deleteContentItem,
);

router.post(
  "/feature",
  upload.single("icon"),
  authorizeMinRole("store_owner"),
  addFeature,
);

router.put(
  "/feature/:featureId",
  upload.single("icon"),
  authorizeMinRole("store_owner"),
  updateFeature,
);

router.delete(
  "/feature/:featureId",
  authorizeMinRole("store_owner"),
  deleteFeature,
);

module.exports = router;
