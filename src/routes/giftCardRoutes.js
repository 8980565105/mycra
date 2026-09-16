const express = require("express");

const router = express.Router();

const { authMiddleware, authorizeMinRole } = require("../middlewares/authMiddleware");
const { adminCreateGiftCard, adminGetAllGiftCards, getMyGiftCards, } = require("../controllers/giftCardController");


router.get( "/my", authMiddleware, getMyGiftCards );
// router.post( "/redeem", authMiddleware, redeemGiftCard );

router.post( "/admin/create", authMiddleware, authorizeMinRole("admin"), adminCreateGiftCard );
router.get("/admin/all", authMiddleware, authorizeMinRole("admin"), adminGetAllGiftCards);
// router.get("/admin/:id", authMiddleware, authorizeMinRole("admin"), adminGetGiftCardById);
// router.put("/admin/:id/block", authMiddleware, authorizeMinRole("admin"), adminBlockGiftCard);
// router.put("/admin/:id/unblock", authMiddleware, authorizeMinRole("admin"), adminUnblockGiftCard);


module.exports = router;
