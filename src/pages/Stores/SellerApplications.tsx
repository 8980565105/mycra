import React, { useState, useEffect } from "react";
import api from "@/services/api";
import { ROUTES } from "@/services/routes";
import { toast } from "sonner";
import { Check, X, Eye, Building2, MapPin, Landmark, FileText, Search } from "lucide-react";

export default function SellerApplications() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [filterStatus, setFilterStatus] = useState("submitted");

  useEffect(() => {
    fetchApplications();
  }, [filterStatus]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const url = filterStatus
        ? `${ROUTES.seller.getApplications}?status=${filterStatus}`
        : ROUTES.seller.getApplications;
      const res = await api.get(url);
      if (res.data.success) {
        setApplications(res.data.data);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to fetch seller applications");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (appId: string) => {
    if (!window.confirm("Are you sure you want to approve this seller application? Store will be created automatically.")) {
      return;
    }
    try {
      setProcessing(true);
      const res = await api.post(ROUTES.seller.approveApplication(appId));
      if (res.data.success) {
        toast.success("Seller application approved and Store created!");
        fetchApplications();
        setSelectedApp(null);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Approval failed");
    } finally {
      setProcessing(false);
    }
  };

  const handleRejectSubmit = async () => {
    if (!rejectionReason.trim()) {
      toast.error("Please enter a rejection reason");
      return;
    }
    try {
      setProcessing(true);
      const res = await api.post(ROUTES.seller.rejectApplication(selectedApp._id), {
        rejectionReason,
      });
      if (res.data.success) {
        toast.success("Seller application rejected.");
        setShowRejectModal(false);
        setRejectionReason("");
        fetchApplications();
        setSelectedApp(null);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Rejection failed");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Seller Applications</h1>
          <p className="text-sm text-slate-500">Review seller applications and approve store creation.</p>
        </div>

        {/* Filter Status Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-xl">
          {["submitted", "approved", "rejected", ""].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition ${filterStatus === st ? "bg-white text-slate-800 shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
            >
              {st === "" ? "All" : st.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500 animate-pulse">Loading applications...</div>
        ) : applications.length === 0 ? (
          <div className="p-8 text-center text-slate-400">No seller applications found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase">
                <tr>
                  <th className="p-4">Applicant</th>
                  <th className="p-4">Store Name</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">GST / PAN</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {applications.map((app) => (
                  <tr key={app._id} className="hover:bg-slate-50 transition">
                    <td className="p-4">
                      <div className="font-semibold text-slate-900">{app.user?.name || "N/A"}</div>
                      <div className="text-xs text-slate-500">{app.user?.email}</div>
                      <div className="text-xs text-slate-400">{app.user?.mobile_number}</div>
                    </td>
                    <td className="p-4 font-medium text-slate-800">
                      {app.businessDetails?.storeName || "N/A"}
                    </td>
                    <td className="p-4 text-slate-600">{app.businessDetails?.category || "N/A"}</td>
                    <td className="p-4 text-xs font-mono text-slate-600">
                      <div>GST: {app.taxAndDocs?.gstNumber || "N/A"}</div>
                      <div>PAN: {app.taxAndDocs?.panNumber || "N/A"}</div>
                      <div>Aadhaar: {app.taxAndDocs?.aadhaarNumber || "N/A"}</div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-full capitalize ${app.status === "approved"
                          ? "bg-emerald-100 text-emerald-700"
                          : app.status === "rejected"
                            ? "bg-rose-100 text-rose-700"
                            : "bg-amber-100 text-amber-700"
                          }`}
                      >
                        {app.status}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => setSelectedApp(app)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium inline-flex items-center gap-1"
                      >
                        <Eye size={14} /> View Details
                      </button>
                      {app.status === "submitted" && (
                        <>
                          <button
                            onClick={() => handleApprove(app._id)}
                            disabled={processing}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium inline-flex items-center gap-1"
                          >
                            <Check size={14} /> Approve
                          </button>
                          <button
                            onClick={() => {
                              setSelectedApp(app);
                              setShowRejectModal(true);
                            }}
                            disabled={processing}
                            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-medium inline-flex items-center gap-1"
                          >
                            <X size={14} /> Reject
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedApp && !showRejectModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-xl font-bold text-slate-800">Application Details</h3>
              <button onClick={() => setSelectedApp(null)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            {/* Applicant */}
            <div>
              <h4 className="font-semibold text-slate-700 text-sm flex items-center gap-1.5 mb-2">
                <Building2 size={16} className="text-blue-600" /> Business Details
              </h4>
              <div className="grid grid-cols-2 gap-2 text-sm bg-slate-50 p-3 rounded-lg border">
                <div><strong>Store Name:</strong> {selectedApp.businessDetails?.storeName}</div>
                <div><strong>Category:</strong> {selectedApp.businessDetails?.category}</div>
                <div><strong>Business Type:</strong> {selectedApp.businessDetails?.businessType}</div>
                <div><strong>Website:</strong> {selectedApp.businessDetails?.website}</div>
                <div><strong>Phone:</strong> {selectedApp.businessDetails?.phone}</div>
                <div><strong>Email:</strong> {selectedApp.businessDetails?.email}</div>
              </div>
            </div>

            {/* Pickup Address */}
            <div>
              <h4 className="font-semibold text-slate-700 text-sm flex items-center gap-1.5 mb-2">
                <MapPin size={16} className="text-blue-600" /> Pickup Address
              </h4>
              <div className="text-sm bg-slate-50 p-3 rounded-lg border">
                {selectedApp.pickupAddress ? (
                  <>
                    <p><strong>Contact:</strong> {selectedApp.pickupAddress.full_name} ({selectedApp.pickupAddress.phone_number})</p>
                    <p>{selectedApp.pickupAddress.house_no}, {selectedApp.pickupAddress.street}</p>
                    <p>{selectedApp.pickupAddress.city}, {selectedApp.pickupAddress.state} - {selectedApp.pickupAddress.zip_code}</p>
                  </>
                ) : "No pickup address provided"}
              </div>
            </div>

            {/* Bank Details */}
            <div>
              <h4 className="font-semibold text-slate-700 text-sm flex items-center gap-1.5 mb-2">
                <Landmark size={16} className="text-blue-600" /> Bank Details
              </h4>
              <div className="grid grid-cols-2 gap-2 text-sm bg-slate-50 p-3 rounded-lg border">
                <div><strong>Holder Name:</strong> {selectedApp.bankDetails?.accountHolderName}</div>
                <div><strong>Account No:</strong> {selectedApp.bankDetails?.accountNumber}</div>
                <div><strong>IFSC Code:</strong> {selectedApp.bankDetails?.ifscCode}</div>
                <div><strong>Bank Name:</strong> {selectedApp.bankDetails?.bankName}</div>
              </div>
            </div>

            {/* Tax Docs */}
            <div>
              <h4 className="font-semibold text-slate-700 text-sm flex items-center gap-1.5 mb-2">
                <FileText size={16} className="text-blue-600" /> Tax & Govt Documents
              </h4>
              <div className="grid grid-cols-2 gap-2 text-sm bg-slate-50 p-3 rounded-lg border">
                <div><strong>GSTIN:</strong> {selectedApp.taxAndDocs?.gstNumber || "N/A"}</div>
                <div><strong>PAN:</strong> {selectedApp.taxAndDocs?.panNumber || "N/A"}</div>
                <div><strong>Aadhaar No:</strong> {selectedApp.taxAndDocs?.aadhaarNumber || "N/A"}</div>
                <div><strong>Aadhaar Doc:</strong> {selectedApp.taxAndDocs?.aadhaarDocUrl ? <a href={selectedApp.taxAndDocs.aadhaarDocUrl} target="_blank" rel="noreferrer" className="text-blue-600 underline">View Document</a> : "N/A"}</div>
              </div>
            </div>

            {selectedApp.status === "submitted" && (
              <div className="flex justify-end gap-3 pt-3 border-t">
                <button
                  onClick={() => setShowRejectModal(true)}
                  className="px-4 py-2 bg-rose-600 text-white rounded-lg font-medium text-sm hover:bg-rose-700"
                >
                  Reject Application
                </button>
                <button
                  onClick={() => handleApprove(selectedApp._id)}
                  disabled={processing}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium text-sm hover:bg-emerald-700"
                >
                  Approve & Create Store
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {showRejectModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-800">Reject Application</h3>
            <p className="text-xs text-slate-500">Provide a reason for rejection. The seller will be able to edit details and resubmit.</p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. GST document is unclear or PAN name mismatch..."
              className="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none h-28"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectSubmit}
                disabled={processing}
                className="px-4 py-2 bg-rose-600 text-white rounded-lg text-sm font-medium hover:bg-rose-700"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
