const express = require("express");
const router = express.Router();
const {
  getUserSettings,
  updateUserSettings,
} = require("../controllers/settingController");
const { authMiddleware,authorizeMinRole } = require("../middlewares/authMiddleware");

router.use(authMiddleware);
router.get("/", authorizeMinRole("admin"), getUserSettings);
router.put("/", authorizeMinRole("admin"), updateUserSettings);

module.exports = router;
