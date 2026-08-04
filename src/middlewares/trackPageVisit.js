const PageVisit = require("../models/PageVisit");
const logPageVisit = async (req, res) => {
  try {
    const { page } = req.body;
    await PageVisit.create({ userId: req.user._id, page });
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false });
  }
};
module.exports = { logPageVisit };