const express = require("express");
const router = express.Router();
const attributeController = require("../controllers/attributeController");

router.post("/", attributeController.createAttribute);
router.get("/", attributeController.getAttributes);
router.put("/:id", attributeController.updateAttribute);
router.delete("/:id", attributeController.deleteAttribute);

router.post("/values", attributeController.createAttributeValue);
router.get("/values", attributeController.getAttributeValues);
router.put("/values/:id", attributeController.updateAttributeValue);
router.delete("/values/:id", attributeController.deleteAttributeValue);

router.get("/subcategory/:subcategoryId", attributeController.getCategoryAttributesWithValues);
router.get("/type/:typeId", attributeController.getTypeAttributesWithValues);
router.post("/types/attributes", attributeController.getMultipleTypeAttributesWithValues);

module.exports = router;
