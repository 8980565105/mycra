const express = require("express");
const router = express.Router();

const { logPageVisit } = require("../middlewares/trackPageVisit");
const { authMiddleware } = require("../middlewares/authMiddleware");

router.post("/", authMiddleware, logPageVisit);
module.exports = router;
