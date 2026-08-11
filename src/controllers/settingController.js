const Setting = require("../models/Setting");
const { sendResponse } = require("../utils/response");

const getUserSettings = async (req, res) => {
  try {
    const userId = req.user._id;
    const storeId = req.user.storeId || null;
    let query = storeId ? { storeId } : { storeId: null };
    let setting = await Setting.findOne(query);
    if (!setting && !storeId) {
      setting = await Setting.findOne({});
    }
    if (!setting) {
      return sendResponse(res, true, null, "No settings found");
    }
    sendResponse(res, true, setting, "User settings fetched successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const updateUserSettings = async (req, res) => {
  try {
    const userId = req.user._id;
    const storeId = req.user.storeId || null;
    const data = { ...req.body };
    const platformType = data.platform_charge_type || "free";
    let platformValue = Number(data.platform_charge_value ?? 0);
    if (platformValue < 0) {
      return sendResponse(
        res,
        false,
        null,
        "Platform charge value cannot be negative",
      );
    }
    if (platformType === "free") {
      platformValue = 0;
    }
    if (platformType === "percentage") {
      if (platformValue > 100) {
        return sendResponse(
          res,
          false,
          null,
          "Platform percentage cannot be greater than 100%",
        );
      }
    }
    if (!["free", "flat", "percentage"].includes(platformType)) {
      return sendResponse(res, false, null, "Invalid platform charge type");
    }
    data.platform_charge_type = platformType;
    data.platform_charge_value = platformValue;
    let setting = null;
    if (storeId) {
      setting = await Setting.findOne({ storeId });
    } else {
      setting =
        (await Setting.findOne({ storeId: null })) ||
        (await Setting.findOne({}));
    }
    if (setting) {
      setting = await Setting.findByIdAndUpdate(
        setting._id,
        {
          ...data,
          user: userId,
          storeId: storeId,
        },
        {
          new: true,
          runValidators: true,
        },
      );
    } else {
      setting = await Setting.create({
        ...data,
        user: userId,
        storeId: storeId,
      });
    }
    sendResponse(res, true, setting, "Settings saved successfully");
  } catch (err) {
    console.error("Update Settings Error:", err);

    sendResponse(res, false, null, err.message);
  }
};

const getPublicSettings = async (req, res) => {
  try {
    const storeId = req.storeFilter?.storeId;
    let setting = null;
    if (storeId) {
      setting = await Setting.findOne({ storeId });
    }
    if (!setting) {
      setting = await Setting.findOne({ storeId: null });
    }
    if (!setting) {
      setting = await Setting.findOne({}).sort({ createdAt: -1 });
    }
    if (!setting) {
      return sendResponse(res, true, null, "No settings found");
    }
    sendResponse(res, true, setting, "Public settings fetched successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

module.exports = {
  getUserSettings,
  updateUserSettings,
  getPublicSettings,
};
