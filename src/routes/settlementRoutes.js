
const express = require("express");
const router = express.Router();

const {
  getSettlements,
  withdrawSettlement,
  processAvailableSettlements,
  markSettlementProcessing,
  markSettlementPaid,
  markSettlementFailed,
} = require("../controllers/settlementController");
const { authorizeMinRole, authMiddleware } = require("../middlewares/authMiddleware");


router.use(authMiddleware);
router.get("/", authorizeMinRole("store_owner"), getSettlements); 
router.post("/:id/withdraw", authorizeMinRole("store_owner"), withdrawSettlement); 
router.post("/process-available", authorizeMinRole("admin"), processAvailableSettlements); 
router.put("/:id/processing", authorizeMinRole("admin"), markSettlementProcessing); 
router.put("/:id/paid", authorizeMinRole("admin"), markSettlementPaid); 
router.put("/:id/failed", authorizeMinRole("admin"), markSettlementFailed);

module.exports = router;