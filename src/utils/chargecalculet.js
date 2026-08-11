export const getItemShipping = (item, baseAmount) => {
  const shippingType = item?.product_id?.shipping_type;
  const shippingValue = item?.product_id?.shipping_value || 0;
  if (!shippingType || shippingType === "free") {
    return 0;
  }
  if (shippingType === "flat") {
    return shippingValue;
  }
  if (shippingType === "percentage") {
    return (baseAmount * shippingValue) / 100;
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
