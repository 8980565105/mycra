const express = require("express");
const router = express.Router();

const {
  getBusinesses,
  getBusinessById,
  createBusiness,
  updateBusiness,
  deleteBusiness,
  bulkDeleteBusinesses,
  updateBusinessStatus,
  getActiveBusinesses,
} = require("../controllers/businessController");

const {
  authMiddleware,
  authorizeMinRole,
} = require("../middlewares/authMiddleware");

router.use(authMiddleware);

router.get(
  "/active/list",
  authorizeMinRole("store_owner"),
  getActiveBusinesses,
);

router.use(authorizeMinRole("admin"));

router.get("/", getBusinesses);
router.get("/:id", getBusinessById);
router.post("/", createBusiness);
router.put("/:id", updateBusiness);
router.put("/:id/status", updateBusinessStatus);
router.delete("/:id", deleteBusiness);
router.post("/bulk-delete", bulkDeleteBusinesses);

module.exports = router;
