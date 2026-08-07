import React, { useState } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import api from "@/services/api";
import { ROUTES } from "@/services/routes";

interface ImageUploadProps {
  value?: string | string[] | null;
  onChange: (url: string | string[] | null) => void;
  multiple?: boolean;
  className?: string;
  size?: number; // square size in px
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  multiple = false,
  className = "",
  size = 128,
}) => {
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const getImageUrl = (url: string) => {
    if (!url) return "";
    if (
      url.startsWith("http://") ||
      url.startsWith("https://") ||
      url.startsWith("blob:") ||
      url.startsWith("data:")
    ) {
      return url;
    }
    return `${import.meta.env.VITE_API_URL_IMAGE || ""}${url}`;
  };

  const uploadFiles = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;

    const filesArray = Array.from(files);
    const formData = new FormData();
    filesArray.forEach((file) => formData.append("image", file));

    try {
      setUploading(true);
      const res = await api.post(ROUTES.upload.image, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.success) {
        let uploadedUrls: string[] = [];

        if (Array.isArray(res.data.data)) {
          // multiple upload
          uploadedUrls = res.data.data.map((img: any) => img.image_url);
        } else if (res.data.data?.image_url) {
          // single upload
          uploadedUrls = [res.data.data.image_url];
        }

        if (uploadedUrls.length > 0) {
          if (multiple) {
            const currentValues = Array.isArray(value)
              ? value
              : typeof value === "string" && value
              ? [value]
              : [];
            onChange([...currentValues, ...uploadedUrls]);
          } else {
            onChange(uploadedUrls[0] || null);
          }
        }
      }
    } catch (err) {
      console.error("Image upload failed:", err);
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      uploadFiles(e.target.files);
      e.target.value = "";
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement | HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement | HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement | HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      uploadFiles(e.dataTransfer.files);
    }
  };

  const removeImage = async (index?: number) => {
    let imageUrlToRemove: string | null = null;

    if (multiple && Array.isArray(value) && index !== undefined) {
      imageUrlToRemove = value[index];
      const newValues = [...value];
      newValues.splice(index, 1);
      onChange(newValues.length > 0 ? newValues : null);
    } else if (typeof value === "string") {
      imageUrlToRemove = value;
      onChange(null);
    } else if (Array.isArray(value) && value.length > 0) {
      imageUrlToRemove = value[0];
      onChange(null);
    }

    // Call API to physically delete the image from server's uploads directory
    if (imageUrlToRemove) {
      try {
        await api.post(ROUTES.upload.delete, { imageUrl: imageUrlToRemove });
      } catch (err) {
        console.error("Failed to remove image from backend server:", err);
      }
    }
  };

  // Render multiple images mode
  if (multiple) {
    const imagesList = Array.isArray(value)
      ? value
      : typeof value === "string" && value
      ? [value]
      : [];

    return (
      <div className="flex flex-wrap gap-4 items-center">
        {imagesList.map((url, idx) => (
          <div
            key={idx}
            className="relative group rounded-md overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center shrink-0"
            style={{ width: size, height: size }}
          >
            <img
              src={getImageUrl(url)}
              alt={`Uploaded ${idx + 1}`}
              className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-1 right-1 h-6 w-6 rounded-full shadow-md opacity-90 hover:opacity-100 transition-opacity"
              onClick={() => removeImage(idx)}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}

        <label
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`flex flex-col items-center justify-center border-2 border-dashed rounded-md cursor-pointer transition-all duration-200 shrink-0 relative ${
            isDragging
              ? "border-blue-500 bg-blue-50/70 text-blue-600 scale-[1.02]"
              : "border-gray-300 hover:border-gray-400 bg-gray-50/50 hover:bg-gray-100/50 text-gray-500"
          } ${uploading ? "opacity-75 pointer-events-none" : ""} ${className}`}
          style={{ width: size, height: size }}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-1">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              <span className="text-xs font-medium text-gray-600">Uploading...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1 p-2 text-center">
              <Upload className={`h-6 w-6 ${isDragging ? "text-blue-600" : "text-gray-400"}`} />
              <span className="text-xs font-medium leading-tight">
                {isDragging ? "Drop images" : "Drag & drop or Click"}
              </span>
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            multiple
            disabled={uploading}
            onChange={handleFileChange}
          />
        </label>
      </div>
    );
  }

  // Render single image mode
  const singleUrl =
    typeof value === "string"
      ? value
      : Array.isArray(value) && value.length > 0
      ? value[0]
      : null;

  return singleUrl ? (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative group rounded-md overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center shrink-0 ${
        isDragging ? "ring-2 ring-blue-500" : ""
      }`}
      style={{ width: size, height: size }}
    >
      <img
        src={getImageUrl(singleUrl)}
        alt="Uploaded"
        className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
      />
      {uploading && (
        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-1 text-white">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="text-xs">Uploading...</span>
        </div>
      )}
      <Button
        type="button"
        variant="destructive"
        size="icon"
        className="absolute top-1 right-1 h-6 w-6 rounded-full shadow-md opacity-90 hover:opacity-100 transition-opacity"
        onClick={() => removeImage()}
      >
        <X className="h-3.5 w-3.5" />
      </Button>
    </div>
  ) : (
    <label
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex flex-col items-center justify-center border-2 border-dashed rounded-md cursor-pointer transition-all duration-200 shrink-0 relative ${
        isDragging
          ? "border-blue-500 bg-blue-50/70 text-blue-600 scale-[1.02]"
          : "border-gray-300 hover:border-gray-400 bg-gray-50/50 hover:bg-gray-100/50 text-gray-500"
      } ${uploading ? "opacity-75 pointer-events-none" : ""} ${className}`}
      style={{ width: size, height: size }}
    >
      {uploading ? (
        <div className="flex flex-col items-center gap-1">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          <span className="text-xs font-medium text-gray-600">Uploading...</span>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-1 p-2 text-center">
          <Upload className={`h-6 w-6 ${isDragging ? "text-blue-600" : "text-gray-400"}`} />
          <span className="text-xs font-medium leading-tight">
            {isDragging ? "Drop image" : "Drag & drop or Click"}
          </span>
        </div>
      )}
      <input
        type="file"
        accept="image/*"
        className="hidden"
        disabled={uploading}
        onChange={handleFileChange}
      />
    </label>
  );
};
