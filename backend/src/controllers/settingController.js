// const Setting = require("../models/Setting");
// const { sendResponse } = require("../utils/response");

// const getUserSettings = async (req, res) => {
//   try {
//     const userId = req.user._id;
//     const setting = await Setting.findOne({ user: userId });

//     if (!setting) {
//       return sendResponse(res, true, null, "No settings found for this user");
//     }

//     sendResponse(res, true, setting, "User settings fetched successfully");
//   } catch (err) {
//     sendResponse(res, false, null, err.message);
//   }
// };

// const updateUserSettings = async (req, res) => {
//   try {
//     const userId = req.user._id;
//     const data = req.body;

//     let setting = await Setting.findOne({ user: userId });

//     if (setting) {
//       setting = await Setting.findOneAndUpdate({ user: userId }, data, {
//         new: true,
//       });
//       sendResponse(res, true, setting, "Settings updated successfully");
//     } else {
//       setting = new Setting({ ...data, user: userId });
//       await setting.save();
//       sendResponse(res, true, setting, "Settings created successfully");
//     }
//   } catch (err) {
//     sendResponse(res, false, null, err.message);
//   }
// };

// const getPublicSettings = async (req, res) => {
//   try {
//     const storeId = req.storeFilter?.storeId;

//     let setting = null;

//     if (storeId) {
//       setting = await Setting.findOne({ storeId });
//     }

//     if (!setting) {
//       setting = await Setting.findOne({}).sort({ createdAt: -1 });
//     }

//     if (!setting) {
//       return sendResponse(res, true, null, "No settings found");
//     }

//     sendResponse(res, true, setting, "Public settings fetched successfully");
//   } catch (err) {
//     sendResponse(res, false, null, err.message);
//   }
// };

// module.exports = {
//   getUserSettings,
//   getPublicSettings,
//   updateUserSettings,
// };

const Setting = require("../models/Setting");
const { sendResponse } = require("../utils/response");

// GET — auth user ni settings
const getUserSettings = async (req, res) => {
  try {
    const userId = req.user._id;
    const storeId = req.user.storeId || null;

    // store_owner → storeId thi dhundo, admin → user thi
    const query = storeId ? { storeId } : { user: userId };
    const setting = await Setting.findOne(query);

    if (!setting) {
      return sendResponse(res, true, null, "No settings found for this user");
    }
    sendResponse(res, true, setting, "User settings fetched successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

// PUT — settings save karo with storeId
const updateUserSettings = async (req, res) => {
  try {
    const userId = req.user._id;
    const storeId = req.user.storeId || null;
    const data = req.body;

    // Query — store_owner storeId thi, admin user thi
    const query = storeId ? { storeId } : { user: userId };

    let setting = await Setting.findOne(query);

    if (setting) {
      setting = await Setting.findOneAndUpdate(query, data, { new: true });
      sendResponse(res, true, setting, "Settings updated successfully");
    } else {
      // ✅ New create — storeId ane user dono save karo
      setting = new Setting({
        ...data,
        user: userId,
        storeId: storeId, // ✅ KEY FIX
      });
      await setting.save();
      sendResponse(res, true, setting, "Settings created successfully");
    }
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

// GET PUBLIC — domain thi storeId resolve karine settings apo
const getPublicSettings = async (req, res) => {
  try {
    const storeId = req.storeFilter?.storeId;

    let setting = null;

    if (storeId) {
      setting = await Setting.findOne({ storeId });
    }

    // Fallback — koi setting na male to latest apo
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