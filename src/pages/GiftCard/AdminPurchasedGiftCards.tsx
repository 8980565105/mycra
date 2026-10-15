import { useCallback } from "react";
import { useDispatch } from "react-redux";

import type { AppDispatch } from "@/store";
import { GenericTable } from "@/components/ui/adminTable";
import { adminGetAllPurchasedGiftCards } from "@/features/giftCards/giftCardThunk";

interface GiftCardUser {
  _id?: string;
  name?: string;
  email?: string;
  mobile_number?: string;
}

type UserField = GiftCardUser | string | null | undefined;

interface PurchasedGiftCard {
  _id: string;
  cardNumber?: string;
  originalAmount?: number;
  remainingBalance?: number;
  assignedTo?: UserField;
  createdBy?: UserField;
  recipientName?: string;
  recipientEmail?: string;
  gifterName?: string;
  message?: string;
  status?: string;
  source?: string;
  createdAt?: string | null;
}

interface TableParams {
  page: number;
  limit: number;
  search?: string;
}

function getUserName(user: UserField): string {
  if (!user) return "-";

  if (typeof user === "string") return user || "-";

  return user.name || "-";
}

function getUserEmail(user: UserField): string {
  if (!user || typeof user === "string") return "-";

  return user.email || "-";
}

function formatAmount(amount?: number): string {
  return `₹${Number(amount ?? 0).toLocaleString("en-IN")}`;
}

function formatDate(date?: string | null): string {
  if (!date) return "-";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "-";

  return parsedDate.toLocaleDateString("en-IN");
}

function getStatusClass(status?: string): string {
  switch (status?.toLowerCase()) {
    case "active":
      return "bg-green-100 text-green-700";

    case "blocked":
      return "bg-red-100 text-red-700";

    case "redeemed":
      return "bg-blue-100 text-blue-700";

    case "expired":
      return "bg-orange-100 text-orange-700";

    default:
      return "bg-gray-100 text-gray-700";
  }
}

export default function AdminPurchasedGiftCards() {
  const dispatch = useDispatch<AppDispatch>();

  const columns = [
    {
      key: "createdBy",
      label: "Purchaser",
      render: (item: PurchasedGiftCard) =>
        getUserName(item.createdBy),
    },
    {
      key: "purchaserEmail",
      label: "Email",
      render: (item: PurchasedGiftCard) =>
        getUserEmail(item.createdBy),
    },
    {
      key: "cardNumber",
      label: "Card Number",
      render: (item: PurchasedGiftCard) =>
        item.cardNumber || "-",
    },
    {
      key: "originalAmount",
      label: "Original Amount",
      render: (item: PurchasedGiftCard) =>
        formatAmount(item.originalAmount),
    },
    {
      key: "remainingBalance",
      label: "Remaining Balance",
      render: (item: PurchasedGiftCard) =>
        formatAmount(item.remainingBalance),
    },
    {
      key: "recipientName",
      label: "Recipient",
      render: (item: PurchasedGiftCard) =>
        item.recipientName || "-",
    },
    {
      key: "recipientEmail",
      label: "Recipient Email",
      render: (item: PurchasedGiftCard) =>
        item.recipientEmail || "-",
    },
    {
      key: "gifterName",
      label: "Gifter Name",
      render: (item: PurchasedGiftCard) =>
        item.gifterName || "-",
    },
    {
      key: "status",
      label: "Status",
      render: (item: PurchasedGiftCard) => (
        <span
          className={`inline-flex rounded px-2 py-1 text-xs font-medium ${getStatusClass(
            item.status
          )}`}
        >
          {item.status || "-"}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Purchase Date",
      render: (item: PurchasedGiftCard) =>
        formatDate(item.createdAt),
    },
  ];

  const fetchData = useCallback(
    async ({ page, limit, search }: TableParams) => {
      try {
        // Fetch records through the existing Redux thunk.
        const response: any = await dispatch(
          adminGetAllPurchasedGiftCards()
        ).unwrap();

        // Support common API/thunk response structures.
        const records: PurchasedGiftCard[] =
          Array.isArray(response)
            ? response
            : Array.isArray(response?.giftCards)
              ? response.giftCards
              : Array.isArray(response?.cards)
                ? response.cards
                : Array.isArray(response?.data?.giftCards)
                  ? response.data.giftCards
                  : Array.isArray(response?.data)
                    ? response.data
                    : [];

        // Apply search locally because this thunk is called without
        // server-side pagination/search arguments.
        const normalizedSearch = (search || "")
          .trim()
          .toLowerCase();

        const filteredRecords = normalizedSearch
          ? records.filter((card) => {
              const searchableValues = [
                getUserName(card.createdBy),
                getUserEmail(card.createdBy),
                card.cardNumber,
                card.recipientName,
                card.recipientEmail,
                card.gifterName,
                card.message,
                card.status,
                card.source,
                formatAmount(card.originalAmount),
                formatAmount(card.remainingBalance),
              ];

              return searchableValues.some((value) =>
                String(value ?? "")
                  .toLowerCase()
                  .includes(normalizedSearch)
              );
            })
          : records;

        const startIndex = (page - 1) * limit;

        return {
          data: filteredRecords.slice(
            startIndex,
            startIndex + limit
          ),
          total: filteredRecords.length,
        };
      } catch (error: any) {
        throw new Error(
          typeof error === "string"
            ? error
            : error?.message ||
                "Failed to load purchased Gift Cards."
        );
      }
    },
    [dispatch]
  );

  return (
    <div className="p-6">
      <GenericTable
        title="Purchased Gift Cards"
        columns={columns}
        rowKey="_id"
        searchEnabled
        fetchData={fetchData}
        editEnabled={false}
      />
    </div>
  );
}