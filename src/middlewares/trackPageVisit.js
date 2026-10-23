// const PageVisit = require("../models/PageVisit");
// const logPageVisit = async (req, res) => {
//   try {
//     const { page } = req.body;
//     await PageVisit.create({ userId: req.user._id, page });
//     return res.json({ success: true });
//   } catch (err) {
//     return res.status(500).json({ success: false });
//   }
// };
// module.exports = { logPageVisit };



const PageVisit = require("../models/PageVisit");
const logPageVisit = async (req, res) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({
        success: false, message: "User authentication required",
      });
    }

    const { page } = req.body;

    if (typeof page !== "string" || !page.trim()) {
      return res.status(400).json({
        success: false, message: "Valid page path is required",
      });
    }

    await PageVisit.create({ userId: req.user._id, page: page.trim() });

    return res.status(201).json({
      success: true, message: "Page visit logged successfully",
    });
  } catch (err) {
    return res.status(500).json({
      success: false, message: "Failed to log page visit",
    });
  }
};
module.exports = { logPageVisit };