const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload");
const {
  authMiddleware,
  authorizeMinRole,
} = require("../middlewares/authMiddleware");

const {
  saveBusinessDetails,
  savePickupAddress,
  saveBankDetails,
  saveDocuments,
  getOnboardingStatus,
  submitApplication,
  getSellerApplications,
  approveSellerApplication,
  rejectSellerApplication,
} = require("../controllers/sellerController");

// All seller routes require user authentication
router.use(authMiddleware);

// Seller onboarding step endpoints
router.post("/business-details", saveBusinessDetails);
router.post("/pickup-address", savePickupAddress);
router.post("/bank-details", saveBankDetails);
router.post(
  "/documents",
  upload.fields([
    { name: "gstDoc", maxCount: 1 },
    { name: "panDoc", maxCount: 1 },
    { name: "aadhaarDoc", maxCount: 1 },
    { name: "cancelledCheque", maxCount: 1 },
    { name: "addressProof", maxCount: 1 },
  ]),
  saveDocuments
);
router.get("/onboarding-status", getOnboardingStatus);
router.post("/submit", submitApplication);

// Admin approval endpoints
router.get(
  "/admin/applications",
  authorizeMinRole("admin"),
  getSellerApplications
);
router.post(
  "/admin/applications/:applicationId/approve",
  authorizeMinRole("admin"),
  approveSellerApplication
);
router.post(
  "/admin/applications/:applicationId/reject",
  authorizeMinRole("admin"),
  rejectSellerApplication
);

module.exports = router;
