const Setting = require("../models/Setting");

const getPlatformCharge = async (subtotal, storeId = null) => {
  let setting = storeId ? await Setting.findOne({ storeId }) : null;
  if (!setting) setting = await Setting.findOne({ storeId: null });
  if (!setting) setting = await Setting.findOne({}).sort({ createdAt: -1 });
  if (!setting) return 0;
  const { platform_charge_type, platform_charge_value } = setting;
  if (platform_charge_type === "flat") {
    return Number(platform_charge_value) || 0;
  }
  if (platform_charge_type === "percentage") {
    const charge = (subtotal * (Number(platform_charge_value) || 0)) / 100;
    return Number(charge.toFixed(2));
  }
  return 0;
};

const getItemShipping = (product, price, quantity) => {
  const shippingType = product?.shipping_type;
  const shippingValue = Number(product?.shipping_value || 0);
  const productTotal = Number(price) * Number(quantity);

  if (!shippingType || shippingType === "free") return 0;
  if (shippingType === "flat") return shippingValue;
  if (shippingType === "percentage") {
    return (productTotal * shippingValue) / 100;
  }
  return 0;
};

module.exports = { getPlatformCharge, getItemShipping };
