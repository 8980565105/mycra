import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { toast } from "sonner";

import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ConfirmDialog } from "@/components/ui/confirmDialog";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Search,
  Trash2,
  X,
  Eye,
  Download,
  RefreshCw,
  CheckCircle,
  Clock,
  XCircle,
  FileText,
  CreditCard,
  ShoppingBag,
  User,
  Trash,
} from "lucide-react";

import {
  bulkDeleteTransactions,
  deleteTransaction,
  fetchAllTransactionsAdmin,
  updateAdminTransactionStatus,
} from "@/features/transection/transectionThunk";

type Transaction = RootState["transection"]["adminTransactions"][number];

interface TransactionFilters {
  category: string;
  type: string;
  paymentMode: string;
  tab: string;
  startDate: string;
  endDate: string;
}
const formatCurrency = (amount?: number | string | null) => {
  const value = Number(amount ?? 0);

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);
};


const formatDate = (date?: string | Date | null) => {
  if (!date) return "—";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "—";
  }

  return parsedDate.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};
export default function Transection() {
  const dispatch = useDispatch<AppDispatch>();

  const { summary } = useSelector(
    (state: RootState) => state.transection
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [total, setTotal] = useState(0);
  const [tableLoading, setTableLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [filters, setFilters] = useState<TransactionFilters>({
    category: "",
    type: "",
    paymentMode: "",
    tab: "All",
    startDate: "",
    endDate: "",
  });

  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setPage(1);
    }, 500);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  const updateFilter = (
    key: keyof TransactionFilters,
    value: string
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));

    setPage(1);
    setSelectedIds([]);
  };

  const clearFilters = () => {
    setFilters({
      category: "",
      type: "",
      paymentMode: "",
      tab: "All",
      startDate: "",
      endDate: "",
    });

    setSelectedStatus("all");
    setSearchQuery("");
    setDebouncedQuery("");
    setPage(1);
    setSelectedIds([]);
  };

  const loadTransactions = async () => {
    setTableLoading(true);

    try {
      const params = {
        page,
        limit,
        search: debouncedQuery || undefined,

        status:
          selectedStatus === "all"
            ? undefined
            : selectedStatus,

        category: filters.category || undefined,
        type: filters.type || undefined,
        paymentMode: filters.paymentMode || undefined,

        tab:
          filters.tab === "All"
            ? undefined
            : filters.tab,

        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,

        sort: "desc",
      };

      const res = await dispatch(
        fetchAllTransactionsAdmin(params)
      ).unwrap();

      setTransactions(res?.transactions || []);
      setTotal(Number(res?.total || 0));
    } catch (error: any) {
      console.error("Fetch transactions error:", error);

      toast.error(
        error?.message || "Failed to fetch transactions"
      );

      setTransactions([]);
      setTotal(0);
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, [
    dispatch,
    page,
    debouncedQuery,
    selectedStatus,
    filters,
  ]);

  const handleViewTransaction = (transaction: Transaction) => {
    console.log("VIEW TRANSACTION CLICKED:", transaction);

    setSelectedTransaction(transaction);
    setNewStatus(transaction?.status || "Pending");
    setViewModalOpen(true);
  };

  const closeViewModal = () => {
    setViewModalOpen(false);
    setSelectedTransaction(null);
    setNewStatus("");
  };

  const getOrderObject = (transaction: Transaction) => {
    const orderId = transaction?.order_id;

    if (orderId && typeof orderId === "object") {
      return orderId;
    }

    return transaction?.order || null;
  };

  const getOrderId = (transaction: Transaction) => {
    const orderId = transaction?.order_id;

    if (orderId && typeof orderId === "object") {
      return orderId._id || "—";
    }

    return orderId || "—";
  };

  const getOrderNumber = (transaction: Transaction) => {
    const order = getOrderObject(transaction);

    return order?.order_number || "—";
  };

  const getOrderTotal = (transaction: Transaction) => {
    const order = getOrderObject(transaction);

    return (
      order?.order_total ??
      order?.total_price ??
      0
    );
  };
  const getTransactionAmount = (transaction: Transaction) => {
    return Number(
      transaction?.amount ??
      transaction?.amount_paid ??
      0
    );
  };

  const getStatusClass = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "success":
        return "bg-green-100 text-green-700";

      case "pending":
        return "bg-yellow-100 text-yellow-700";

      case "failed":
        return "bg-red-100 text-red-700";

      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedTransaction) return;

    if (
      selectedTransaction.status?.toLowerCase() === "success"
    ) {
      toast.error(
        "Successful transactions cannot be changed."
      );
      return;
    }

    if (!newStatus) {
      toast.error("Please select a status.");
      return;
    }

    if (newStatus === selectedTransaction.status) {
      toast.info("No status changes detected.");
      return;
    }

    setStatusUpdating(true);

    try {
      await dispatch(
        updateAdminTransactionStatus({
          id: selectedTransaction._id,
          status: newStatus,
        } as any)
      ).unwrap();

      toast.success("Transaction status updated.");

      setSelectedTransaction((prev) =>
        prev ? { ...prev, status: newStatus } : null
      );

      await loadTransactions();

      closeViewModal();
    } catch (error: any) {
      console.error("Status update error:", error);

      toast.error(
        error?.message || "Failed to update transaction status"
      );
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    try {
      await dispatch(deleteTransaction(id)).unwrap();

      toast.success("Transaction deleted.");

      setSelectedIds((prev) =>
        prev.filter((item) => item !== id)
      );

      await loadTransactions();
    } catch (error: any) {
      toast.error(
        error?.message || "Failed to delete transaction"
      );
    }
  };

  const handleBulkDelete = async () => {
    if (!selectedIds.length) return;

    try {
      await dispatch(
        bulkDeleteTransactions(selectedIds)
      ).unwrap();

      toast.success(
        `${selectedIds.length} transactions deleted.`
      );

      setSelectedIds([]);
      await loadTransactions();
    } catch (error: any) {
      toast.error(
        error?.message || "Failed to delete transactions"
      );
    }
  };
  const handleExport = () => {
    if (!transactions.length) {
      toast.error("No transactions to export.");
      return;
    }

    const headers = [
      "Transaction ID",
      "Customer",
      "Order Number",
      "Category",
      "Type",
      "Payment Method",
      "Amount",
      "Status",
      "Date",
    ];

    const rows = transactions.map((transaction) => [
      transaction.transaction_id ||
        transaction.referenceId ||
        transaction._id,

      transaction.user?.name || "",
      getOrderNumber(transaction),
      transaction.category || "",
      transaction.type || "",
      transaction.paymentMode || "",
      getTransactionAmount(transaction),
      transaction.status || "",
      formatDate(transaction.payment_date || transaction.createdAt),
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map(
            (value) =>
              `"${String(value ?? "").replace(/"/g, '""')}"`
          )
          .join(",")
      )
      .join("\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `transactions_${Date.now()}.csv`;
    link.click();

    URL.revokeObjectURL(url);
  };

  const totalPages = Math.ceil(total / limit);
  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    selectedStatus !== "all" ||
    filters.category !== "" ||
    filters.type !== "" ||
    filters.paymentMode !== "" ||
    filters.tab !== "All" ||
    filters.startDate !== "" ||
    filters.endDate !== "";

  return (
    <div className="mx-auto p-6 space-y-6">


      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Transaction Management
          </h1>

          <p className="text-sm text-gray-500">
            Manage and monitor all customer transactions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            onClick={handleExport}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export Excel
          </Button>

          {selectedIds.length > 0 && (
            <ConfirmDialog
              title="Delete Selected Transactions"
              description={`Delete ${selectedIds.length} selected transactions?`}
              confirmText="Delete All"
              onConfirm={handleBulkDelete}
              danger
            >
              <Button
                variant="destructive"
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete Selected ({selectedIds.length})
              </Button>
            </ConfirmDialog>
          )}
        </div>
      </div>
      
      <div className="w-full">
        <CardContent className="p-0 flex flex-col lg:flex-row lg:items-center gap-3">

          {/* Search */}
          <div className="relative w-full lg:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

            <Input
              placeholder="Search transaction..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-1 flex-wrap items-center gap-3">
            <Select
              value={selectedStatus}
              onValueChange={(value) => {
                setSelectedStatus(value);
                setPage(1);
                setSelectedIds([]);
              }}
            >
              <SelectTrigger className="w-full sm:w-[150px] text-left">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Success">Success</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Failed">Failed</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.category || "all"}
              onValueChange={(value) =>
                updateFilter("category", value === "all" ? "" : value)
              }
            >
              <SelectTrigger className="w-full sm:w-[175px] text-left">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Financial Services">Financial Services</SelectItem>
                <SelectItem value="Online Order">Online Order</SelectItem>
                <SelectItem value="Order">Order</SelectItem>
                <SelectItem value="Credit Card Payment">Credit Card Payment</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.type || "all"}
              onValueChange={(value) =>
                updateFilter("type", value === "all" ? "" : value)
              }
            >
              <SelectTrigger className="w-full sm:w-[155px] text-left">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Money sent">Money sent</SelectItem>
                <SelectItem value="Money received">Money received</SelectItem>
                <SelectItem value="Self transfer">Self transfer</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.paymentMode || "all"}
              onValueChange={(value) =>
                updateFilter("paymentMode", value === "all" ? "" : value)
              }
            >
              <SelectTrigger className="w-full sm:w-[180px] text-left">
                <SelectValue placeholder="Payment Method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payment Methods</SelectItem>
                <SelectItem value="Stripe">Stripe</SelectItem>
                <SelectItem value="UPI">UPI</SelectItem>
                <SelectItem value="Wallet">Wallet</SelectItem>
                <SelectItem value="Net Banking">Net Banking</SelectItem>
                <SelectItem value="Credit/Debit Card">Credit/Debit Card</SelectItem>
                <SelectItem value="Cash on Delivery">Cash on Delivery</SelectItem>
                <SelectItem value="Amazon Pay Balance">Amazon Pay Balance</SelectItem>
                <SelectItem value="Amazon Credit">Amazon Credit</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.tab}
              onValueChange={(value) => updateFilter("tab", value)}
            >
              <SelectTrigger className="w-full sm:w-[135px] text-left">
                <SelectValue placeholder="Tab" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All</SelectItem>
                <SelectItem value="Refund">Refund</SelectItem>
                <SelectItem value="Cashback">Cashback</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {hasActiveFilters && (
            <div className="flex justify-end shrink-0">
              <Button
                type="button"
                variant="outline"
                onClick={clearFilters}
                className="flex items-center gap-2 whitespace-nowrap"
              >
                <X className="h-4 w-4" />
                Clear Filters
              </Button>
            </div>
          )}
        </CardContent>
      </div>

      <Card className="border border-gray-200 shadow-sm rounded-lg overflow-hidden">

        <CardContent className="p-0">
          <div className="overflow-x-auto relative">

            <table className="w-full text-sm text-gray-700">
              <thead className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500">
                <tr>
                  <th className="p-3 text-left w-10">
                    <Checkbox
                      checked={
                        transactions.length > 0 &&
                        transactions.every((item) =>
                          selectedIds.includes(item._id)
                        )
                      }
                      onCheckedChange={(checked) => {
                        setSelectedIds((prev) => {
                          if (checked) {
                            return Array.from(
                              new Set([
                                ...prev,
                                ...transactions.map(
                                  (item) => item._id
                                ),
                              ])
                            );
                          }

                          return prev.filter(
                            (id) =>
                              !transactions.some(
                                (item) => item._id === id
                              )
                          );
                        });
                      }}
                    />
                  </th>

                  <th className="p-3 text-left whitespace-nowrap">Transaction ID</th>
                  <th className="p-3 text-left">Customer</th>
                  <th className="p-3 text-left whitespace-nowrap">Order Number</th>
                  <th className="p-3 text-left whitespace-nowrap">Category</th>
                  <th className="p-3 text-left whitespace-nowrap">Payment Method</th>
                  <th className="p-3 text-left">Amount</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-left whitespace-nowrap">Date</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {!tableLoading && transactions.length === 0 ? (
                  <tr>
                    <td
                      colSpan={11}
                      className="p-10 text-center text-gray-400"
                    >
                      No transactions found.
                    </td>
                  </tr>
                ) : (
                  transactions.map((transaction) => (
                    <tr
                      key={transaction._id}
                      className="hover:bg-gray-50 transition"
                    >
                      <td className="p-3">
                        <Checkbox
                          checked={selectedIds.includes(
                            transaction._id
                          )}
                          onCheckedChange={(checked) => {
                            setSelectedIds((prev) =>
                              checked
                                ? Array.from(
                                    new Set([
                                      ...prev,
                                      transaction._id,
                                    ])
                                  )
                                : prev.filter(
                                    (id) => id !== transaction._id
                                  )
                            );
                          }}
                        />
                      </td>
                      <td className="p-3 font-medium whitespace-nowrap max-w-[180px] truncate">
                          <p className=" truncate font-medium ">
                            {transaction._id}
                          </p>
                          <p className="mt-1 max-w-[150px] truncate text-xs text-gray-400">
                            Ref: {transaction.referenceId || "-"}
                          </p>
                      </td>

                      <td className="p-3 whitespace-nowrap">
                        <p className="font-medium text-gray-800">
                          {transaction.user?.name || "—"}
                        </p>
                        <p className="text-xs text-gray-400">
                          {transaction.user?.email || ""}
                        </p>
                      </td>

                      <td className="p-3 whitespace-nowrap">
                        {getOrderNumber(transaction)}
                      </td>

                      <td className="p-3 whitespace-nowrap">
                        {transaction.category || "—"}
                      </td>

                      <td className="p-3 whitespace-nowrap">
                        {transaction.paymentMode || "—"}
                      </td>

                      <td className="p-3 text-left whitespace-nowrap">
                        {formatCurrency(
                          getTransactionAmount(transaction)
                        )}
                      </td>

                      <td className="p-3">
                        <span
                          className={`text-xs px-2 py-1 rounded-full font-semibold whitespace-nowrap ${getStatusClass(
                            transaction.status
                          )}`}
                        >
                          {transaction.status || "—"}
                        </span>
                      </td>

                      <td className="p-3 whitespace-nowrap text-xs text-gray-500">
                        {formatDate(transaction?.createdAt)}
                      </td>

                      <td className="p-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleViewTransaction(transaction) }
                            className="p-1 rounded hover:bg-gray-100 flex items-center justify-center"
                            title="View Details"
                          >
                            <Eye className="w-5 h-5 text-blue-600 hover:text-blue-800" />
                          </button>

                          <ConfirmDialog
                            title="Delete Transaction"
                            description="Are you sure you want to delete this transaction?"
                            confirmText="Delete"
                            onConfirm={() =>
                              handleDeleteTransaction(transaction._id)
                            }
                            danger
                          >
                            <button
                              type="button"
                              className="text-red-500 hover:bg-red-50"
                            >
                              <Trash className="w-5 h-5 text-red-600 hover:text-red-800" />
                            </button>
                          </ConfirmDialog>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}

          {totalPages > 1 && (
            <div className="flex flex-wrap items-center justify-end gap-3 p-4 border-t border-gray-100">

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={page === 1 || tableLoading}
                >
                  Prev
                </Button>

                {Array.from(
                  { length: totalPages },
                  (_, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setPage(index + 1)}
                      disabled={tableLoading}
                      className={`px-3 py-1 rounded text-sm ${
                        page === index + 1
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {index + 1}
                    </button>
                  )
                )}

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setPage((prev) => Math.min(prev + 1, totalPages)
                    )
                  }
                  disabled={
                    page === totalPages || tableLoading
                  }
                >
                  Next
                </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {viewModalOpen && selectedTransaction && (
        <div className=" fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50"
          onClick={closeViewModal}
        >
          <div className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto bg-white shadow-2xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* MODAL HEADER */}

            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-800">
                  Transaction Details
                </h3>
                <p className="mt-1 text-xs text-gray-500">
                  Complete transaction and payment information
                </p>
              </div>

              <button
                type="button"
                onClick={closeViewModal}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-6 space-y-6">

              {/* AMOUNT + STATUS */}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-lg border bg-slate-50 p-4">
                  <p className="text-sm text-gray-500">
                    Transaction Amount
                  </p>

                  <h3 className="mt-2 text-2xl font-bold text-gray-900">
                    {formatCurrency(
                      getTransactionAmount(selectedTransaction)
                    )}
                  </h3>

                  <p className="mt-1 text-xs text-gray-500">
                    {selectedTransaction.currency?.toUpperCase() ||
                      "INR"}
                  </p>
                </div>

                <div className="rounded-lg border bg-slate-50 p-4">
                  <p className="text-sm text-gray-500">
                    Transaction Status
                  </p>

                  <div className="mt-3">
                    <span
                      className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold ${getStatusClass(
                        selectedTransaction.status
                      )}`}
                    >
                      {selectedTransaction.status?.toLowerCase() ===
                      "success" ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : selectedTransaction.status?.toLowerCase() ===
                        "pending" ? (
                        <Clock className="h-4 w-4" />
                      ) : (
                        <XCircle className="h-4 w-4" />
                      )}

                      {selectedTransaction.status || "Unknown"}
                    </span>
                  </div>
                </div>
              </div>

              {/* TRANSACTION INFORMATION */}

              <div>
                <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <FileText
                    size={16}
                    className="text-blue-600"
                  />
                  Transaction Information
                </h4>

                <div className="grid grid-cols-1 gap-3 rounded-lg border bg-slate-50 p-4 text-sm sm:grid-cols-2">
                  <div className="min-w-0">
                    <strong>Transaction ID:</strong>
                    <p className="break-all text-gray-600">
                      {selectedTransaction._id || "—"}
                    </p>
                  </div>

                  <div className="min-w-0">
                    <strong>Reference ID:</strong>
                    <p className="break-all text-gray-600">
                      {selectedTransaction.referenceId || "—"}
                    </p>
                  </div>

                  <div>
                    <strong>Category:</strong>
                    <p className="text-gray-600">
                      {selectedTransaction.category || "—"}
                    </p>
                  </div>

                  <div>
                    <strong>Type:</strong>
                    <p className="text-gray-600">
                      {selectedTransaction.type || "—"}
                    </p>
                  </div>

                  <div>
                    <strong>Payment Method:</strong>
                    <p className="text-gray-600">
                      {selectedTransaction.paymentMode || "—"}
                    </p>
                  </div>

                  <div>
                    <strong>Payment Date:</strong>
                    <p className="text-gray-600">
                      {formatDate(
                        selectedTransaction.payment_date ||
                        selectedTransaction.createdAt
                      )}
                    </p>
                  </div>

                  <div>
                    <strong>Last Updated:</strong>
                    <p className="text-gray-600">
                      {formatDate(selectedTransaction.updatedAt)}
                    </p>
                  </div>

                  <div>
                    <strong>Currency:</strong>
                    <p className="text-gray-600">
                      {selectedTransaction.currency?.toUpperCase() ||
                        "INR"}
                    </p>
                  </div>

                  <div className="sm:col-span-2">
                    <strong>Description:</strong>
                    <p className="text-gray-600">
                      {selectedTransaction.description ||
                        selectedTransaction.note ||
                        "—"}
                    </p>
                  </div>
                </div>
              </div>

              {/* CUSTOMER INFORMATION */}

              <div>
                <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <User size={16} className="text-blue-600" />
                  Customer Information
                </h4>

                <div className="grid grid-cols-1 gap-3 rounded-lg border bg-slate-50 p-4 text-sm sm:grid-cols-2">
                  <div>
                    <strong>Name:</strong>
                    <p className="text-gray-600">
                      {selectedTransaction.user?.name || "—"}
                    </p>
                  </div>

                  <div>
                    <strong>Email Address:</strong>
                    <p className="break-all text-gray-600">
                      {selectedTransaction.user?.email || "—"}
                    </p>
                  </div>

                  <div>
                    <strong>Customer ID:</strong>
                    <p className="break-all text-gray-600">
                      {selectedTransaction.user?._id || "—"}
                    </p>
                  </div>

                  <div>
                    <strong>Phone:</strong>
                    <p className="text-gray-600">
                      {selectedTransaction.user?.phone || "—"}
                    </p>
                  </div>
                </div>
              </div>

              {/* ORDER INFORMATION */}

              <div>
                <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <ShoppingBag
                    size={16}
                    className="text-blue-600"
                  />
                  Order Information
                </h4>

                <div className="grid grid-cols-1 gap-3 rounded-lg border bg-slate-50 p-4 text-sm sm:grid-cols-2">
                  <div>
                    <strong>Order ID:</strong>
                    <p className="break-all text-gray-600">
                      {getOrderId(selectedTransaction)}
                    </p>
                  </div>

                  <div>
                    <strong>Order Number:</strong>
                    <p className="text-gray-600">
                      {getOrderNumber(selectedTransaction)}
                    </p>
                  </div>

                  <div>
                    <strong>Order Total:</strong>
                    <p className="font-semibold text-gray-800">
                      {formatCurrency(
                        getOrderTotal(selectedTransaction)
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* STRIPE INFORMATION */}

              <div>
                <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <CreditCard
                    size={16}
                    className="text-blue-600"
                  />
                  Payment Gateway Details
                </h4>

                <div className="grid grid-cols-1 gap-3 rounded-lg border bg-slate-50 p-4 text-sm">
                  <div>
                    <strong>Stripe Payment Intent ID:</strong>
                    <p className="break-all text-gray-600">
                      {selectedTransaction.stripe_payment_intent_id ||
                        "—"}
                    </p>
                  </div>

                  <div>
                    <strong>Stripe Charge ID:</strong>
                    <p className="break-all text-gray-600">
                      {selectedTransaction.stripe_charge_id || "—"}
                    </p>
                  </div>
                </div>
              </div>

              {/* STATUS UPDATE */}

              <div className="rounded-lg border p-4">
                <h4 className="mb-3 text-sm font-bold text-gray-900">
                  Update Transaction Status
                </h4>

                {selectedTransaction.status?.toLowerCase() ===
                "success" ? (
                  <p className="text-sm text-gray-500">
                    Successful transactions cannot be changed from
                    this screen.
                  </p>
                ) : (
                  <>
                    <select
                      value={newStatus}
                      disabled={statusUpdating}
                      onChange={(e) =>
                        setNewStatus(e.target.value)
                      }
                      className="w-full rounded-lg border bg-slate-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Success">Success</option>
                      <option value="Failed">Failed</option>
                    </select>

                    <div className="mt-4 flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={closeViewModal}
                        disabled={statusUpdating}
                      >
                        Cancel
                      </Button>

                      <Button
                        type="button"
                        onClick={handleStatusUpdate}
                        disabled={
                          statusUpdating ||
                          !newStatus ||
                          newStatus === selectedTransaction.status
                        }
                      >
                        {statusUpdating
                          ? "Updating..."
                          : "Update Status"}
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
