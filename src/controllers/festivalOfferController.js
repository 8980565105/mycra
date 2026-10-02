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
    const {name, image, description, start_date, end_date} = req.body;
    const offer = await FestivalOffer.create({
      name,
      image: image || null,
      description,
      start_date,
      end_date,
    });

    return sendResponse(res, true, offer, "Festival offer created successfully");
  } catch (error) {

    return sendResponse(res, false, null, error.message || "Failed to create festival offer");
  }
};

const updateFestivalOffer = async (req, res) => {
  try {
    const {name, image, description, start_date, end_date} = req.body;
    const updateData = {name, description, start_date, end_date};

    if (image !== undefined) {
      updateData.image = image || null;
    }

    const updatedFestivalOffer = await FestivalOffer.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
      );

    if (!updatedFestivalOffer) {
      return sendResponse(res, false, null, "Festival offer not found");
    }

    return sendResponse(res, true, updatedFestivalOffer, "Festival offer updated successfully");
  } catch (error) {

    return sendResponse(res, false, null, err.message || "Failed to update festival offer");
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


module.exports = {
  getAllFestivalOffers,
  getFestivalOfferById,
  createFestivalOffer,
  updateFestivalOffer,
  deleteFestivalOffer,
};

