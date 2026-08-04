const express = require("express");
const router = express.Router();
const {
  getTypes,
  getPublicTypes,
  getTypeById,
  createType,
  updateType,
  deleteType,
  bulkDeleteTypes,
  updateTypeStatus,
} = require("../controllers/typeController");

const {
  authMiddleware,
  authorizeMinRole,
} = require("../middlewares/authMiddleware");

const {
  injectPublicStoreFilter,
  injectOwnershipFilter,
} = require("../middlewares/ownershipFilter");

router.get("/public", injectPublicStoreFilter, getPublicTypes);
router.use(authMiddleware);
router.get("/", injectOwnershipFilter, getTypes);
router.get("/:id", getTypeById);
router.post("/", authorizeMinRole("admin"), createType);
router.put("/:id", authorizeMinRole("admin"), updateType);
router.put("/:id/status", authorizeMinRole("admin"), updateTypeStatus);
router.delete("/:id", authorizeMinRole("admin"), deleteType);
router.post("/bulk-delete", authorizeMinRole("admin"), bulkDeleteTypes);

module.exports = router;