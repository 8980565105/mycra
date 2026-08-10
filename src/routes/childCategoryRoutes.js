const express = require("express");
const router = express.Router();
const {
  getChildCategories,
  getChildCategoryById,
  createChildCategory,
  updateChildCategory,
  deleteChildCategory,
  getAllChildCategories,
} = require("../controllers/childCategoryController");

const {
  authMiddleware,
  authorizeMinRole,
} = require("../middlewares/authMiddleware");

router.get("/public", getAllChildCategories);
router.use(authMiddleware);
router.get("/", getChildCategories);
router.get("/all", getAllChildCategories);
router.get("/:id", authorizeMinRole("store_owner"), getChildCategoryById);
router.post("/", authorizeMinRole("admin"), createChildCategory);
router.put("/:id", authorizeMinRole("admin"), updateChildCategory);
router.delete("/:id", authorizeMinRole("admin"), deleteChildCategory);

module.exports = router;

