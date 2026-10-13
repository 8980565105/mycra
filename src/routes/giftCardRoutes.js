const express = require("express");

const router = express.Router();

const { authMiddleware, authorizeMinRole } = require("../middlewares/authMiddleware");
const { adminCreateGiftCard, adminCreateGiftCardProduct, getGiftCardPurchaseProducts, adminGetAllGiftCards, getMyGiftCards, purchaseGiftCard, adminGetAllPurchasedGiftCards, getGiftCardPurchaseOptions,
  adminGetAllGiftCardProducts, adminUpdateGiftCardProduct, adminUpdateGiftCardProductStatus,} = require("../controllers/giftCardController");

router.get( "/products", getGiftCardPurchaseProducts );
router.get( "/purchase-options", getGiftCardPurchaseOptions );
router.get( "/my", authMiddleware, getMyGiftCards );
router.post( "/purchase", authMiddleware, purchaseGiftCard );

router.post( "/admin/products", authMiddleware, authorizeMinRole("admin"), adminCreateGiftCardProduct );
router.post( "/admin/create", authMiddleware, authorizeMinRole("admin"), adminCreateGiftCard );
router.get("/admin/all", authMiddleware, authorizeMinRole("admin"), adminGetAllGiftCards);
router.get( "/admin/purchased", authMiddleware, authorizeMinRole("admin"), adminGetAllPurchasedGiftCards );
router.get( "/admin/products", authMiddleware, authorizeMinRole("admin"), adminGetAllGiftCardProducts );

router.patch("/admin/products/:id", authMiddleware, authorizeMinRole("admin"), adminUpdateGiftCardProduct);
router.patch("/admin/products/:id/status", authMiddleware, authorizeMinRole("admin"), adminUpdateGiftCardProductStatus);

module.exports = router;