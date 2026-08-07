"use client";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store";
import {
  fetchCustomerReviews,
  deleteCustomerReview,
  bulkDeleteCustomerReviews,
  updateReviewsStatus,
} from "@/features/customerReviews/customerReviewsThunk";
import { GenericTable } from "@/components/ui/adminTable";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, Star, Package } from "lucide-react";
import { useBasePath } from "@/hooks/useBasePath";
import api from "@/services/api";
import { ROUTES } from "@/services/routes";

export default function CustomerReviewsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const basePath = useBasePath();
  const [productsMap, setProductsMap] = useState<Record<string, string>>({});
  useEffect(() => {
    const fetchProductsLookup = async () => {
      try {
        const res = await api.get(ROUTES.products.getAll, {
          params: { isDownload: true, limit: 1000 },
        });
        const productList =
          res.data?.data?.products ||
          (Array.isArray(res.data?.data) ? res.data.data : []);

        const map: Record<string, string> = {};
        productList.forEach((prod: any) => {
          if (prod._id && (prod.name || prod.title)) {
            map[prod._id] = prod.name || prod.title;
          }
        });
        setProductsMap(map);
      } catch (err) {
        console.error("Failed to load products lookup map", err);
      }
    };

    fetchProductsLookup();
  }, []);

  const getProductName = (item: any) => {
    const pObj = item.product_id || item.productId || item.product;
    if (pObj && typeof pObj === "object") {
      if (pObj.name) return pObj.name;
      if (pObj.title) return pObj.title;
    }

    if (item.product_name) return item.product_name;
    if (item.productName) return item.productName;

    const pId =
      typeof pObj === "string"
        ? pObj
        : typeof item.product_id === "string"
        ? item.product_id
        : typeof item.productId === "string"
        ? item.productId
        : null;

    if (pId && productsMap[pId]) {
      return productsMap[pId];
    }

    if (pId) {
      return pId;
    }
    return "-";
  };

  const columns = [
    {
      key: "user_id",
      label: "User",
      render: (item: any) => {
        if (typeof item.user_id === "object" && item.user_id?.name) {
          return item.user_id.name;
        }
        return item.user_name || (typeof item.user_id === "string" ? item.user_id : "-");
      },
    },
    {
      key: "user_id_email",
      label: "Email",
      render: (item: any) => {
        if (typeof item.user_id === "object" && item.user_id?.email) {
          return item.user_id.email;
        }
        return item.user_email || "-";
      },
    },
    {
      key: "product_id",
      label: "Product",
      render: (item: any) => {
        const prodName = getProductName(item);
        if (prodName === "-") return "-";
        return (
          <div className="flex items-center gap-1.5 font-medium text-blue-700 bg-blue-50/80 px-2.5 py-1 rounded-md border border-blue-100 w-fit max-w-[240px] truncate" title={prodName}>
            <Package className="h-3.5 w-3.5 shrink-0 text-blue-500" />
            <span className="truncate">{prodName}</span>
          </div>
        );
      },
    },
    {
      key: "title",
      label: "Title",
      render: (item: any) => (
        <span className="font-medium text-gray-900">{item.title || "-"}</span>
      ),
    },
    {
      key: "rating",
      label: "Rating",
      render: (item: any) => (
        <div className="flex items-center gap-1 font-semibold text-amber-500">
          <span>{item.rating || 0}</span>
          <Star className="h-4 w-4 fill-amber-400 text-amber-400 inline-block" />
        </div>
      ),
    },
    {
      key: "createdAt",
      label: "Date",
      render: (item: any) => {
        if (!item.createdAt) return "-";
        return new Date(item.createdAt).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
      },
    },
    {
      key: "comment",
      label: "Comment / Description",
      render: (item: any) => item.comment || item.description || "-",
    },
  ];
  return (
    <GenericTable
      title="Customer Reviews"
      columns={columns}
      rowKey="_id"
      searchEnabled
      editEnabled
      statusToggleEnabled
      statusKey="is_approved"
      filters={[
        { label: "Approved", value: "true" },
        { label: "Pending", value: "false" },
      ]}
      fetchData={async ({ page, limit, search, status }) => {
        const boolStatus =
          status === "true" ? true : status === "false" ? false : undefined;

        const res = await dispatch(
          fetchCustomerReviews({ page, limit, search, is_approved: boolStatus })
        ).unwrap();

        return { data: res.customerReviews, total: res.total };
      }}
      deleteItem={async (id) => {
        await dispatch(deleteCustomerReview(id)).unwrap();
      }}
      bulkDeleteItems={async (ids) => {
        await dispatch(bulkDeleteCustomerReviews(ids)).unwrap();
      }}
      onStatusToggle={async (id, newStatus) => {
        await dispatch(
          updateReviewsStatus({ id, is_approved: newStatus })
        ).unwrap();
      }}
      headerActions={
        <Link to={`${basePath}/customer-reviews/add`}>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" /> Add Review
          </Button>
        </Link>
      }
    />
  );
}
