const express = require("express");
const router = express.Router();

const { createFestivalOffer, getAllFestivalOffers, getFestivalOfferById, updateFestivalOffer, deleteFestivalOffer, bulkDeleteFestivalOffers, updateFestivalOfferStatus } = require("../controllers/festivalOfferController");

const upload = require("../middlewares/upload");
const { authorizeMinRole, authMiddleware } = require("../middlewares/authMiddleware");
const { injectPublicStoreFilter } = require("../middlewares/ownershipFilter");

router.get("/", injectPublicStoreFilter, getAllFestivalOffers);
router.use(authMiddleware);
router.get("/:id", getFestivalOfferById);
router.post("/", upload.single("image"), authorizeMinRole("admin"), createFestivalOffer);
router.put("/:id", upload.single("image"), authorizeMinRole("admin"), updateFestivalOffer);
router.put("/:id/status", authorizeMinRole("admin"), updateFestivalOfferStatus);
router.delete("/:id", authorizeMinRole("admin"), deleteFestivalOffer);
router.post("/bulk-delete", authorizeMinRole("admin"), bulkDeleteFestivalOffers);

module.exports = router;