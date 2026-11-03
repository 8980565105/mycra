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
    getTransectionFilterOptions,
    deleteTransaction,
    bulkDeleteTransactions,
    } = require("../controllers/transectionController");

    router.get("/", authMiddleware, getTransactions);
    router.get("/filter-options", authMiddleware, getTransectionFilterOptions);
    router.get("/:id", authMiddleware, getTransactionById);
    router.get(
    "/admin/all",
    authMiddleware,
    authorizeMinRole("store_owner"),
    getAllTransactionsAdmin,
    );

    router.put(
    "/admin/:id/status",
    authMiddleware,
    authorizeMinRole("admin"),
    updateTransactionStatus,
    );
    
    router.delete("/:id", authMiddleware, authorizeMinRole("admin"), deleteTransaction);
    router.post("/bulk-delete", authMiddleware, authorizeMinRole("admin"), bulkDeleteTransactions);
    module.exports = router;
