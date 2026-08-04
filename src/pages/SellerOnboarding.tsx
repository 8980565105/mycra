import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/services/api";
import { ROUTES } from "@/services/routes";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "sonner";
import {
  Building2,
  MapPin,
  Landmark,
  FileCheck,
  Send,
  CheckCircle2,
  Clock,
  XCircle,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { AppDispatch, RootState } from "@/store";
import { fetchActiveBusinesses } from "@/features/Business/businessThunk";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImageUpload } from "@/components/ui/ImageUpload";

export default function SellerOnboarding() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [activeStep, setActiveStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [application, setApplication] = useState<any>(null);
  const [userStatus, setUserStatus] = useState<string>("not_started");

  const { businesses } = useSelector((state: RootState) => state.business);

  // Step 1: Business Details
  const [business, setBusiness] = useState({
    storeName: "",
    category: "",
    businessType: "",
    description: "",
    // website: "",
    phone: "",
    email: "",
  });

  // Step 2: Pickup Address
  const [pickup, setPickup] = useState({
    full_name: "",
    phone_number: "",
    house_no: "",
    apartment: "",
    street: "",
    landmark: "",
    city: "",
    state: "",
    country: "India",
    zip_code: "",
  });

  // Step 3: Bank Details
  const [bank, setBank] = useState({
    accountNumber: "",
    accountHolderName: "",
    ifscCode: "",
    bankName: "",
    branchName: "",
  });

  // Step 4: Documents & Tax
  const [taxDocs, setTaxDocs] = useState({
    gstNumber: "",
    panNumber: "",
    aadhaarNumber: "",
    gstDocUrl: "",
    panDocUrl: "",
    aadhaarDocUrl: "",
    cancelledChequeUrl: "",
    addressProofUrl: "",
  });

  useEffect(() => {
    fetchOnboardingStatus();
  }, []);
  useEffect(() => {
    fetchOnboardingStatus();
    dispatch(fetchActiveBusinesses());
  }, []);
  const fetchOnboardingStatus = async () => {
    try {
      setLoading(true);
      const res = await api.get(ROUTES.seller.getOnboardingStatus);
      if (res.data.success) {
        const { user, application: appData } = res.data.data;
        setUserStatus(user?.onboardingStatus || "not_started");
        if (appData) {
          setApplication(appData);
          if (appData.businessDetails) setBusiness({ ...business, ...appData.businessDetails });
          if (appData.pickupAddress) setPickup({ ...pickup, ...appData.pickupAddress });
          if (appData.bankDetails) setBank({ ...bank, ...appData.bankDetails });
          if (appData.taxAndDocs) setTaxDocs({ ...taxDocs, ...appData.taxAndDocs });
        }
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to load onboarding status");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBusiness = async () => {
    if (!business.storeName.trim()) {
      toast.error("Store name is required");
      return false;
    }
    try {
      setSubmitting(true);
      const res = await api.post(ROUTES.seller.saveBusinessDetails, business);
      if (res.data.success) {
        toast.success("Business details saved!");
        setApplication(res.data.data);
        return true;
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save business details");
    } finally {
      setSubmitting(false);
    }
    return false;
  };

  const handleSavePickup = async () => {
    try {
      setSubmitting(true);
      const res = await api.post(ROUTES.seller.savePickupAddress, pickup);
      if (res.data.success) {
        toast.success("Pickup address saved!");
        setApplication(res.data.data);
        return true;
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save pickup address");
    } finally {
      setSubmitting(false);
    }
    return false;
  };

  const handleSaveBank = async () => {
    if (!bank.accountNumber || !bank.ifscCode) {
      toast.error("Account number and IFSC code are required");
      return false;
    }
    try {
      setSubmitting(true);
      const res = await api.post(ROUTES.seller.saveBankDetails, bank);
      if (res.data.success) {
        toast.success("Bank details saved!");
        setApplication(res.data.data);
        return true;
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save bank details");
    } finally {
      setSubmitting(false);
    }
    return false;
  };

  const handleSaveDocs = async () => {
    try {
      setSubmitting(true);
      const res = await api.post(ROUTES.seller.saveDocuments, taxDocs);
      if (res.data.success) {
        toast.success("Tax & Documents saved!");
        setApplication(res.data.data);
        return true;
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save documents");
    } finally {
      setSubmitting(false);
    }
    return false;
  };

  const handleSubmitApplication = async () => {
    try {
      setSubmitting(true);
      const res = await api.post(ROUTES.seller.submitApplication);
      if (res.data.success) {
        toast.success("Seller application submitted for Admin approval!");
        setUserStatus("pending_approval");
        setApplication(res.data.data);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = async () => {
    let saved = false;
    if (activeStep === 1) saved = await handleSaveBusiness();
    else if (activeStep === 2) saved = await handleSavePickup();
    else if (activeStep === 3) saved = await handleSaveBank();
    else if (activeStep === 4) saved = await handleSaveDocs();

    if (saved && activeStep < 5) {
      setActiveStep(activeStep + 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-slate-600 animate-pulse text-lg font-medium">Loading Seller Onboarding...</div>
      </div>
    );
  }

  // Render Status Screens if Approved or Pending
  if (userStatus === "approved") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md text-center border border-slate-100">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={36} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Store Approved!</h2>
          <p className="text-slate-500 mt-2 text-sm">
            Your store application has been approved by Admin. You can now access your Seller Dashboard.
          </p>
          <button
            onClick={() => navigate("/store_owner")}
            className="mt-6 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-lg transition"
          >
            Go to Seller Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (userStatus === "pending_approval" || application?.status === "submitted") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md text-center border border-slate-100">
          <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock size={36} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Under Admin Review</h2>
          <p className="text-slate-500 mt-2 text-sm">
            Your seller application has been submitted successfully. Admin is reviewing your business and tax details.
          </p>
          <div className="mt-4 p-3 bg-amber-50 rounded-lg text-amber-800 text-xs text-left border border-amber-200">
            <strong>Status:</strong> Pending Admin Approval
          </div>
          <button
            onClick={() => fetchOnboardingStatus()}
            className="mt-6 w-full bg-slate-800 hover:bg-slate-900 text-white font-semibold py-2.5 rounded-lg transition"
          >
            Refresh Status
          </button>
        </div>
      </div>
    );
  }

  const steps = [
    { id: 1, name: "Business Details", icon: Building2 },
    { id: 2, name: "Pickup Address", icon: MapPin },
    { id: 3, name: "Bank Details", icon: Landmark },
    { id: 4, name: "Tax & Documents", icon: FileCheck },
    { id: 5, name: "Review & Submit", icon: Send },
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Rejection Banner */}
        {application?.status === "rejected" && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-800">
            <XCircle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-base">Application Rejected by Admin</h4>
              <p className="text-sm mt-0.5 text-red-700">
                <strong>Reason:</strong> {application.rejectionReason || "Please check details and resubmit."}
              </p>
              <p className="text-xs text-red-600 mt-1">Please update your information below and resubmit.</p>
            </div>
          </div>
        )}

        {/* Onboarding Header */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 border border-slate-200">
          <h1 className="text-2xl font-bold text-slate-800">Seller Onboarding Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Complete all steps to launch your store on our marketplace.</p>

          {/* Stepper Header */}
          <div className="flex items-center justify-between mt-6 relative">
            {steps.map((step) => {
              const Icon = step.icon;
              const isCompleted = activeStep > step.id;
              const isCurrent = activeStep === step.id;
              return (
                <div key={step.id} className="flex flex-col items-center z-10 cursor-pointer" onClick={() => setActiveStep(step.id)}>
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition ${isCompleted
                      ? "bg-emerald-600 text-white"
                      : isCurrent
                        ? "bg-blue-600 text-white ring-4 ring-blue-100"
                        : "bg-slate-100 text-slate-400"
                      }`}
                  >
                    <Icon size={18} />
                  </div>
                  <span className={`text-xs mt-2 font-medium hidden sm:block ${isCurrent ? "text-blue-600 font-bold" : "text-slate-500"}`}>
                    {step.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-2xl shadow-sm p-8 border border-slate-200">
          {/* STEP 1: Business Details */}
          {activeStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Building2 className="text-blue-600" size={20} /> Business Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Store Name *</label>
                  <input
                    type="text"
                    value={business.storeName}
                    onChange={(e) => setBusiness({ ...business, storeName: e.target.value })}
                    placeholder="My Brand Store"
                    className="w-full border rounded-lg px-3.5 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                {/* <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Business Category</label>
                  <input
                    type="text"
                    value={business.category}
                    onChange={(e) => setBusiness({ ...business, category: e.target.value })}
                    placeholder="Fashion, Electronics, Home & Living"
                    className="w-full border rounded-lg px-3.5 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div> */}
                <div>
                  <Label>Business Category *</Label>
                  <Select
                    value={business.category}
                    onValueChange={(val) => setBusiness({ ...business, category: val })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {businesses.map((b) => (
                        <SelectItem key={b._id} value={b.name}>
                          {b.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Business Type</label>
                  <select
                    value={business.businessType}
                    onChange={(e) => setBusiness({ ...business, businessType: e.target.value })}
                    className="w-full border rounded-lg px-3.5 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="">Select Type</option>
                    <option value="Sole Proprietorship">Sole Proprietorship</option>
                    <option value="Partnership">Partnership</option>
                    <option value="Private Limited">Private Limited</option>
                    <option value="Individual">Individual Seller</option>
                  </select>
                </div>
                {/* <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Website URL</label>
                  <input
                    type="text"
                    value={business.website}
                    onChange={(e) => setBusiness({ ...business, website: e.target.value })}
                    placeholder="https://mystore.com"
                    className="w-full border rounded-lg px-3.5 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div> */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Business Phone</label>
                  <input
                    type="text"
                    value={business.phone}
                    onChange={(e) => setBusiness({ ...business, phone: e.target.value })}
                    placeholder="+91 9876543210"
                    className="w-full border rounded-lg px-3.5 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Business Email</label>
                  <input
                    type="email"
                    value={business.email}
                    onChange={(e) => setBusiness({ ...business, email: e.target.value })}
                    placeholder="contact@mystore.com"
                    className="w-full border rounded-lg px-3.5 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Store Description</label>
                <textarea
                  value={business.description}
                  onChange={(e) => setBusiness({ ...business, description: e.target.value })}
                  placeholder="Tell buyers about your products and business..."
                  className="w-full border rounded-lg px-3.5 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none h-24"
                />
              </div>
            </div>
          )}

          {/* STEP 2: Pickup Address */}
          {activeStep === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <MapPin className="text-blue-600" size={20} /> Warehouse / Pickup Address
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Contact Person Name</label>
                  <input
                    type="text"
                    value={pickup.full_name}
                    onChange={(e) => setPickup({ ...pickup, full_name: e.target.value })}
                    placeholder="Contact Person"
                    className="w-full border rounded-lg px-3.5 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={pickup.phone_number}
                    onChange={(e) => setPickup({ ...pickup, phone_number: e.target.value })}
                    placeholder="+91 9876543210"
                    className="w-full border rounded-lg px-3.5 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">House / Flat No.</label>
                  <input
                    type="text"
                    value={pickup.house_no}
                    onChange={(e) => setPickup({ ...pickup, house_no: e.target.value })}
                    placeholder="Shop #12, Building 3"
                    className="w-full border rounded-lg px-3.5 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Street / Area</label>
                  <input
                    type="text"
                    value={pickup.street}
                    onChange={(e) => setPickup({ ...pickup, street: e.target.value })}
                    placeholder="MG Road, Industrial Area"
                    className="w-full border rounded-lg px-3.5 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    value={pickup.city}
                    onChange={(e) => setPickup({ ...pickup, city: e.target.value })}
                    placeholder="Ahmedabad"
                    className="w-full border rounded-lg px-3.5 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">State</label>
                  <input
                    type="text"
                    value={pickup.state}
                    onChange={(e) => setPickup({ ...pickup, state: e.target.value })}
                    placeholder="Gujarat"
                    className="w-full border rounded-lg px-3.5 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Zip / Pincode</label>
                  <input
                    type="text"
                    value={pickup.zip_code}
                    onChange={(e) => setPickup({ ...pickup, zip_code: e.target.value })}
                    placeholder="380001"
                    className="w-full border rounded-lg px-3.5 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Bank Details */}
          {activeStep === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Landmark className="text-blue-600" size={20} /> Bank Account Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Account Holder Name *</label>
                  <input
                    type="text"
                    value={bank.accountHolderName}
                    onChange={(e) => setBank({ ...bank, accountHolderName: e.target.value })}
                    placeholder="John Doe"
                    className="w-full border rounded-lg px-3.5 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Account Number *</label>
                  <input
                    type="text"
                    value={bank.accountNumber}
                    onChange={(e) => setBank({ ...bank, accountNumber: e.target.value })}
                    placeholder="918237128937"
                    className="w-full border rounded-lg px-3.5 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">IFSC Code *</label>
                  <input
                    type="text"
                    value={bank.ifscCode}
                    onChange={(e) => setBank({ ...bank, ifscCode: e.target.value.toUpperCase() })}
                    placeholder="SBIN0001234"
                    className="w-full border rounded-lg px-3.5 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none uppercase"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Bank Name</label>
                  <input
                    type="text"
                    value={bank.bankName}
                    onChange={(e) => setBank({ ...bank, bankName: e.target.value })}
                    placeholder="State Bank of India"
                    className="w-full border rounded-lg px-3.5 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Tax & Documents */}
          {activeStep === 4 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <FileCheck className="text-blue-600" size={20} /> GST, PAN & Documents
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">GSTIN Number</label>
                  <input
                    type="text"
                    value={taxDocs.gstNumber}
                    onChange={(e) => setTaxDocs({ ...taxDocs, gstNumber: e.target.value.toUpperCase() })}
                    placeholder="24AAAAA0000A1Z5"
                    className="w-full border rounded-lg px-3.5 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none uppercase"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">PAN Card Number</label>
                  <input
                    type="text"
                    value={taxDocs.panNumber}
                    onChange={(e) => setTaxDocs({ ...taxDocs, panNumber: e.target.value.toUpperCase() })}
                    placeholder="ABCDE1234F"
                    className="w-full border rounded-lg px-3.5 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none uppercase"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Aadhaar Card Number</label>
                  <input
                    type="text"
                    value={taxDocs.aadhaarNumber}
                    onChange={(e) => setTaxDocs({ ...taxDocs, aadhaarNumber: e.target.value })}
                    placeholder="1234 5678 9012"
                    className="w-full border rounded-lg px-3.5 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                {/* <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">GST Document URL / Path</label>
                  <input
                    type="text"
                    value={taxDocs.gstDocUrl}
                    onChange={(e) => setTaxDocs({ ...taxDocs, gstDocUrl: e.target.value })}
                    placeholder="/uploads/gst-doc.pdf"
                    className="w-full border rounded-lg px-3.5 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div> */}
                {/* <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">PAN Card URL / Path</label>
                  <input
                    type="text"
                    value={taxDocs.panDocUrl}
                    onChange={(e) => setTaxDocs({ ...taxDocs, panDocUrl: e.target.value })}
                    placeholder="/uploads/pan-doc.pdf"
                    className="w-full border rounded-lg px-3.5 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div> */}

                {/* <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Aadhaar Card URL / Path</label>
                  <input
                    type="text"
                    value={taxDocs.aadhaarDocUrl}
                    onChange={(e) => setTaxDocs({ ...taxDocs, aadhaarDocUrl: e.target.value })}
                    placeholder="/uploads/aadhaar-doc.pdf"
                    className="w-full border rounded-lg px-3.5 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div> */}

                <div className="col-span-2">
                  <Label>GST Document</Label>
                  <ImageUpload
                    value={taxDocs.gstDocUrl ? [taxDocs.gstDocUrl] : []}
                    onChange={(urls: string[]) => setTaxDocs({ ...taxDocs, gstDocUrl: urls[0] || "" })}
                  />
                </div>

                <div className="col-span-2">
                  <Label>PAN Card Document</Label>
                  <ImageUpload
                    value={taxDocs.panDocUrl ? [taxDocs.panDocUrl] : []}
                    onChange={(urls: string[]) => setTaxDocs({ ...taxDocs, panDocUrl: urls[0] || "" })}
                  />
                </div>

                <div className="col-span-2">
                  <Label>Aadhaar Document</Label>
                  <ImageUpload
                    value={taxDocs.aadhaarDocUrl ? [taxDocs.aadhaarDocUrl] : []}
                    onChange={(urls: string[]) => setTaxDocs({ ...taxDocs, aadhaarDocUrl: urls[0] || "" })}
                  />
                </div>
              </div>
            </div>
          )}

          {activeStep === 5 && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Send className="text-blue-600" size={20} /> Review & Submit Application
              </h3>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 text-sm">
                <div>
                  <span className="font-semibold text-slate-700">Store Name:</span> {business.storeName || "Not provided"}
                </div>
                <div>
                  <span className="font-semibold text-slate-700">Category:</span> {business.category || "Not provided"}
                </div>
                <div>
                  <span className="font-semibold text-slate-700">Pickup Address:</span>{" "}
                  {pickup.city ? `${pickup.house_no}, ${pickup.street}, ${pickup.city}, ${pickup.state} ${pickup.zip_code}` : "Not provided"}
                </div>
                <div>
                  <span className="font-semibold text-slate-700">Bank Account:</span> {bank.accountNumber || "Not provided"} ({bank.ifscCode})
                </div>
                <div>
                  <span className="font-semibold text-slate-700">GST / PAN / Aadhaar:</span> {taxDocs.gstNumber || "N/A"} / {taxDocs.panNumber || "N/A"} / {taxDocs.aadhaarNumber || "N/A"}
                </div>
              </div>

              <button
                onClick={handleSubmitApplication}
                disabled={submitting}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-lg transition disabled:opacity-60 text-base shadow"
              >
                {submitting ? "Submitting Application..." : "Submit Application for Admin Approval"}
              </button>
            </div>
          )}

          <div className="flex justify-between mt-8 pt-4 border-t border-slate-100">
            <button
              onClick={() => setActiveStep(Math.max(1, activeStep - 1))}
              disabled={activeStep === 1 || submitting}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 disabled:opacity-40"
            >
              <ChevronLeft size={16} /> Back
            </button>

            {activeStep < 5 && (
              <button
                onClick={handleNext}
                disabled={submitting}
                className="flex items-center gap-1.5 px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Save & Continue <ChevronRight size={16} />
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
