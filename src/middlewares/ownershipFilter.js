const extractStoreId = (req) => {
  return (
    req.query.storeId ||
    req.headers["x-store-id"] ||
    req.body.storeId ||
    req.user?.storeId ||
    null
  );
};

const injectOwnershipFilter = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized: No user" });
    }

    if (user.role === "admin") {
      req.storeFilter = {};
      req.ownershipQuery = {};
      return next();
    }

    if (user.role === "store_owner") {
      if (!user.storeId) {
        return res.status(403).json({
          success: false,
          message: "Forbidden: No store assigned to this owner",
        });
      }
      req.storeFilter = { storeId: user.storeId };
      req.ownershipQuery = { storeId: user.storeId };
      return next();
    }

    const storeId = extractStoreId(req);
    if (storeId) {
      req.storeFilter = { storeId };
      req.ownershipQuery = { storeId };
    } else {
      req.storeFilter = {};
      req.ownershipQuery = {};
    }
    next();
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Ownership filter error",
      error: err.message,
    });
  }
};

const injectPublicStoreFilter = async (req, res, next) => {
  try {
    const storeId = extractStoreId(req);
    if (storeId) {
      req.storeFilter = { storeId };
      req.ownershipQuery = { storeId };
    } else {
      req.storeFilter = {};
      req.ownershipQuery = {};
    }
    next();
  } catch (err) {
    req.storeFilter = {};
    req.ownershipQuery = {};
    next();
  }
};

const applyOwnershipFilter = (req, baseQuery = {}) => {
  if (!req.user) {
    const storeId = extractStoreId(req);
    if (storeId) baseQuery.storeId = storeId;
    return baseQuery;
  }
  if (req.user.role === "admin") {
    const storeId = req.query.storeId || req.headers["x-store-id"];
    if (storeId) baseQuery.storeId = storeId;
    return baseQuery;
  }
  if (req.user.role === "store_owner") {
    baseQuery.storeId = req.user.storeId;
    return baseQuery;
  }
  const storeId = extractStoreId(req);
  if (storeId) {
    baseQuery.storeId = storeId;
  }
  return baseQuery;
};

const ownershipMiddleware = (field = "storeId") => {
  return async (req, res, next) => {
    req.ownershipQuery = {};
    if (!req.user) {
      const storeId = extractStoreId(req);
      if (storeId) req.ownershipQuery[field] = storeId;
      return next();
    }
    if (req.user.role === "admin") {
      const storeId = req.query.storeId || req.headers["x-store-id"];
      if (storeId) req.ownershipQuery[field] = storeId;
      return next();
    }
    if (req.user.role === "store_owner") {
      req.ownershipQuery[field] = req.user.storeId;
      return next();
    }
    const storeId = extractStoreId(req);
    if (storeId) req.ownershipQuery[field] = storeId;
    next();
  };
};

module.exports = {
  injectOwnershipFilter,
  injectPublicStoreFilter,
  applyOwnershipFilter,
  ownershipMiddleware,
  extractStoreId,
};
