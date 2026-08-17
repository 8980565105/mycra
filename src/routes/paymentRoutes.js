const express = require("express");
const router = express.Router();
const {
  getPayments,
  getPaymentById,
  createPayment,
  updatePayment,
  deletePayment,
  bulkDeletePayments,
  createStripePaymentIntent,
  finalizeStripePayment,
  updateStripePaymentMethod,
} = require("../controllers/paymentController");

const {
  authMiddleware,
  authorizeMinRole,
} = require("../middlewares/authMiddleware");

router.use(authMiddleware);

router.get("/", authorizeMinRole("store_owner"), getPayments);
router.get("/:id", authorizeMinRole("store_owner"), getPaymentById);
router.post("/", createPayment);
router.post("/stripe/update-intent", updateStripePaymentMethod);
router.put("/:id", authorizeMinRole("store_owner"), updatePayment);
router.delete("/:id", authorizeMinRole("store_owner"), deletePayment);
router.post("/stripe/create-intent", createStripePaymentIntent);
router.post("/stripe/finalize", finalizeStripePayment);
router.post(
  "/bulk-delete",
  authorizeMinRole("store_owner"),
  bulkDeletePayments,
);

module.exports = router;
