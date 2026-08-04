const express = require("express");
const router = express.Router();
const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  bulkDeleteUsers,
  updateOwnProfile,
  getOwnProfile,
  deleteOwnProfile,
  getUserTracking,
  updateUserStatus,
  addAddress,
  getAddresses,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} = require("../controllers/userController");
const {
  authMiddleware,
  authorizeRoles,
  authorizeMinRole,
  checkStoreOwnership,
} = require("../middlewares/authMiddleware");
const upload = require("../middlewares/upload");
router.use(authMiddleware);
router.get("/me", getOwnProfile);
router.put(
  "/me",
  upload.fields([
    { name: "profile_picture", maxCount: 1 },
    { name: "logo", maxCount: 1 },
    { name: "banner", maxCount: 1 },
  ]),
  updateOwnProfile,
);
router.delete("/me", deleteOwnProfile);
router.get("/me/addresses", getAddresses);
router.post("/me/addresses", addAddress);
router.put("/me/addresses/:addressId", updateAddress);
router.delete("/me/addresses/:addressId", deleteAddress);
router.put("/me/addresses/:addressId/default", setDefaultAddress);
router.get("/", authorizeMinRole("store_owner"), getUsers);
router.get("/:id", authorizeMinRole("admin"), getUserById);
router.get("/:id/tracking", authorizeMinRole("admin"), getUserTracking);
router.post(
  "/",
  authorizeMinRole("admin"),
  upload.fields([
    { name: "profile_picture", maxCount: 1 },
    { name: "logo", maxCount: 1 },
    { name: "banner", maxCount: 1 },
  ]),
  createUser,
);
router.put(
  "/:id",
  authorizeMinRole("admin"),
  upload.fields([
    { name: "profile_picture", maxCount: 1 },
    { name: "logo", maxCount: 1 },
    { name: "banner", maxCount: 1 },
  ]),
  updateUser,
);
router.put("/:id/status", authorizeMinRole("store_owner"), updateUserStatus);
router.delete("/:id", authorizeMinRole("store_owner"), deleteUser);
router.post("/bulk-delete", authorizeMinRole("store_owner"), bulkDeleteUsers);
module.exports = router;
