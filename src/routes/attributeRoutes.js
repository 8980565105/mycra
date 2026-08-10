const express = require("express");
const router = express.Router();
const attributeController = require("../controllers/attributeController");

const {
  authMiddleware,
  authorizeMinRole,
} = require("../middlewares/authMiddleware");

const {
  createAttribute,
  updateAttributeValue,
  getCategoryAttributesWithValues,
  getAttributes,
  updateAttribute,
  deleteAttribute,
  getAttributeValues,
  deleteAttributeValue,
  createAttributeValue,
  getMultipleTypeAttributesWithValues,
  getTypeAttributesWithValues,
} = require("../controllers/attributeController");

router.post("/", authMiddleware, createAttribute);
router.get("/", authMiddleware, getAttributes);
router.put("/:id", authMiddleware, updateAttribute);
router.delete("/:id", authMiddleware, deleteAttribute);

router.post("/values", authMiddleware, createAttributeValue);
router.get("/values", authMiddleware, getAttributeValues);
router.put("/values/:id", authMiddleware, updateAttributeValue);
router.delete("/values/:id", authMiddleware, deleteAttributeValue);

router.get("/subcategory/:subcategoryId", getCategoryAttributesWithValues);
router.get("/type/:typeId", getTypeAttributesWithValues);
router.post("/types/attributes", getMultipleTypeAttributesWithValues);

module.exports = router;
