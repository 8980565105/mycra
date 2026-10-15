import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import type { AppDispatch } from "@/store";
import { useBasePath } from "@/hooks/useBasePath";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ImageUpload } from "@/components/ui/ImageUpload";

import {
  adminCreateGiftCardProduct,
  adminGetAllGiftCardProducts,
  adminUpdateGiftCardProduct,
} from "@/features/giftCards/giftCardThunk";

import type { GiftCardProduct } from "@/features/giftCards/giftCardSlice";

export default function AddGiftcardForm() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const basePath = useBasePath();
    const [productExpiresAt, setProductExpiresAt] = useState("");
  const isEditMode = Boolean(id);
  const [expiresAt, setExpiresAt] = useState("");

  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [productImage, setProductImage] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [isPurchaseEnabled, setIsPurchaseEnabled] = useState(true);
  const [allowCustomAmount, setAllowCustomAmount] = useState(false);
  const [minAmount, setMinAmount] = useState("1000");
  const [maxAmount, setMaxAmount] = useState("10000");
  const [amountStep, setAmountStep] = useState("1000");

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  // Load existing gift card when editing.
  useEffect(() => {
    if (!isEditMode || !id) return;

    let cancelled = false;

    const loadProduct = async () => {
      setLoading(true);

      try {
        const result = await dispatch(
          adminGetAllGiftCardProducts()
        ).unwrap();

        // Supports either an array response or { products: [...] }.
        const products: GiftCardProduct[] = Array.isArray(result)
          ? result
          : Array.isArray(
                (result as { products?: GiftCardProduct[] })?.products
              )
            ? (result as { products: GiftCardProduct[] }).products
            : [];

        const product = products.find(
          (item) => String(item._id) === String(id)
        );

        if (cancelled) return;

        if (!product) {
          toast.error(
            "Gift card product not found. Check the API response and product ID."
          );
          navigate(`${basePath}/gift-cards`);
          return;
        }

        setProductName(product.productName ?? "");
        setProductDescription(product.productDescription ?? "");
        setProductImage(product.productImage || null);
        setAmount(
          String(product.amount ?? product.originalAmount ?? "")
        );
        setIsPurchaseEnabled(product.isPurchaseEnabled ?? true);
        setProductExpiresAt(
            toDateInputValue(product.productExpiresAt)
        );
        setAllowCustomAmount(product.allowCustomAmount ?? false);
        setMinAmount(String(product.minAmount ?? 1000));
        setMaxAmount(String(product.maxAmount ?? 10000));
        setAmountStep(String(product.amountStep ?? 1000));
      } catch (error: unknown) {
        if (!cancelled) {
          toast.error(
            typeof error === "string"
              ? error
              : error instanceof Error
                ? error.message
                : "Unable to load gift card product."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadProduct();

    return () => {
      cancelled = true;
    };
  }, [dispatch, id, isEditMode, navigate, basePath]);

//   const toDateInputValue = (value?: string | Date | null) => {
//     if (!value) return "";

//     const date = new Date(value);

//     if (Number.isNaN(date.getTime())) return "";

//     const year = date.getFullYear();
//     const month = String(date.getMonth() + 1).padStart(2, "0");
//     const day = String(date.getDate()).padStart(2, "0");

//     return `${year}-${month}-${day}`;
//     };

  // Create or update a gift card.
  
const toDateInputValue = (value?: string | Date | null): string => {
  if (!value) return "";

  // Date-only values should remain unchanged.
  if (typeof value === "string") {
    const dateOnlyMatch = /^(\d{4}-\d{2}-\d{2})$/.exec(value);

    if (dateOnlyMatch) {
      return dateOnlyMatch[1];
    }
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const name = productName.trim();
    const description = productDescription.trim();
    const parsedAmount = Number(amount);

    if (!name) {
      toast.error("Gift card name is required.");
      return;
    }

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      toast.error("Enter an amount greater than zero.");
      return;
    }
    const parsedMin = Number(minAmount);
    const parsedMax = Number(maxAmount);
    const parsedStep = Number(amountStep);

    if (allowCustomAmount) {
      if (
        !Number.isInteger(parsedMin) ||
        !Number.isInteger(parsedMax) ||
        !Number.isInteger(parsedStep) ||
        parsedMin < 1 ||
        parsedMax < parsedMin ||
        parsedStep < 1 ||
        parsedStep > parsedMax - parsedMin + 1 ||
        (parsedMax - parsedMin) % parsedStep !== 0
      ) {
        toast.error(
          "Enter valid minimum, maximum and step amounts. Maximum must match the step."
        );
        return;
      }
    }

    const payload = {
      productName: name,
      productDescription: description,
      productImage: productImage ?? "",
      amount: allowCustomAmount ? parsedMin : parsedAmount,
      allowCustomAmount,
      minAmount: allowCustomAmount ? parsedMin : parsedAmount,
      maxAmount: allowCustomAmount ? parsedMax : parsedAmount,
      amountStep: allowCustomAmount ? parsedStep : 1,
      isPurchaseEnabled,
      productExpiresAt: productExpiresAt || null,
    };
    console.log("Gift card update payload:", payload);

    setSaving(true);

    try {
      if (isEditMode && id) {
        await dispatch(
          adminUpdateGiftCardProduct({id, ...payload})
        ).unwrap();

        toast.success("Gift card product updated successfully.");
      } else {
        await dispatch(
          adminCreateGiftCardProduct(payload)
        ).unwrap();

        toast.success("Gift card product created successfully.");
      }

      navigate(`${basePath}/gift-cards`);
    } catch (error: unknown) {
      toast.error(
        typeof error === "string"
          ? error
          : error instanceof Error
            ? error.message
            : "Unable to save gift card product."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto p-6">
      {/* Page heading */}
      <div className="mb-6 flex items-center gap-4">
        <Link to={`${basePath}/gift-cards`}>
          <Button type="button" variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>

        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditMode ? "Edit Gift Card" : "Add Gift Card"}
          </h1>

          <p className="mt-1 text-gray-500">
            {isEditMode
              ? "Update gift card product details."
              : "Create a new gift card product for customers."}
          </p>
        </div>
      </div>

      {/* Form */}
      {loading ? (
        <div className="py-10 text-center text-gray-500">
          Loading gift card details...
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="grid gap-6 lg:grid-cols-3"
        >
          {/* Left side */}
          <div className="space-y-6 lg:col-span-2">
            <Card className="border border-gray-200 shadow-md">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">
                  Basic Information
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-5">
                {/* Gift card name */}
                <div>
                  <Label htmlFor="productName">
                    Gift Card Name{" "}
                    <span className="text-red-500">*</span>
                  </Label>

                  <Input
                    id="productName"
                    value={productName}
                    onChange={(event) =>
                      setProductName(event.target.value)
                    }
                    placeholder="Mycra Pay Gift Card"
                    maxLength={100}
                    required
                    className="mt-1"
                  />
                </div>

                {/* Description */}
                <div>
                  <Label htmlFor="productDescription">
                    Description
                  </Label>

                  <Textarea
                    id="productDescription"
                    value={productDescription}
                    onChange={(event) =>
                      setProductDescription(event.target.value)
                    }
                    placeholder="Enter gift card description"
                    maxLength={1000}
                    rows={4}
                    className="mt-1"
                  />
                </div>

                {/* Image */}
                <div>
                  <Label>Gift Card Image</Label>

                  <div className="mt-2">
                    <ImageUpload
                      value={productImage}
                      onChange={(url) =>
                        setProductImage(
                          typeof url === "string" ? url : null
                        )
                      }
                      size={150}
                    />
                  </div>
                </div>

                {/* Amount */}
                <div>
                  <Label htmlFor="amount">
                    Amount (₹){" "}
                    <span className="text-red-500">*</span>
                  </Label>

                  <Input
                    id="amount"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={amount}
                    onChange={(event) =>
                      setAmount(event.target.value)
                    }
                    placeholder="750"
                    required
                    className="mt-1"
                  />
                </div>
                <div className="rounded-lg border p-4 space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <Label htmlFor="allowCustomAmount">
                        Allow customer to choose amount
                      </Label>
                      <p className="text-sm text-gray-500">
                        Enable amounts from ₹1,000 to ₹10,000.
                      </p>
                    </div>

                    <Switch
                      id="allowCustomAmount"
                      checked={allowCustomAmount}
                      onCheckedChange={(checked) => {
                        setAllowCustomAmount(checked);

                        if (checked) {
                          setAmount(minAmount || "1000");
                        }
                      }}
                    />
                  </div>

                  {allowCustomAmount && (
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div>
                        <Label htmlFor="minAmount">Minimum Amount (₹)</Label>
                        <Input
                          id="minAmount"
                          type="number"
                          min="1"
                          step="1"
                          value={minAmount}
                          onChange={(e) => {
                            setMinAmount(e.target.value);
                            setAmount(e.target.value);
                          }}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="maxAmount">Maximum Amount (₹)</Label>
                        <Input
                          id="maxAmount"
                          type="number"
                          min={minAmount || 1}
                          max={10000}
                          step="1"
                          value={maxAmount}
                          onChange={(e) => {
                            const value = e.target.value;

                            if (value === "") {
                              setMaxAmount("");
                              return;
                            }

                            if (Number(value) <= 10000 && Number(value) >= 1) {
                              setMaxAmount(value);
                            }
                          }}
                          required
                        />
                        <p className="mt-1 text-sm text-gray-500">
                          Maximum allowed amount is ₹10,000.
                        </p>
                      </div>

                      <div>
                        <Label htmlFor="amountStep">Amount Step (₹)</Label>
                        <Input
                          id="amountStep"
                          type="number"
                          min="1"
                          step="1"
                          value={amountStep}
                          onChange={(e) => setAmountStep(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="productExpiresAt">Product Expiry Date</Label>

                  <Input
                    id="productExpiresAt"
                    type="date"
                    value={productExpiresAt}
                    // min={toDateInputValue(new Date())}
                    // onChange={(event) => setExpiresAt(event.target.value)}
                    onChange={(event) => setProductExpiresAt(event.target.value)}
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right side */}
          <div className="space-y-6">
            <div className="sticky top-6">
            <Card >
              <CardHeader>
                <CardTitle className="text-lg font-semibold">
                  Purchase Settings
                </CardTitle>
              </CardHeader>

              <CardContent>
                <div className="flex items-center justify-between gap-4">
                  <Label htmlFor="purchaseEnabled">
                    Enable customer purchases
                  </Label>

                  <Switch
                    id="purchaseEnabled"
                    checked={isPurchaseEnabled}
                    onCheckedChange={setIsPurchaseEnabled}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Action buttons */}
            <div className="flex gap-3 mt-4">
              <Button
                type="submit"
                disabled={saving || loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {saving
                  ? "Saving..."
                  : isEditMode
                    ? "Update Gift Card"
                    : "Create Gift Card"}
              </Button>

              <Link
                to={`${basePath}/gift-cards`}
                className="flex-1"
              >
                <Button
                  type="button"
                  variant="outline"
                  disabled={saving}
                  className="w-full"
                >
                  Cancel
                </Button>
              </Link>
            </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
