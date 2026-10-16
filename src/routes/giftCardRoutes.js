const express = require("express");

const router = express.Router();

const { authMiddleware, authorizeMinRole } = require("../middlewares/authMiddleware");
const { adminCreateGiftCard, adminCreateGiftCardProduct, getGiftCardPurchaseProducts, adminGetAllGiftCards, getMyGiftCards, purchaseGiftCard, getPurchasedGiftCards, updateGiftCardProduct, 
   deleteGiftCards, getGiftCardProduct, } = require("../controllers/giftCardController");

router.get( "/products", getGiftCardPurchaseProducts );
router.use(authMiddleware);

router.get( "/my", getMyGiftCards );
router.post( "/purchase", purchaseGiftCard );

router.get( "/admin/getAll", authorizeMinRole("admin"), getGiftCardProduct );
router.post( "/admin/products", authorizeMinRole("admin"), adminCreateGiftCardProduct );
router.post( "/admin/create", authorizeMinRole("admin"), adminCreateGiftCard );
router.get("/admin/all", authorizeMinRole("admin"), adminGetAllGiftCards);
router.get("/admin/purchased", authorizeMinRole("admin"), getPurchasedGiftCards );

router.put("/admin/products/:id", authorizeMinRole("admin"), updateGiftCardProduct);
router.delete("/:id", authorizeMinRole("admin"), deleteGiftCards);
module.exports = router;