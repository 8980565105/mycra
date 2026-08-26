const express = require("express");
const router = express.Router();

const {
  createEmails,
  getEmails,
  getEmailById,
  updateEmail,
  deleteEmail,
  bulkDeleteEmails,
} = require("../controllers/emailController");

const {
  authorizeMinRole,
  authMiddleware,
} = require("../middlewares/authMiddleware");
router.post("/", createEmails);
router.use(authMiddleware);
router.get("/", authorizeMinRole("admin"), getEmails);
router.get("/:id", authorizeMinRole("admin"), getEmailById);
router.put("/:id", authorizeMinRole("admin"), updateEmail);
router.delete("/:id", authorizeMinRole("admin"), deleteEmail);
router.post("/bulk-delete", authorizeMinRole("admin"), bulkDeleteEmails);
module.exports = router;
