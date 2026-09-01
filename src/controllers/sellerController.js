const SellerApplication = require("../models/SellerApplication");
const User = require("../models/User");
const Store = require("../models/Store");
const { sendResponse } = require("../utils/response");
const slugify = require("slugify");

const cleanDomain = (raw) => {
  if (!raw) return "";
  try {
    const withProto = raw.startsWith("http") ? raw : `http://${raw}`;
    const parsed = new URL(withProto);
    if (parsed.hostname === "localhost") {
      return `localhost:${parsed.port}`;
    }
    return parsed.host
      .replace(/^www\./i, "")
      .toLowerCase()
      .trim();
  } catch {
    return raw
      .replace(/^https?:\/\//i, "")
      .replace(/^www\./i, "")
      .toLowerCase()
      .trim();
  }
};

const saveBusinessDetails = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      storeName,
      categoryId,
      businessType,
      description,
      website,
      phone,
      email,
    } = req.body;

    if (!storeName) {
      return sendResponse(res, false, null, "Store name is required");
    }
    const domain = website ? cleanDomain(website) : "";
    let app = await SellerApplication.findOne({ user: userId });
    if (!app) {
      app = new SellerApplication({ user: userId });
    }
    app.businessDetails = {
      storeName: storeName.trim(),
      categoryId,
      businessType: businessType || "",
      description: description || "",
      website: website || "",
      domain: domain,
      phone: phone || "",
      email: email || req.user.email,
    };
    if (app.status === "rejected") {
      app.status = "draft";
    }
    await app.save();
    await User.findByIdAndUpdate(userId, { onboardingStatus: "in_progress" });
    return sendResponse(res, true, app, "Business details saved successfully");
  } catch (error) {
    return sendResponse(res, false, null, error.message);
  }
};

const savePickupAddress = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      full_name,
      phone_number,
      house_no,
      apartment,
      street,
      landmark,
      city,
      state,
      country,
      zip_code,
    } = req.body;

    let app = await SellerApplication.findOne({ user: userId });
    if (!app) {
      app = new SellerApplication({ user: userId });
    }
    app.pickupAddress = {
      full_name: full_name || req.user.name,
      phone_number: phone_number || req.user.mobile_number || "",
      house_no: house_no || "",
      apartment: apartment || "",
      street: street || "",
      landmark: landmark || "",
      city: city || "",
      state: state || "",
      country: country || "India",
      zip_code: zip_code || "",
    };
    if (app.status === "rejected") {
      app.status = "draft";
    }
    await app.save();
    await User.findByIdAndUpdate(userId, { onboardingStatus: "in_progress" });
    return sendResponse(res, true, app, "Pickup address saved successfully");
  } catch (error) {
    return sendResponse(res, false, null, error.message);
  }
};

const saveBankDetails = async (req, res) => {
  try {
    const userId = req.user._id;
    const { accountNumber, accountHolderName, ifscCode, bankName, branchName } =
      req.body;
    if (!accountNumber || !ifscCode) {
      return sendResponse(
        res,
        false,
        null,
        "Account number and IFSC code are required",
      );
    }
    let app = await SellerApplication.findOne({ user: userId });
    if (!app) {
      app = new SellerApplication({ user: userId });
    }
    app.bankDetails = {
      accountNumber: accountNumber.trim(),
      accountHolderName: accountHolderName ? accountHolderName.trim() : "",
      ifscCode: ifscCode.trim().toUpperCase(),
      bankName: bankName ? bankName.trim() : "",
      branchName: branchName ? branchName.trim() : "",
    };
    if (app.status === "rejected") {
      app.status = "draft";
    }
    await app.save();
    await User.findByIdAndUpdate(userId, { onboardingStatus: "in_progress" });
    return sendResponse(res, true, app, "Bank details saved successfully");
  } catch (error) {
    return sendResponse(res, false, null, error.message);
  }
};

const saveDocuments = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      gstNumber,
      panNumber,
      aadhaarNumber,
      gstDocUrl,
      panDocUrl,
      aadhaarDocUrl,
      cancelledChequeUrl,
      addressProofUrl,
    } = req.body;

    let app = await SellerApplication.findOne({ user: userId });
    if (!app) {
      app = new SellerApplication({ user: userId });
    }
    const uploadedGstDoc = req.files?.gstDoc?.[0]?.filename
      ? `/uploads/${req.files.gstDoc[0].filename}`
      : gstDocUrl || app.taxAndDocs?.gstDocUrl || "";
    const uploadedPanDoc = req.files?.panDoc?.[0]?.filename
      ? `/uploads/${req.files.panDoc[0].filename}`
      : panDocUrl || app.taxAndDocs?.panDocUrl || "";
    const uploadedAadhaarDoc = req.files?.aadhaarDoc?.[0]?.filename
      ? `/uploads/${req.files.aadhaarDoc[0].filename}`
      : aadhaarDocUrl || app.taxAndDocs?.aadhaarDocUrl || "";
    const uploadedChequeDoc = req.files?.cancelledCheque?.[0]?.filename
      ? `/uploads/${req.files.cancelledCheque[0].filename}`
      : cancelledChequeUrl || app.taxAndDocs?.cancelledChequeUrl || "";
    const uploadedAddressDoc = req.files?.addressProof?.[0]?.filename
      ? `/uploads/${req.files.addressProof[0].filename}`
      : addressProofUrl || app.taxAndDocs?.addressProofUrl || "";
    app.taxAndDocs = {
      gstNumber: gstNumber
        ? gstNumber.trim().toUpperCase()
        : app.taxAndDocs?.gstNumber || "",
      panNumber: panNumber
        ? panNumber.trim().toUpperCase()
        : app.taxAndDocs?.panNumber || "",
      aadhaarNumber: aadhaarNumber
        ? aadhaarNumber.trim()
        : app.taxAndDocs?.aadhaarNumber || "",
      gstDocUrl: uploadedGstDoc,
      panDocUrl: uploadedPanDoc,
      aadhaarDocUrl: uploadedAadhaarDoc,
      cancelledChequeUrl: uploadedChequeDoc,
      addressProofUrl: uploadedAddressDoc,
    };
    if (app.status === "rejected") {
      app.status = "draft";
    }
    await app.save();
    await User.findByIdAndUpdate(userId, { onboardingStatus: "in_progress" });
    return sendResponse(res, true, app, "Documents saved successfully");
  } catch (error) {
    return sendResponse(res, false, null, error.message);
  }
};
const getOnboardingStatus = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).populate("storeId");
    let application = await SellerApplication.findOne({
      user: userId,
    }).populate("businessDetails.categoryId", "name");
    return sendResponse(
      res,
      true,
      {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          storeId: user.storeId,
          onboardingStatus: user.onboardingStatus,
        },
        application: application || null,
      },
      "Onboarding status retrieved successfully",
    );
  } catch (error) {
    return sendResponse(res, false, null, error.message);
  }
};

const submitApplication = async (req, res) => {
  try {
    const userId = req.user._id;
    const app = await SellerApplication.findOne({ user: userId });
    if (!app) {
      return sendResponse(
        res,
        false,
        null,
        "Please complete onboarding steps before submitting.",
      );
    }
    if (!app.businessDetails?.storeName) {
      return sendResponse(res, false, null, "Business details are incomplete.");
    }
    app.status = "submitted";
    app.rejectionReason = "";
    await app.save();
    await User.findByIdAndUpdate(userId, {
      onboardingStatus: "pending_approval",
    });

    return sendResponse(
      res,
      true,
      app,
      "Seller application submitted for admin approval.",
    );
  } catch (error) {
    return sendResponse(res, false, null, error.message);
  }
};

const getSellerApplications = async (req, res) => {
  try {
    const { status } = req.query;
    const query = status ? { status } : {};
    const applications = await SellerApplication.find(query)
      .populate("user", "name email mobile_number onboardingStatus")
      .sort({ updatedAt: -1 });

    return sendResponse(
      res,
      true,
      applications,
      "Seller applications fetched successfully",
    );
  } catch (error) {
    return sendResponse(res, false, null, error.message);
  }
};

const approveSellerApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;

    const app =
      await SellerApplication.findById(applicationId).populate("user");
    if (!app) {
      return sendResponse(res, false, null, "Application not found");
    }

    if (app.status === "approved") {
      return sendResponse(res, false, null, "Application is already approved.");
    }
    if (!app.businessDetails?.categoryId) {
      return sendResponse(
        res,
        false,
        null,
        "Application has no category selected.",
      );
    }

    const { businessDetails, pickupAddress, taxAndDocs } = app;
    const storeName = businessDetails.storeName;
    const storeEmail = businessDetails.email || app.user.email;
    const domain =
      businessDetails.domain ||
      slugify(storeName, { lower: true, strict: true });

    const store = await Store.create({
      name: storeName,
      email: storeEmail,
      phone: businessDetails.phone || app.user.mobile_number || "",
      gst_number: taxAndDocs.gstNumber || "",
      website: businessDetails.website || "",
      domain: domain,
      description: businessDetails.description || "",
      categoryId: businessDetails.categoryId,
      address: pickupAddress
        ? {
            street: pickupAddress.street || "",
            city: pickupAddress.city || "",
            state: pickupAddress.state || "",
            country: pickupAddress.country || "India",
            zip_code: pickupAddress.zip_code || "",
          }
        : {},
      status: "active",
    });

    await User.findByIdAndUpdate(app.user._id, {
      role: "store_owner",
      storeId: store._id,
      domain: domain,
      onboardingStatus: "approved",
    });

    app.status = "approved";
    app.rejectionReason = "";
    await app.save();

    return sendResponse(
      res,
      true,
      { store, application: app },
      "Seller application approved successfully! Store created.",
    );
  } catch (error) {
    return sendResponse(res, false, null, error.message);
  }
};

const rejectSellerApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { rejectionReason } = req.body;

    if (!rejectionReason) {
      return sendResponse(res, false, null, "Rejection reason is required.");
    }

    const app = await SellerApplication.findById(applicationId);
    if (!app) {
      return sendResponse(res, false, null, "Application not found");
    }

    app.status = "rejected";
    app.rejectionReason = rejectionReason;
    await app.save();

    await User.findByIdAndUpdate(app.user, { onboardingStatus: "rejected" });

    return sendResponse(res, true, app, "Seller application rejected.");
  } catch (error) {
    return sendResponse(res, false, null, error.message);
  }
};

module.exports = {
  saveBusinessDetails,
  savePickupAddress,
  saveBankDetails,
  saveDocuments,
  getOnboardingStatus,
  submitApplication,
  getSellerApplications,
  approveSellerApplication,
  rejectSellerApplication,
};
