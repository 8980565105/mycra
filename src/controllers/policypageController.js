const mongoose = require("mongoose");
const sendResponse = (res, statusCode, success, message, data = null) => {
  return res.status(statusCode).json({ success, message, data });
};
const PolicyPage = require("../models/Policypage");
const getpolicypage = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", status } = req.query;

    const query = { ...(req.ownershipQuery || {}) };

    if (search) {
      query.$or = [
        { page_name: { $regex: search, $options: "i" } },
        { slug: { $regex: search, $options: "i" } },
        { meta_title: { $regex: search, $options: "i" } },
      ];
    }

    if (status) query.status = status;

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.max(parseInt(limit, 10) || 10, 1);
    const skip = (pageNum - 1) * limitNum;

    const [policyPages, total] = await Promise.all([
      PolicyPage.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      PolicyPage.countDocuments(query),
    ]);

    return sendResponse(res, 200, true, "Policy pages fetched successfully", {
      policyPages,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    return sendResponse(
      res,
      500,
      false,
      error.message || "Something went wrong",
    );
  }
};

const createpolicypage = async (req, res) => {
  try {
    const {
      page_name,
      slug,
      description,
      meta_title,
      meta_description,
      meta_keyphrase,
      seo_image,
      order,
      status,
    } = req.body;

    if (!page_name) {
      return sendResponse(res, 400, false, "Page name is required");
    }

    const existing = slug ? await PolicyPage.findOne({ slug }) : null;
    if (existing) {
      return sendResponse(
        res,
        409,
        false,
        "Slug already exists, please choose another",
      );
    }

    const policyPage = new PolicyPage({
      page_name,
      slug,
      description,
      meta_title,
      meta_description,
      meta_keyphrase,
      seo_image,
      order,
      status,
      createdBy: req.user?._id,
      ...(req.ownershipQuery || {}),
    });

    await policyPage.save();

    return sendResponse(
      res,
      201,
      true,
      "Policy page created successfully",
      policyPage,
    );
  } catch (error) {
    if (error.code === 11000) {
      return sendResponse(
        res,
        409,
        false,
        "Slug already exists, please choose another",
      );
    }
    return sendResponse(
      res,
      500,
      false,
      error.message || "Something went wrong",
    );
  }
};
const getpolicypageBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const query = { slug, status: "active", ...(req.ownershipQuery || {}) };

    const policyPage = await PolicyPage.findOne(query);

    if (!policyPage) {
      return sendResponse(res, 404, false, "Policy page not found");
    }

    return sendResponse(
      res,
      200,
      true,
      "Policy page fetched successfully",
      policyPage,
    );
  } catch (error) {
    return sendResponse(
      res,
      500,
      false,
      error.message || "Something went wrong",
    );
  }
};

const getpolicypageById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendResponse(res, 400, false, "Invalid policy page id");
    }

    const query = { _id: id, ...(req.ownershipQuery || {}) };

    const policyPage = await PolicyPage.findOne(query);

    if (!policyPage) {
      return sendResponse(res, 404, false, "Policy page not found");
    }
    return sendResponse(
      res,
      200,
      true,
      "Policy page fetched successfully",
      policyPage,
    );
  } catch (error) {
    return sendResponse(
      res,
      500,
      false,
      error.message || "Something went wrong",
    );
  }
};

const updatepolicypage = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendResponse(res, 400, false, "Invalid policy page id");
    }

    const {
      page_name,
      slug,
      description,
      meta_title,
      meta_description,
      meta_keyphrase,
      seo_image,
      order,
      status,
    } = req.body;

    if (slug) {
      const existing = await PolicyPage.findOne({ slug, _id: { $ne: id } });
      if (existing) {
        return sendResponse(
          res,
          409,
          false,
          "Slug already exists, please choose another",
        );
      }
    }

    const query = { _id: id, ...(req.ownershipQuery || {}) };

    const policyPage = await PolicyPage.findOneAndUpdate(
      query,
      {
        $set: {
          ...(page_name !== undefined && { page_name }),
          ...(slug !== undefined && { slug }),
          ...(description !== undefined && { description }),
          ...(meta_title !== undefined && { meta_title }),
          ...(meta_description !== undefined && { meta_description }),
          ...(meta_keyphrase !== undefined && { meta_keyphrase }),
          ...(seo_image !== undefined && { seo_image }),
          ...(order !== undefined && { order }),
          ...(status !== undefined && { status }),
        },
      },
      { new: true, runValidators: true },
    );

    if (!policyPage) {
      return sendResponse(res, 404, false, "Policy page not found");
    }

    return sendResponse(
      res,
      200,
      true,
      "Policy page updated successfully",
      policyPage,
    );
  } catch (error) {
    if (error.code === 11000) {
      return sendResponse(
        res,
        409,
        false,
        "Slug already exists, please choose another",
      );
    }
    return sendResponse(
      res,
      500,
      false,
      error.message || "Something went wrong",
    );
  }
};

const updatepolicypagestatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendResponse(res, 400, false, "Invalid policy page id");
    }

    if (!["active", "inactive"].includes(status)) {
      return sendResponse(
        res,
        400,
        false,
        "Status must be either active or inactive",
      );
    }
    const query = { _id: id, ...(req.ownershipQuery || {}) };
    const policyPage = await PolicyPage.findOneAndUpdate(
      query,
      { $set: { status } },
      { new: true },
    );
    if (!policyPage) {
      return sendResponse(res, 404, false, "Policy page not found");
    }
    return sendResponse(
      res,
      200,
      true,
      "Status updated successfully",
      policyPage,
    );
  } catch (error) {
    return sendResponse(
      res,
      500,
      false,
      error.message || "Something went wrong",
    );
  }
};

const deletepolicypage = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendResponse(res, 400, false, "Invalid policy page id");
    }

    const query = { _id: id, ...(req.ownershipQuery || {}) };

    const policyPage = await PolicyPage.findOneAndDelete(query);

    if (!policyPage) {
      return sendResponse(res, 404, false, "Policy page not found");
    }

    return sendResponse(res, 200, true, "Policy page deleted successfully");
  } catch (error) {
    return sendResponse(
      res,
      500,
      false,
      error.message || "Something went wrong",
    );
  }
};

const bulkdeletepolicypage = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return sendResponse(
        res,
        400,
        false,
        "Please provide an array of ids to delete",
      );
    }

    const validIds = ids.filter((id) => mongoose.Types.ObjectId.isValid(id));

    if (validIds.length === 0) {
      return sendResponse(res, 400, false, "No valid ids provided");
    }

    const query = { _id: { $in: validIds }, ...(req.ownershipQuery || {}) };

    const result = await PolicyPage.deleteMany(query);

    return sendResponse(
      res,
      200,
      true,
      `${result.deletedCount} policy page(s) deleted successfully`,
    );
  } catch (error) {
    return sendResponse(
      res,
      500,
      false,
      error.message || "Something went wrong",
    );
  }
};

module.exports = {
  getpolicypage,
  createpolicypage,
  getpolicypageBySlug,
  getpolicypageById,
  updatepolicypage,
  updatepolicypagestatus,
  deletepolicypage,
  bulkdeletepolicypage,
};
