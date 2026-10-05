import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store";
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
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useBasePath } from "@/hooks/useBasePath";
import {
  createFestivalOffer,
  fetchFestivalOffers,
  getFestivalOfferById,
  updateFestivalOffer,
} from "@/features/festival-offers/festivalOffersThunk";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { Switch } from "@/components/ui/switch";

export default function FestivalOfferForm() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const basePath = useBasePath();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  useEffect(() => {
    dispatch(fetchFestivalOffers({ page: 1, limit: 100 }));
  }, [dispatch]);

  const formatDateForInput = (value?: string | null) => {
    if (!value) return "";

    return value.includes("T")
      ? value.split("T")[0]
      : value;
  };

  useEffect(() => {
    if (isEditMode && id) {
      dispatch(getFestivalOfferById(id)).then((res: any) => {
        if (res.payload) {
          const offer = res.payload;

          setName(offer.name || "");
          setImageUrls(
            Array.isArray(offer.image)
              ? offer.image
              : offer.image
                ? [offer.image]
                : []
          );
          setDescription(offer.description || "");
          setStartDate(formatDateForInput(offer.start_date));
          setEndDate(formatDateForInput(offer.end_date));
        }
      });
    }
  }, [dispatch, id, isEditMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      name,
      description,
      image: imageUrls,
      start_date: startDate,
      end_date: endDate,
    };

    try {
      let result;

      if (isEditMode && id) {
        result = await dispatch(
          updateFestivalOffer({
            id, data: payload,
          })
        );
      } else {
        result = await dispatch(
          createFestivalOffer(payload)
        );
      }

      if (
        createFestivalOffer.fulfilled.match(result) ||
        updateFestivalOffer.fulfilled.match(result)
      ) {
        toast.success(
          isEditMode
            ? "Festival offer updated successfully!"
            : "Festival offer created successfully!"
        );

        navigate(
          `${basePath}/festival-offers`
        );
      } else {
        toast.error((result.payload as string) || "Something went wrong");
      }
    } catch (err) {
      toast.error("Server Error");
    }
  };

  return (
      <div className="p-6 mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link to={`${basePath}/festival-offers`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>

        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditMode ? "Edit Festival Offer" : "Add New Festival Offer"}
          </h1>

          <p className="text-gray-500 mt-1">
            {isEditMode ? "Update festival offer details." : "Create a new festival offer."}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-md border border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Festival Offer Information</CardTitle>
            </CardHeader>

            <CardContent className="space-y-5">
              <div>
                <Label htmlFor="name">
                  Festival Offer Name <span className="text-red-500">*</span>
                </Label>

                <Input
                  id="name"
                  placeholder="Enter festival offer name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>

                <Textarea
                  id="description"
                  placeholder="Festival offer description..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 min-h-[120px]"
                />
              </div>


              <div>
                <Label>
                  Festival Images <span className="text-red-500">*</span>
                </Label>

                <div className="mt-1">
                  <ImageUpload
                    value={imageUrls}
                    // onChange={setImageUrls}
                    onChange={(val) => {
                    if (Array.isArray(val)) setImageUrls(val);
                    else if (val) setImageUrls([val]);
                    else setImageUrls([]);
                  }}
                    size={150}
                    multiple
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <Label htmlFor="start_date">
                    Start Date <span className="text-red-500">*</span>
                  </Label>

                  <Input
                    id="start_date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="end_date">
                    End Date <span className="text-red-500">*</span>
                  </Label>

                  <Input
                    id="end_date"
                    type="date"
                    min={startDate || undefined}
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                    className="mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        
      </form>
    </div>
  );
}