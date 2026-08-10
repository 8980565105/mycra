// const Business = require("../models/Business");
// const { sendResponse } = require("../utils/response");

// const getBusinesses = async (req, res) => {
//   try {
//     let {
//       page = 1,
//       limit = 10,
//       search = "",
//       isDownload = "false",
//       status,
//     } = req.query;

//     const download = isDownload.toString().toLowerCase() === "true";
//     page = parseInt(page);
//     limit = parseInt(limit);

//     const query = {};
//     if (status && ["active", "inactive"].includes(status))
//       query.status = status;
//     if (search) query.name = { $regex: search, $options: "i" };

//     if (download) {
//       const businesses = await Business.find(query).sort({ name: 1 });
//       return sendResponse(
//         res,
//         true,
//         { businesses },
//         "All businesses retrieved for download",
//       );
//     }

//     const total = await Business.countDocuments(query);

//     let businessQuery = Business.find(query).sort({ name: 1 });
//     if (limit > 0) {
//       businessQuery = businessQuery.skip((page - 1) * limit).limit(limit);
//     }

//     const businesses = await businessQuery;

//     sendResponse(res, true, {
//       businesses,
//       total,
//       page,
//       pages: limit > 0 ? Math.ceil(total / limit) : 1,
//     });
//   } catch (err) {
//     sendResponse(res, false, null, err.message);
//   }
// };

// const getBusinessById = async (req, res) => {
//   try {
//     const business = await Business.findById(req.params.id);
//     if (!business) return sendResponse(res, false, null, "Business not found");
//     sendResponse(res, true, business, "Business retrieved successfully");
//   } catch (err) {
//     sendResponse(res, false, null, err.message);
//   }
// };

// const createBusiness = async (req, res) => {
//   try {
//     const { name, status } = req.body;
//     if (!name) return sendResponse(res, false, null, "Name is required");

//     const business = new Business({
//       name,
//       status: status || "active",
//     });
//     const savedBusiness = await business.save();
//     sendResponse(res, true, savedBusiness, "Business created successfully");
//   } catch (err) {
//     sendResponse(res, false, null, err.message);
//   }
// };

// const updateBusiness = async (req, res) => {
//   try {
//     const updatedBusiness = await Business.findByIdAndUpdate(
//       req.params.id,
//       req.body,
//       { returnDocument: "after" },
//     );
//     if (!updatedBusiness)
//       return sendResponse(res, false, null, "Business not found");
//     sendResponse(res, true, updatedBusiness, "Business updated successfully");
//   } catch (err) {
//     sendResponse(res, false, null, err.message);
//   }
// };

// const updateBusinessStatus = async (req, res) => {
//   try {
//     const { status } = req.body;
//     const { id } = req.params;

//     if (!["active", "inactive"].includes(status))
//       return sendResponse(res, false, null, "Invalid status value");

//     const business = await Business.findByIdAndUpdate(
//       id,
//       { status },
//       { returnDocument: "after" },
//     );
//     if (!business) return sendResponse(res, false, null, "Business not found");

//     sendResponse(res, true, business, "Business status updated successfully");
//   } catch (err) {
//     sendResponse(res, false, null, err.message);
//   }
// };

// const deleteBusiness = async (req, res) => {
//   try {
//     const deletedBusiness = await Business.findByIdAndDelete(req.params.id);
//     if (!deletedBusiness)
//       return sendResponse(res, false, null, "Business not found");
//     sendResponse(res, true, null, "Business deleted successfully");
//   } catch (err) {
//     sendResponse(res, false, null, err.message);
//   }
// };

// const bulkDeleteBusinesses = async (req, res) => {
//   try {
//     const { ids } = req.body;
//     if (!ids || !Array.isArray(ids) || !ids.length)
//       return sendResponse(res, false, null, "No IDs provided");

//     const result = await Business.deleteMany({ _id: { $in: ids } });
//     sendResponse(
//       res,
//       true,
//       { deletedCount: result.deletedCount },
//       "Businesses deleted successfully",
//     );
//   } catch (err) {
//     sendResponse(res, false, null, err.message);
//   }
// };

// const getActiveBusinesses = async (req, res) => {
//   try {
//     const businesses = await Business.find({ status: "active" })
//       .select("name status")
//       .sort({ name: 1 });
//     sendResponse(res, true, { businesses }, "Active businesses retrieved");
//   } catch (err) {
//     sendResponse(res, false, null, err.message);
//   }
// };

// module.exports = {
//   getBusinesses,
//   getBusinessById,
//   createBusiness,
//   updateBusiness,
//   deleteBusiness,
//   bulkDeleteBusinesses,
//   updateBusinessStatus,
//   getActiveBusinesses,
// };
