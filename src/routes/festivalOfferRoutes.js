const express = require("express");
const router = express.Router();

const { createFestivalOffer, getAllFestivalOffers, getFestivalOfferById, updateFestivalOffer, deleteFestivalOffer } = require("../controllers/festivalOfferController");

const upload = require("../middlewares/upload");

router.get("/", getAllFestivalOffers);
router.get("/:id", getFestivalOfferById);
router.post("/", upload.single("image"), createFestivalOffer);
router.put("/:id", upload.single("image"), updateFestivalOffer);
router.delete("/:id", deleteFestivalOffer);

module.exports = router;