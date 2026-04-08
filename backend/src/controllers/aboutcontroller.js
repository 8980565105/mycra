const AboutPage = require("../models/Aboute");
const { sendResponse } = require("../utils/response");
const path = require("path");

const getImageUrl = (req, filename) =>
  filename ? `${req.protocol}://${req.get("host")}/uploads/${filename}` : null;

const getPublicAboutPage = async (req, res) => {
  try {
    const filter = {};
    if (req.storeFilter?.storeId) filter.storeId = req.storeFilter.storeId;

    const page = await AboutPage.findOne(filter).lean();
    if (!page) return sendResponse(res, true, null, "No about page found");

    page.content = (page.content || []).filter((c) => c.status === "active");

    sendResponse(res, true, page, "About page fetched successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const getAboutPage = async (req, res) => {
  try {
    const filter = { ...req.ownershipQuery };
    const page = await AboutPage.findOne(filter).lean();
    sendResponse(res, true, page || {}, "About page fetched successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const saveAboutPage = async (req, res) => {
  try {
    const storeId =
      req.user.role === "admin"
        ? req.body.storeId || null
        : req.user.storeId || null;

    const { heroTitle, heroDesc, content, features } = req.body;

    let heroImage = req.body.heroImage || "";
    if (req.files?.heroImage?.[0]) {
      heroImage = getImageUrl(req, req.files.heroImage[0].filename);
    }

    const parsedContent = (
      typeof content === "string" ? JSON.parse(content) : content || []
    ).map((item, i) => {
      const uploadedFile = req.files?.[`contentImage_${i}`]?.[0];
      return {
        ...item,
        image: uploadedFile
          ? getImageUrl(req, uploadedFile.filename)
          : item.image || "",
      };
    });

    const parsedFeatures =
      typeof features === "string" ? JSON.parse(features) : features || [];

    const updateData = {
      heroTitle: heroTitle || "",
      heroDesc: heroDesc || "",
      heroImage,
      content: parsedContent,
      features: parsedFeatures,
      storeId,
    };

    const page = await AboutPage.findOneAndUpdate(
      { storeId },
      { $set: updateData },
      { upsert: true, new: true },
    );

    sendResponse(res, true, page, "About page saved successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const updateHero = async (req, res) => {
  try {
    const storeId =
      req.user.role === "admin" ? req.body.storeId || null : req.user.storeId;

    let heroImage = req.body.heroImage || "";
    if (req.file) heroImage = getImageUrl(req, req.file.filename);

    const page = await AboutPage.findOneAndUpdate(
      { storeId },
      {
        $set: {
          heroTitle: req.body.heroTitle,
          heroDesc: req.body.heroDesc,
          heroImage,
        },
      },
      { upsert: true, new: true },
    );

    sendResponse(res, true, page, "Hero updated successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const addContentItem = async (req, res) => {
  try {
    const storeId =
      req.user.role === "admin" ? req.body.storeId || null : req.user.storeId;

    let image = req.body.image || "";
    if (req.file) image = getImageUrl(req, req.file.filename);

    const newItem = {
      title: req.body.title || "",
      desc: req.body.desc || "",
      order: Number(req.body.order) || 0,
      status: req.body.status || "active",
      image,
    };

    const page = await AboutPage.findOneAndUpdate(
      { storeId },
      { $push: { content: newItem } },
      { upsert: true, new: true },
    );

    sendResponse(res, true, page, "Content item added successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const updateContentItem = async (req, res) => {
  try {
    const storeId =
      req.user.role === "admin" ? req.body.storeId || null : req.user.storeId;
    const { itemId } = req.params;

    let image = req.body.image || "";
    if (req.file) image = getImageUrl(req, req.file.filename);

    const page = await AboutPage.findOneAndUpdate(
      { storeId, "content._id": itemId },
      {
        $set: {
          "content.$.title": req.body.title,
          "content.$.desc": req.body.desc,
          "content.$.order": Number(req.body.order) || 0,
          "content.$.status": req.body.status || "active",
          ...(image ? { "content.$.image": image } : {}),
        },
      },
      { new: true },
    );

    if (!page) return sendResponse(res, false, null, "Content item not found");
    sendResponse(res, true, page, "Content item updated successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const updateContentStatus = async (req, res) => {
  try {
    const storeId =
      req.user.role === "admin" ? req.body.storeId || null : req.user.storeId;
    const { itemId } = req.params;
    const { status } = req.body;

    if (!["active", "inactive"].includes(status))
      return sendResponse(res, false, null, "Invalid status value");

    const page = await AboutPage.findOneAndUpdate(
      { storeId, "content._id": itemId },
      { $set: { "content.$.status": status } },
      { new: true },
    );

    if (!page) return sendResponse(res, false, null, "Content item not found");
    sendResponse(res, true, page, "Status updated successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const deleteContentItem = async (req, res) => {
  try {
    const storeId =
      req.user.role === "admin" ? req.query.storeId || null : req.user.storeId;
    const { itemId } = req.params;

    const page = await AboutPage.findOneAndUpdate(
      { storeId },
      { $pull: { content: { _id: itemId } } },
      { new: true },
    );

    if (!page) return sendResponse(res, false, null, "Page not found");
    sendResponse(res, true, page, "Content item deleted successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const addFeature = async (req, res) => {
  try {
    const storeId =
      req.user.role === "admin" ? req.body.storeId || null : req.user.storeId;

    let icon = "";

    if (req.file) {
      icon = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    } else if (req.body.icon && typeof req.body.icon === "string") {
      icon = req.body.icon;
    }

    const newFeature = {
      icon,
      title: req.body.title || "",
      desc: req.body.desc || "",
      order: Number(req.body.order) || 0,
    };

    const page = await AboutPage.findOneAndUpdate(
      { storeId },
      { $push: { features: newFeature } },
      { upsert: true, new: true },
    );

    res.json({ success: true, data: page });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

const updateFeature = async (req, res) => {
  try {
    const storeId =
      req.user.role === "admin" ? req.body.storeId || null : req.user.storeId;

    const { featureId } = req.params;

    let icon;

    if (req.file) {
      icon = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    } else if (req.body.icon && typeof req.body.icon === "string") {
      icon = req.body.icon;
    }

    const updateData = {
      "features.$.title": req.body.title,
      "features.$.desc": req.body.desc,
      "features.$.order": Number(req.body.order) || 0,
    };

    if (icon) {
      updateData["features.$.icon"] = icon;
    }

    const page = await AboutPage.findOneAndUpdate(
      { storeId, "features._id": featureId },
      { $set: updateData },
      { new: true },
    );

    res.json({ success: true, data: page });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

const deleteFeature = async (req, res) => {
  try {
    const storeId =
      req.user.role === "admin" ? req.query.storeId || null : req.user.storeId;
    const { featureId } = req.params;

    const page = await AboutPage.findOneAndUpdate(
      { storeId },
      { $pull: { features: { _id: featureId } } },
      { new: true },
    );

    if (!page) return sendResponse(res, false, null, "Page not found");
    sendResponse(res, true, page, "Feature deleted successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

module.exports = {
  getPublicAboutPage,
  getAboutPage,
  saveAboutPage,
  updateHero,
  addContentItem,
  updateContentItem,
  updateContentStatus,
  deleteContentItem,
  addFeature,
  updateFeature,
  deleteFeature,
};
