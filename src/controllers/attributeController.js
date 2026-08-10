const Attribute = require("../models/Attribute");
const AttributeValue = require("../models/AttributeValue");
const SubCategory = require("../models/Subcategory");
const Store = require("../models/Store");

const createAttribute = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Only admin can create attributes" });
    }
    const { name, code, categoryId } = req.body;
    if (!categoryId) {
      return res.status(400).json({ message: "category is required" });
    }
    const attribute = await Attribute.create({
      name,
      code,
      categoryId,
      createdBy: req.user._id,
    });
    res.status(201).json({ data: attribute });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const getAttributes = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, status, categoryId } = req.query;
    const filter = {};

    if (req.user.role === "store_owner") {
      const store = await Store.findById(req.user.storeId);
      if (!store || !store.categoryId) {
        return res.status(400).json({ message: "Store category not set" });
      }
      filter.categoryId = store.categoryId;
    } else if (categoryId) {
      filter.categoryId = categoryId;
    }

    if (search) filter.name = { $regex: search, $options: "i" };
    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const [data, total] = await Promise.all([
      Attribute.find(filter)
        .populate("categoryId", "name")
        .skip(skip)
        .limit(Number(limit)),
      Attribute.countDocuments(filter),
    ]);

    res.json({
      data,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const updateAttribute = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Only admin can update attributes" });
    }
    const attribute = await Attribute.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
      },
    );
    res.json({ data: attribute });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const deleteAttribute = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Only admin can delete attributes" });
    }
    await Attribute.findByIdAndDelete(req.params.id);
    await AttributeValue.deleteMany({ attributeId: req.params.id });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const createAttributeValue = async (req, res) => {
  try {
    const { attributeId, value, colorHex } = req.body;

    const exists = await AttributeValue.findOne({
      attributeId,
      value: { $regex: `^${value}$`, $options: "i" },
    });
    if (exists) {
      return res.status(400).json({ message: "This value already exists" });
    }

    const attrValue = await AttributeValue.create({
      attributeId,
      value,
      colorHex,
    });
    res.status(201).json({ data: attrValue });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const getAttributeValues = async (req, res) => {
  try {
    const { attributeId, status } = req.query;
    const filter = {};
    if (attributeId) filter.attributeId = attributeId;
    if (status) filter.status = status;
    const data = await AttributeValue.find(filter);
    res.json({ data });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const updateAttributeValue = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admin can edit values" });
    }
    const val = await AttributeValue.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true },
    );
    res.json({ data: val });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const deleteAttributeValue = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admin can delete values" });
    }
    await AttributeValue.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const getCategoryAttributesWithValues = async (req, res) => {
  try {
    const { subcategoryId } = req.params;
    const subcategory =
      await SubCategory.findById(subcategoryId).populate("allowedAttributes");

    if (!subcategory) {
      return res
        .status(404)
        .json({ success: false, message: "SubCategory not found" });
    }

    const attributes = subcategory.allowedAttributes || [];
    const result = await Promise.all(
      attributes.map(async (attr) => {
        const values = await AttributeValue.find({
          attributeId: attr._id,
          status: "active",
        });
        return {
          _id: attr._id,
          name: attr.name,
          code: attr.code,
          values: values.map((v) => ({
            _id: v._id,
            value: v.value,
            colorHex: v.colorHex,
          })),
        };
      }),
    );

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getTypeAttributesWithValues = async (req, res) => {
  try {
    const { typeId } = req.params;
    const Type = require("../models/Type");

    const typeIds = typeId.includes(",") ? typeId.split(",") : [typeId];

    const types = await Type.find({ _id: { $in: typeIds } })
      .populate("allowedAttributes")
      .populate("variantAttributes");

    if (!types || types.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Product Type(s) not found" });
    }

    const attributeMap = new Map();

    for (const typeObj of types) {
      const attributes = [
        ...(typeObj.allowedAttributes || []),
        ...(typeObj.variantAttributes || []),
      ];
      for (const attr of attributes) {
        if (!attr) continue;
        if (!attributeMap.has(attr._id.toString())) {
          attributeMap.set(attr._id.toString(), attr);
        }
      }
    }

    const uniqueAttributes = Array.from(attributeMap.values());

    const result = await Promise.all(
      uniqueAttributes.map(async (attr) => {
        const values = await AttributeValue.find({
          attributeId: attr._id,
          status: "active",
        });
        return {
          _id: attr._id,
          name: attr.name,
          code: attr.code,
          values: values.map((v) => ({
            _id: v._id,
            value: v.value,
            colorHex: v.colorHex,
          })),
        };
      }),
    );

    res.json({ success: true, data: result.filter(Boolean) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getMultipleTypeAttributesWithValues = async (req, res) => {
  try {
    const { typeIds } = req.body;
    if (!Array.isArray(typeIds) || typeIds.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "typeIds array is required" });
    }

    const Type = require("../models/Type");
    const types = await Type.find({ _id: { $in: typeIds } })
      .populate("allowedAttributes")
      .populate("variantAttributes");

    const attributeMap = new Map();

    for (const typeObj of types) {
      const attributes = [
        ...(typeObj.allowedAttributes || []),
        ...(typeObj.variantAttributes || []),
      ];
      for (const attr of attributes) {
        if (!attr) continue;
        if (!attributeMap.has(attr._id.toString())) {
          attributeMap.set(attr._id.toString(), attr);
        }
      }
    }
    const uniqueAttributes = Array.from(attributeMap.values());
    const result = await Promise.all(
      uniqueAttributes.map(async (attr) => {
        const values = await AttributeValue.find({
          attributeId: attr._id,
          status: "active",
        });
        return {
          _id: attr._id,
          name: attr.name,
          code: attr.code,
          values: values.map((v) => ({
            _id: v._id,
            value: v.value,
            colorHex: v.colorHex,
          })),
        };
      }),
    );

    res.json({ success: true, data: result.filter(Boolean) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
module.exports ={
  createAttribute,
  updateAttributeValue,
  getCategoryAttributesWithValues,
  getAttributes,
  updateAttribute,
  deleteAttribute,
  getAttributeValues,
  deleteAttributeValue,
  createAttributeValue,
  getMultipleTypeAttributesWithValues,
  getTypeAttributesWithValues
}