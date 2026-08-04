const Attribute = require("../models/Attribute");
const AttributeValue = require("../models/AttributeValue");
const SubCategory = require("../models/Subcategory");

// --- ATTRIBUTES ---

exports.createAttribute = async (req, res) => {
  try {
    const { name, code, inputType, status, storeId } = req.body;
    const attribute = new Attribute({
      name,
      code,
      inputType,
      status: status || "active",
      storeId: storeId || req.user?.storeId || null,
      createdBy: req.user?._id,
    });
    await attribute.save();
    res.status(201).json({ success: true, data: attribute });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getAttributes = async (req, res) => {
  try {
    const { page = 1, limit = 100, search, status } = req.query;
    const query = {};
    if (status) query.status = status;
    if (search) query.name = { $regex: search, $options: "i" };

    const skip = (page - 1) * limit;
    const attributes = await Attribute.find(query)
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Attribute.countDocuments(query);

    res.json({
      success: true,
      data: attributes,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateAttribute = async (req, res) => {
  try {
    const attribute = await Attribute.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!attribute)
      return res.status(404).json({ success: false, message: "Attribute not found" });
    res.json({ success: true, data: attribute });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteAttribute = async (req, res) => {
  try {
    const attribute = await Attribute.findByIdAndDelete(req.params.id);
    if (!attribute)
      return res.status(404).json({ success: false, message: "Attribute not found" });
    await AttributeValue.deleteMany({ attributeId: req.params.id });
    res.json({ success: true, message: "Attribute and related values deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- ATTRIBUTE VALUES ---

exports.createAttributeValue = async (req, res) => {
  try {
    const { attributeId, value, colorHex, status, storeId } = req.body;
    const attrVal = new AttributeValue({
      attributeId,
      value,
      colorHex,
      status: status || "active",
      storeId: storeId || req.user?.storeId || null,
    });
    await attrVal.save();
    res.status(201).json({ success: true, data: attrVal });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getAttributeValues = async (req, res) => {
  try {
    const { attributeId, status } = req.query;
    const query = {};
    if (attributeId) query.attributeId = attributeId;
    if (status) query.status = status;

    const values = await AttributeValue.find(query)
      .populate("attributeId", "name code")
      .sort({ value: 1 });

    res.json({ success: true, data: values });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateAttributeValue = async (req, res) => {
  try {
    const attrVal = await AttributeValue.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!attrVal)
      return res.status(404).json({ success: false, message: "Attribute value not found" });
    res.json({ success: true, data: attrVal });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteAttributeValue = async (req, res) => {
  try {
    const attrVal = await AttributeValue.findByIdAndDelete(req.params.id);
    if (!attrVal)
      return res.status(404).json({ success: false, message: "Attribute value not found" });
    res.json({ success: true, message: "Attribute value deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- CATEGORY ATTRIBUTES FETCH ---

exports.getCategoryAttributesWithValues = async (req, res) => {
  try {
    const { subcategoryId } = req.params;
    const subcategory = await SubCategory.findById(subcategoryId).populate("allowedAttributes");

    if (!subcategory) {
      return res.status(404).json({ success: false, message: "SubCategory not found" });
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
          inputType: attr.inputType,
          values: values.map((v) => ({ _id: v._id, value: v.value, colorHex: v.colorHex })),
        };
      })
    );

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getTypeAttributesWithValues = async (req, res) => {
  try {
    const { typeId } = req.params;
    const Type = require("../models/Type");
    const typeObj = await Type.findById(typeId).populate("allowedAttributes");

    if (!typeObj) {
      return res.status(404).json({ success: false, message: "Product Category (Type) not found" });
    }

    const attributes = typeObj.allowedAttributes || [];
    const result = await Promise.all(
      attributes.map(async (attr) => {
        if (!attr) return null;
        const values = await AttributeValue.find({
          attributeId: attr._id,
          status: "active",
        });
        return {
          _id: attr._id,
          name: attr.name,
          code: attr.code,
          inputType: attr.inputType,
          values: values.map((v) => ({ _id: v._id, value: v.value, colorHex: v.colorHex })),
        };
      })
    );

    res.json({ success: true, data: result.filter(Boolean) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
