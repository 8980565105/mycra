const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

const FestivalOffer = require("../models/FestivalOffer");
const { sendResponse } = require("../utils/response");

const getAllFestivalOffers = async (req, res) => {
  try {
    let {
      page = 1,
      limit = 10,
      search = "",
      isDownload = "false",
    } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

    const download = String(isDownload).toLowerCase() === "true";
    const query = {};

    if (search) {
      query.name = {
        $regex: search,
        $options: "i",
      };
    }

    if (download) {
      const offers = await FestivalOffer.find(query)
        .sort({ createdAt: -1 })
        .lean();

      return sendResponse( res, true,  { offers }, "All festival offers for download" );
    }

    const total = await FestivalOffer.countDocuments(query);
    const offers = await FestivalOffer.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return sendResponse( res, true, {
        offers,
        total,
        page,
        pagesCount: Math.ceil(total / limit),
      },
      "Festival offers fetched successfully"
    );
  } catch (err) {
    console.error("Get Festival Offers Error:", err);

    return sendResponse( res, false, null, err.message || "Failed to fetch festival offers" );
  }
};

const getFestivalOfferById = async (req, res) => {
  try {
    const festivalOffer = await FestivalOffer.findById(req.params.id);
    if (!festivalOffer) return sendResponse(res, false, null, "Festival offer not found");
    sendResponse(res, true, festivalOffer, "Festival offer retrieved successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const createFestivalOffer = async (req, res) => {
  try {
    const { name, banners, description, display_on, start_date, end_date, status} = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Name is required",
      });
    }

    const festivalOfferData = {
      name,
      banners: Array.isArray(banners) ? banners : [],
      description: description || "",
      display_on: display_on || "shop",
      start_date,
      end_date,
      status: status || "active",
    };

    const festivalOffer = new FestivalOffer(festivalOfferData);
    const savedFestivalOffer = await festivalOffer.save();

    sendResponse(res, true, savedFestivalOffer, "Festival offer created successfully" );
  } catch (err) {
    sendResponse(res, false, null, err.message || "Failed to create festival offer" );
  }
};
const updateFestivalOffer = async (req, res) => {
  try {
    const updateData = { ...req.body };

    const updatedFestivalOffer = await FestivalOffer.findByIdAndUpdate(
        req.params.id,
        updateData,
        {
          new: true, runValidators: true,
        }
      );

    if (!updatedFestivalOffer) {
      return sendResponse(res, false, null,  "Festival offer not found" );
    }

    sendResponse(res, true, updatedFestivalOffer,  "Festival offer updated successfully" );
  } catch (err) {
    sendResponse(res, false, null,  err.message || "Failed to update festival offer" );
  }
};

const updateFestivalOfferStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;
    if (!["active", "inactive"].includes(status))
      return sendResponse(res, false, null, "Invalid status value");
    const festivalOffer = await FestivalOffer.findByIdAndUpdate(
      id,
      { status },
      { returnDocument: "after" },
    );
    if (!festivalOffer) return sendResponse(res, false, null, "Festival offer not found");
    sendResponse(res, true, festivalOffer, "Festival offer status updated successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const deleteFestivalOffer = async (req, res) => {
  try {
    const deletedOffer = await FestivalOffer.findByIdAndDelete(req.params.id);
    if (!deletedOffer)
      return sendResponse(res, false, null, "Festival offer not found");
    sendResponse(res, true, null, "Festival offer deleted successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const bulkDeleteFestivalOffers = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0)
      return sendResponse(res, false, null, "No IDs provided");

    const result = await FestivalOffer.deleteMany({ _id: { $in: ids } });
    sendResponse(
      res,
      true,
      { deletedCount: result.deletedCount },
      "Festival offers deleted successfully",
    );
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

module.exports = {
  getAllFestivalOffers,
  getFestivalOfferById,
  createFestivalOffer,
  updateFestivalOffer,
  deleteFestivalOffer,
  bulkDeleteFestivalOffers,
  updateFestivalOfferStatus
};

