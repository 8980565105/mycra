    const express = require("express");
    const router = express.Router();
    const {
    authMiddleware,
    authorizeMinRole,
    } = require("../middlewares/authMiddleware");

    const {
    getTransactionById,
    getTransactions,
    updateTransactionStatus,
    getAllTransactionsAdmin,
    } = require("../controllers/transectionController");

    router.get("/", authMiddleware, getTransactions);
    router.get("/:id", authMiddleware, getTransactionById);

    router.get(
    "/admin/all",
    authMiddleware,
    authorizeMinRole("store_owner"),
    getAllTransactionsAdmin,
    );

    router.put(
    "/admin/status/:id",
    authMiddleware,
    authorizeMinRole("admin"),
    updateTransactionStatus,
    );

    module.exports = router;
