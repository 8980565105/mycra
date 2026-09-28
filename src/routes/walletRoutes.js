const express = require("express");
const router = express.Router();
const {
  authMiddleware,
  authorizeMinRole,
} = require("../middlewares/authMiddleware");
const{ getBalance, addMoney, verifyKyc, getAllWallets, adminAdjustBalance, adminVerifyKyc, adminAddVoucher, adminUpdateVoucher }
 = require("../controllers/walletController");

router.get("/balance", authMiddleware, getBalance);
router.post("/add-money", authMiddleware, addMoney);
router.post("/verify-kyc", authMiddleware, verifyKyc);

router.get(
  "/admin/all",
  authMiddleware,
  authorizeMinRole("store_owner"),
  getAllWallets,
);

router.put(
  "/admin/adjust/:userId",
  authMiddleware,
  authorizeMinRole("admin"),
  adminAdjustBalance,
);

router.put(
  "/admin/verify-kyc/:userId",
  authMiddleware,
  authorizeMinRole("store_owner"),
  adminVerifyKyc,
);
router.post("/voucher", adminAddVoucher);
router.put("/voucher/:userId", adminUpdateVoucher );

module.exports = router;
