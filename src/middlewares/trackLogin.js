const LoginHistory = require("../models/LoginHistory");
const UAParser = require("ua-parser-js"); 

const trackLogin = async (req, userId) => {
  try {
    const parser = new UAParser(req.headers["user-agent"]);
    const ua = parser.getResult();
    const ip = (
      req.headers["x-forwarded-for"] ||
      req.socket.remoteAddress ||
      ""
    )
      .toString()
      .split(",")[0]
      .trim();

    await LoginHistory.create({
      userId,
      ip,
      device_type: ua.device.type
        ? ua.device.type[0].toUpperCase() + ua.device.type.slice(1)
        : "Desktop",
      browser: ua.browser.name,
      os: `${ua.os.name} ${ua.os.version || ""}`.trim(),
    });
  } catch (err) {
    console.error("[trackLogin] error:", err.message);
  }
};

module.exports = trackLogin;
