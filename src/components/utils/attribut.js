export const getAttributeValue = (variant, code) => {
  if (!variant || !Array.isArray(variant.attributes)) return null;
  return variant.attributes.find(
    (a) =>
      a.attributeId?.code === code ||
      a.attributeId?.name?.toLowerCase() === code.toLowerCase() ||
      a.attributeCode === code
  );
};

export const getColorAttribute = (variant) => {
  const attr = getAttributeValue(variant, "color");
  if (!attr) return null;
  return {
    valueId: attr.valueId?._id || attr.valueId,
    value: attr.valueId?.value || attr.value,
    hex: attr.valueId?.colorHex || attr.colorHex || "#000000",
  };
};

export const getSizeAttribute = (variant) => {
  const attr = getAttributeValue(variant, "size");
  if (!attr) return null;
  return {
    valueId: attr.valueId?._id || attr.valueId,
    value: attr.valueId?.value || attr.value,
  };
};

export const getGenericAttribute = (variant, code) => {
  const attr = getAttributeValue(variant, code);
  if (!attr) return null;
  return {
    attributeId: attr.attributeId?._id || attr.attributeId,
    valueId: attr.valueId?._id || attr.valueId,
    value: attr.valueId?.value || attr.value,
  };
};

export const getGroupedTypes = (types = []) => {
  if (!Array.isArray(types)) return [];

  const map = new Map();
  types.forEach((type) => {
    const key = type.name?.trim().toLowerCase();
    if (!key) return;

    if (!map.has(key)) {
      map.set(key, {
        displayName: type.name.trim(),
        typeIds: [type._id],
        count: 0,
      });
    } else {
      const existing = map.get(key);
      if (!existing.typeIds.includes(type._id)) {
        existing.typeIds.push(type._id);
      }
    }
  });

  return Array.from(map.values());
};

export const filterProductsByAttributes = (products = [], selectedAttributes = {}) => {
  if (!Array.isArray(products)) return [];

  const activeAttrKeys = Object.keys(selectedAttributes).filter(
    (key) => Array.isArray(selectedAttributes[key]) && selectedAttributes[key].length > 0
  );

  if (activeAttrKeys.length === 0) return products;

  return products.filter((product) => {
    if (!Array.isArray(product.variants) || product.variants.length === 0) {
      return false;
    }

    return product.variants.some((variant) => {
      if (!Array.isArray(variant.attributes)) return false;

      return activeAttrKeys.every((attrCode) => {
        const selectedVals = selectedAttributes[attrCode];
        if (!selectedVals || selectedVals.length === 0) return true;

        return variant.attributes.some((vAttr) => {
          const attrObj = vAttr.attributeId || vAttr.attribute || {};
          const code = (attrObj.code || vAttr.attributeCode || attrObj.name || vAttr.code || "").toString().toLowerCase();
          const name = (attrObj.name || vAttr.attributeName || vAttr.name || "").toString().toLowerCase();
          const targetCode = attrCode.toLowerCase();

          const codeMatch =
            code === targetCode ||
            name === targetCode ||
            code.includes(targetCode) ||
            name.includes(targetCode);

          if (!codeMatch) return false;

          const valObj = vAttr.valueId || vAttr.valueObj || {};
          const val = typeof valObj === "object" ? (valObj.value || valObj.name) : vAttr.value;
          const valId = typeof valObj === "object" ? (valObj._id || valObj.id) : (vAttr.valueId || vAttr._id || vAttr.id);
          const customVal = vAttr.customValue;

          return (
            selectedVals.includes(val) ||
            selectedVals.includes(valId) ||
            (customVal && selectedVals.includes(customVal))
          );
        });
      });
    });
  });
};

export const getEnrichedAttributes = (attributesList = [], products = []) => {
  if (!Array.isArray(attributesList)) return [];

  const attrValuesMap = new Map();

  attributesList.forEach((attr) => {
    const code = (attr.code || attr.name || "").toString().toLowerCase();
    if (!code) return;

    if (!attrValuesMap.has(code)) {
      attrValuesMap.set(code, new Map());
    }

    const valMap = attrValuesMap.get(code);
    const existingVals = Array.isArray(attr.values) && attr.values.length > 0
      ? attr.values
      : Array.isArray(attr.attributeValues) && attr.attributeValues.length > 0
      ? attr.attributeValues
      : Array.isArray(attr.options)
      ? attr.options
      : [];

    existingVals.forEach((valObj) => {
      const valName = typeof valObj === "object" && valObj !== null
        ? (valObj.value || valObj.name || valObj.val || valObj.colorName || "")
        : String(valObj || "");
      const valId = typeof valObj === "object" && valObj !== null
        ? (valObj._id || valObj.id || valName)
        : valName;
      const hex = typeof valObj === "object" && valObj !== null
        ? (valObj.colorHex || valObj.hex || valObj.color || "#000000")
        : "#000000";

      if (valName && !valMap.has(valName.toLowerCase())) {
        valMap.set(valName.toLowerCase(), {
          _id: valId,
          value: valName,
          name: valName,
          colorHex: hex,
          hex,
        });
      }
    });
  });

  if (Array.isArray(products)) {
    products.forEach((product) => {
      if (!Array.isArray(product.variants)) return;

      product.variants.forEach((variant) => {
        if (!Array.isArray(variant.attributes)) return;

        variant.attributes.forEach((vAttr) => {
          const attrObj = vAttr.attributeId || vAttr.attribute || {};
          const code = (attrObj.code || vAttr.attributeCode || attrObj.name || vAttr.code || "").toString().toLowerCase();
          const name = (attrObj.name || vAttr.attributeName || vAttr.name || "").toString().toLowerCase();

          let targetKey = null;
          for (const key of attrValuesMap.keys()) {
            if (key === code || key === name || code.includes(key) || name.includes(key)) {
              targetKey = key;
              break;
            }
          }

          if (!targetKey && (code || name)) {
            targetKey = code || name;
            if (!attrValuesMap.has(targetKey)) {
              attrValuesMap.set(targetKey, new Map());
            }
          }

          if (targetKey) {
            const valMap = attrValuesMap.get(targetKey);
            const valObj = vAttr.valueId || vAttr.valueObj || {};
            const valName = typeof valObj === "object" && valObj !== null
              ? (valObj.value || valObj.name || valObj.val)
              : typeof vAttr.value === "string"
              ? vAttr.value
              : vAttr.customValue;
            const valId = typeof valObj === "object" && valObj !== null
              ? (valObj._id || valObj.id || valName)
              : (vAttr.valueId || vAttr._id || valName);
            const hex = typeof valObj === "object" && valObj !== null
              ? (valObj.colorHex || valObj.hex || valObj.color || "#000000")
              : (vAttr.colorHex || "#000000");

            if (valName && !valMap.has(String(valName).toLowerCase())) {
              valMap.set(String(valName).toLowerCase(), {
                _id: valId || valName,
                value: String(valName),
                name: String(valName),
                colorHex: hex,
                hex,
              });
            }
          }
        });
      });
    });
  }

  return attributesList.map((attr) => {
    const code = (attr.code || attr.name || "").toString().toLowerCase();
    const valMap = attrValuesMap.get(code);
    const mergedValues = valMap ? Array.from(valMap.values()) : [];

    const existingVals = Array.isArray(attr.values) && attr.values.length > 0
      ? attr.values
      : Array.isArray(attr.attributeValues) && attr.attributeValues.length > 0
      ? attr.attributeValues
      : Array.isArray(attr.options)
      ? attr.options
      : [];

    return {
      ...attr,
      values: mergedValues.length > 0 ? mergedValues : existingVals,
    };
  });
};
