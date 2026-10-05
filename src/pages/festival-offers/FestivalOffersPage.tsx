import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/store";
import { GenericTable } from "@/components/ui/adminTable";
import {
  deleteFestivalOffer,
  fetchFestivalOffers,
} from "@/features/festival-offers/festivalOffersThunk";

import { useBasePath } from "@/hooks/useBasePath";

export default function FestivalOffersPage() {
  const dispatch = useDispatch<AppDispatch>();
  const basePath = useBasePath();

 const formatDate = (value?: string) => {
    if (!value) return "-";

    const date = new Date(value);

    return Number.isNaN(date.getTime())
      ? "-"
      : date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
  };

  const columns = [
    {
      key: "image",
      label: "Image",
      render: (item: any) => {
        const firstImage = Array.isArray(item?.image)
          ? item.image.find(Boolean)
          : item?.image;

        return firstImage ? (
          <img
            src={`${import.meta.env.VITE_API_URL_IMAGE}${firstImage}`}
            alt={item?.name || "Festival Offer"}
            className="h-10 w-10 rounded-md object-cover border"
          />
        ) : (
          <div className="h-10 w-10 bg-gray-100 rounded-md flex items-center justify-center text-gray-400 text-xs border border-dashed">
            —
          </div>
        );
      },
    },

    {
      key: "name",
      label: "Name",
      render: (item: any) => (
        <span className="font-medium text-gray-800">
          {item?.name || "-"}
        </span>
      ),
    },

    {
      key: "description",
      label: "Description",
      render: (item: any) => (
        <div
          className="max-w-xs truncate text-sm text-gray-600"
          title={item?.description || ""}
        >
          {item?.description || "-"}
        </div>
      ),
    },

    {
      key: "start_date",
      label: "Start Date",
       render: (item: any) => formatDate(item?.start_date),
    },

    {
      key: "end_date",
      label: "End Date",
      render: (item: any) => formatDate(item?.end_date),
    },
  ];

  return (
    <GenericTable
      title="Festival Offers"
      columns={columns}
      rowKey="_id"
      searchEnabled


      fetchData={async ({ page, limit, search, status, role }) => {
        try {
          const res = await dispatch(
            fetchFestivalOffers({ page, limit, search, status, role })
          ).unwrap();
          return { data: res.offers, total: res.total };
        } catch (err: any) {
          throw new Error(err || "Failed to load festival offers");
        }
      }}

      deleteItem={async (id) => {
        try {
          await dispatch(deleteFestivalOffer(id)).unwrap();
        } catch (err: any) {
          throw new Error(err?.message || "Failed to delete festival offer");
        }
      }}
      headerActions={
        <Link to={`${basePath}/festival-offers/add`}>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" /> Add Festival Offer
          </Button>
        </Link>
      }
    />
  );
}