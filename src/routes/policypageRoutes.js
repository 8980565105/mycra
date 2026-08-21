const express = require("express");
const router = express.Router();

const {
  authMiddleware,
  authorizeMinRole,
} = require("../middlewares/authMiddleware");
const {
  injectPublicStoreFilter,
  injectOwnershipFilter,
} = require("../middlewares/ownershipFilter");
const {
  getpolicypageBySlug,
  getpolicypage,
  createpolicypage,
  bulkdeletepolicypage,
  getpolicypageById,
  updatepolicypage,
  updatepolicypagestatus,
  deletepolicypage,
} = require("../controllers/policypageController");

router.get("/slug/:slug", injectPublicStoreFilter, getpolicypageBySlug);
router.use(authMiddleware);
router.get("/", injectOwnershipFilter, getpolicypage);
router.post(
  "/",
  authorizeMinRole("admin"),
  injectOwnershipFilter,
  createpolicypage,
);
router.post(
  "/bulk-delete",
  authorizeMinRole("admin"),
  injectOwnershipFilter,
  bulkdeletepolicypage,
);
router.get("/:id", injectOwnershipFilter, getpolicypageById);
router.put(
  "/:id",
  authorizeMinRole("admin"),
  injectOwnershipFilter,
  updatepolicypage,
);
router.put(
  "/:id/status",
  authorizeMinRole("admin"),
  injectOwnershipFilter,
  updatepolicypagestatus,
);
router.delete(
  "/:id",
  authorizeMinRole("admin"),
  injectOwnershipFilter,
  deletepolicypage,
);
module.exports = router;
