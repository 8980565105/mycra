const Emails = require("../models/Email");
const { sendResponse } = require("../utils/response");

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const createEmails = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return sendResponse(res, false, null, "Email is required");
    }
    const normalizedEmail = email.toLowerCase().trim();
    if (!validateEmail(normalizedEmail)) {
      return sendResponse(res, false, null, "Please enter a valid email");
    }
    const existingEmail = await Emails.findOne({
      email: normalizedEmail,
    });
    if (existingEmail) {
      return sendResponse(res, false, null, "This email is already subscribed");
    }
    const newEmail = await Emails.create({
      email: normalizedEmail,
    });
    return sendResponse(res, true, newEmail, "Email created successfully");
  } catch (err) {
    return sendResponse(res, false, null, err.message);
  }
};

const getEmails = async (req, res) => {
  try {
    let { page = 1, limit = 10, search = "" } = req.query;
    page = Number(page);
    limit = Number(limit);
    const skip = (page - 1) * limit;
    const filter = {};
    if (search?.trim()) {
      filter.email = {
        $regex: search.trim(),
        $options: "i",
      };
    }
    const [emails, total] = await Promise.all([
      Emails.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Emails.countDocuments(filter),
    ]);
    return sendResponse(
      res,
      true,
      {
        emails,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      "Emails fetched successfully",
    );
  } catch (err) {
    return sendResponse(res, false, null, err.message);
  }
};

const getEmailById = async (req, res) => {
  try {
    const { id } = req.params;
    const email = await Emails.findById(id);
    if (!email) {
      return sendResponse(res, false, null, "Email not found");
    }
    return sendResponse(res, true, email, "Email fetched successfully");
  } catch (err) {
    return sendResponse(res, false, null, err.message);
  }
};

const updateEmail = async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.body;
    if (!email) {
      return sendResponse(res, false, null, "Email is required");
    }
    const normalizedEmail = email.toLowerCase().trim();
    if (!validateEmail(normalizedEmail)) {
      return sendResponse(res, false, null, "Please enter a valid email");
    }
    const existingEmail = await Emails.findOne({
      email: normalizedEmail,
      _id: { $ne: id },
    });
    if (existingEmail) {
      return sendResponse(res, false, null, "This email is already subscribed");
    }
    const updatedEmail = await Emails.findByIdAndUpdate(
      id,
      {
        email: normalizedEmail,
      },
      {
        new: true,
        runValidators: true,
      },
    );
    if (!updatedEmail) {
      return sendResponse(res, false, null, "Email not found");
    }
    return sendResponse(res, true, updatedEmail, "Email updated successfully");
  } catch (err) {
    return sendResponse(res, false, null, err.message);
  }
};

const deleteEmail = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedEmail = await Emails.findByIdAndDelete(id);
    if (!deletedEmail) {
      return sendResponse(res, false, null, "Email not found");
    }
    return sendResponse(res, true, deletedEmail, "Email deleted successfully");
  } catch (err) {
    return sendResponse(res, false, null, err.message);
  }
};

const bulkDeleteEmails = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return sendResponse(res, false, null, "Please provide email IDs");
    }
    const result = await Emails.deleteMany({
      _id: { $in: ids },
    });
    return sendResponse(
      res,
      true,
      {
        deletedCount: result.deletedCount,
      },
      `${result.deletedCount} emails deleted successfully`,
    );
  } catch (err) {
    return sendResponse(res, false, null, err.message);
  }
};

module.exports = {
  createEmails,
  getEmails,
  getEmailById,
  updateEmail,
  deleteEmail,
  bulkDeleteEmails,
};
