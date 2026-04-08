const express = require("express");
const router = express.Router();
const { authMiddleware, authorizeMinRole } = require("../middlewares/authMiddleware");
const {
  getStores,
  getStoreById,
  createStore,
  updateStore,
  deleteStore,
  bulkDeleteStores,
} = require("../controllers/storeController");

router.use(authMiddleware);
router.get("/",authorizeMinRole("admin"), getStores);
router.get("/:id", authorizeMinRole("admin"), getStoreById);
router.post("/", authorizeMinRole("admin"), createStore);
router.put("/:id", authorizeMinRole("admin"), updateStore);
router.delete("/:id", authorizeMinRole("admin"), deleteStore);
router.post("/bulk-delete", authorizeMinRole("admin"), bulkDeleteStores);

module.exports = router;
