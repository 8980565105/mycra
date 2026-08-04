const express = require("express");
const router = express.Router();
const {
  authMiddleware,
  authorizeMinRole,
} = require("../middlewares/authMiddleware");
const {
  setKycData,
  validatePan,
  generateOtp,
  verifyOtp,
} = require("../controllers/kycController");

router.put(
  "/admin/set/:userId",
  authMiddleware,
  authorizeMinRole("store_owner"),
  setKycData
);

router.post("/validate-pan", authMiddleware, validatePan);
router.post("/generate-otp", authMiddleware, generateOtp);
router.post("/verify-otp", authMiddleware, verifyOtp);

module.exports = router;
