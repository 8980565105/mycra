const express = require("express");
const router = express.Router();
const {
  getChildCategories,
  getChildCategoryById,
  createChildCategory,
  updateChildCategory,
  deleteChildCategory,
  getAllChildCategories,
  updateChildCategoryStatus,
  bulkDeleteChildCategories,
} = require("../controllers/childCategoryController");

const {
  authMiddleware,
  authorizeMinRole,
} = require("../middlewares/authMiddleware");
const {
  injectPublicStoreFilter,
  injectOwnershipFilter,
} = require("../middlewares/ownershipFilter");

router.get("/public", injectPublicStoreFilter, getAllChildCategories);
router.use(authMiddleware);
router.get("/", getChildCategories);
router.get("/all", getAllChildCategories);
router.get("/:id", authorizeMinRole("store_owner"), getChildCategoryById);
router.post("/", authorizeMinRole("admin"), createChildCategory);
router.put("/:id", authorizeMinRole("admin"), updateChildCategory);
router.put("/:id/status", authorizeMinRole("admin"), updateChildCategoryStatus);
router.delete("/:id", authorizeMinRole("admin"), deleteChildCategory);
router.post("/bulk-delete", authorizeMinRole("admin"), bulkDeleteChildCategories);


module.exports = router;
