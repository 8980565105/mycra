export const getItemShipping = (item) => {
  const shippingType = item?.product_id?.shipping_type;
  const shippingValue = Number(item?.product_id?.shipping_value || 0);
  const price = Number(
    item?.variant_id?.offerprice ||
      item?.variant_id?.price ||
      item?.product_id?.price ||
      0,
  );
  const quantity = Number(item?.quantity || 1);
  const productTotal = price * quantity;
  if (!shippingType || shippingType === "free") {
    return 0;
  }
  if (shippingType === "flat") {
    return shippingValue;
  }
  if (shippingType === "percentage") {
    return (productTotal * shippingValue) / 100;
  }
  return 0;
};

export const getPlatformCharge = (settings, baseAmount) => {
  const chargeType = settings?.platform_charge_type;
  const chargeValue = settings?.platform_charge_value || 0;
  if (!chargeType) return 0;
  if (chargeType === "flat") {
    return chargeValue;
  }
  if (chargeType === "percentage") {
    return (baseAmount * chargeValue) / 100;
  }
  return 0;
};
