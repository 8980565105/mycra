import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Pencil } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";

import { Button } from "@/components/ui/button";
import { GenericTable } from "@/components/ui/adminTable";
import type { AppDispatch, RootState } from "@/store";
import { useBasePath } from "@/hooks/useBasePath";

import {
  adminGetAllGiftCardProducts,
  adminUpdateGiftCardProductStatus,
} from "@/features/giftCards/giftCardThunk";
import { GiftCardProduct } from "@/features/giftCards/giftCardSlice";

type GiftCardProductsResponse =
  | GiftCardProduct[]
  | {
      products?: GiftCardProduct[];
      total?: number;
    };

export default function AdminGiftCardProducts() {
  const dispatch = useDispatch<AppDispatch>();
  const basePath = useBasePath();
  // const { user } = useSelector((state: RootState) => state.auth);
  // const isAdmin = user?.role === "admin";
  const [refreshKey, setRefreshKey] = useState(0);
  const [actionError, setActionError] = useState("");

  const columns = [
    {
      key: "productImage",
      label: "Image",
      width: "w-20",
      render: (item: any) =>
        item.productImage ? (
          <img
            src={`${import.meta.env.VITE_API_URL_IMAGE}${item.productImage}`}
            alt={item.name}
            className="h-10 w-10 rounded-md object-cover border"
          />
        ) : (
        <div className="h-10 w-10 bg-gray-100 rounded-md flex items-center justify-center text-gray-400 text-xs border border-dashed">
          —
        </div>
      ),
    },
    {
      key: "productName",
      label: "Gift Card Name",
      width: "w-48",
    },
    {
      key: "productDescription",
      label: "Description",
      render: (item: GiftCardProduct) => (
        <span className="line-clamp-2">
          {item.productDescription || "—"}
        </span>
      ),
    },
    {
      key: "amount",
      label: "Amount",
      render: (item: GiftCardProduct) => {
        const amount = item.amount ?? item.originalAmount ?? 0;

        return (
          <span className="whitespace-nowrap font-medium">
            ₹
            {Number(amount).toLocaleString("en-IN", {
              maximumFractionDigits: 2,
            })}
          </span>
        );
      },
    },
    {
      key: "isPurchaseEnabled",
      label: "Status",
      render: (item: GiftCardProduct) => {
        const enabled = item.isPurchaseEnabled ?? true;

        return (
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
              enabled
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {enabled ? "Active" : "Inactive"}
          </span>
        );
      },
    },
    {
      key: "createdAt",
      label: "Created At",
      render: (item: GiftCardProduct) =>
        item.createdAt
          ? new Date(item.createdAt).toLocaleDateString()
          : "—",
    },
  ];

  return (
    <div className="space-y-5 p-5">
      {actionError && (
        <div
          role="alert"
          className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          {actionError}
        </div>
      )}

      <GenericTable
        key={refreshKey}
        title="Gift Cards"
        columns={columns}
        rowKey="_id"
        searchEnabled
        filters={[
          { label: "Active", value: "active" },
          { label: "Inactive", value: "inactive" },
        ]}
        fetchData={async ({ page, limit, search, status }) => {

          try {
            const result = (await dispatch(
              adminGetAllGiftCardProducts()
            ).unwrap()) as GiftCardProductsResponse;
            let records: GiftCardProduct[] = Array.isArray(result)
              ? result
              : result.products ?? [];

            const term = (search ?? "z").trim().toLowerCase();

            if (term) {
              records = records.filter((item) =>
                [
                  item._id,
                  item.productName,
                  item.productDescription ?? "",
                ].some((value) =>
                  value.toLowerCase().includes(term)
                )
              );
            }

            // Filter by purchase availability.
            if (status === "active") {
              records = records.filter(
                (item) => item.isPurchaseEnabled ?? true
              );
            } else if (status === "inactive") {
              records = records.filter(
                (item) => !(item.isPurchaseEnabled ?? true)
              );
            }

            const total = records.length;
            const start = (page - 1) * limit;

            return {
              data: records.slice(start, start + limit),
              total,
            };
          } catch (error: unknown) {
            throw new Error(
              typeof error === "string"
                ? error
                : error instanceof Error
                  ? error.message
                  : "Failed to load gift card products."
            );
          }
        }}
        headerActions={
          <Link to={`${basePath}/gift-cards/add`}>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Gift Card
            </Button>
          </Link>
        }
      />
    </div>
  );
}
