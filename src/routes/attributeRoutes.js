const express = require("express");
const router = express.Router();
const attributeController = require("../controllers/attributeController");

// Attributes Routes
router.post("/", attributeController.createAttribute);
router.get("/", attributeController.getAttributes);
router.put("/:id", attributeController.updateAttribute);
router.delete("/:id", attributeController.deleteAttribute);

// Attribute Values Routes
router.post("/values", attributeController.createAttributeValue);
router.get("/values", attributeController.getAttributeValues);
router.put("/values/:id", attributeController.updateAttributeValue);
router.delete("/values/:id", attributeController.deleteAttributeValue);

// Category Attributes
router.get("/subcategory/:subcategoryId", attributeController.getCategoryAttributesWithValues);
router.get("/type/:typeId", attributeController.getTypeAttributesWithValues);

module.exports = router;
