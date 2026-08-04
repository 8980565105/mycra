const express = require("express");
const router = express.Router();

const {
  authMiddleware,
  authorizeMinRole,
} = require("../middlewares/authMiddleware");

const {
  injectPublicStoreFilter,
  injectOwnershipFilter,
} = require("../middlewares/ownershipFilter");

const {
  getPages,
  getPageById,
  createPage,
  updatePage,
  updatePageStatus,
  deletePage,
  bulkDeletePages,
  getPageBySlug,
} = require("../controllers/pageController");

router.get("/get/:slug", injectPublicStoreFilter, getPageBySlug);

router.use(authMiddleware, injectOwnershipFilter);

router.get("/", authorizeMinRole("admin"), getPages);
router.get("/:id", authorizeMinRole("admin"), getPageById);
router.post("/", authorizeMinRole("admin"), createPage);
router.put("/:id", authorizeMinRole("admin"), updatePage);
router.put("/:id/status", authorizeMinRole("admin"), updatePageStatus);
router.delete("/:id", authorizeMinRole("admin"), deletePage);
router.post("/bulk-delete", authorizeMinRole("admin"), bulkDeletePages);

module.exports = router;
