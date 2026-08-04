const express = require("express");
const router = express.Router();
const {
  getFooters,
  getFooterById,
  createFooter,
  updateFooter,
  deleteFooter,
  bulkDeleteFooters,
  updateFooterStatus,
  getPublicFooters,
} = require("../controllers/footerController");

const {
  authMiddleware,
  authorizeMinRole,
} = require("../middlewares/authMiddleware");
const {
  injectPublicStoreFilter,
  injectOwnershipFilter,
} = require("../middlewares/ownershipFilter");

router.get("/public", injectPublicStoreFilter, getPublicFooters);

router.use(authMiddleware);

router.get(
  "/",
  authorizeMinRole("admin"),
  injectOwnershipFilter,
  getFooters,
);

router.get(
  "/:id",
  authorizeMinRole("admin"),
  injectOwnershipFilter,
  getFooterById,
);

router.post(
  "/",
  authorizeMinRole("admin"),
  injectOwnershipFilter,
  createFooter,
);

router.put(
  "/:id",
  authorizeMinRole("admin"),
  injectOwnershipFilter,
  updateFooter,
);

router.put(
  "/:id/status",
  authorizeMinRole("admin"),
  injectOwnershipFilter,
  updateFooterStatus,
);

router.delete(
  "/:id",
  authorizeMinRole("admin"),
  injectOwnershipFilter,
  deleteFooter,
);

router.post(
  "/bulk-delete",
  authorizeMinRole("admin"),
  injectOwnershipFilter,
  bulkDeleteFooters,
);

module.exports = router;
