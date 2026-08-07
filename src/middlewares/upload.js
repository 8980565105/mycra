const multer = require("multer");
const path = require("path");
const fs = require("fs");
const uploadPath = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/webp"];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPEG, PNG and WEBP files are allowed"));
  }
};

const baseUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, 
});

const upload = {
  single: (fieldName) => baseUpload.single(fieldName),
  array: (fieldName, maxCount = 20) => baseUpload.array(fieldName, maxCount),
  fields: (fieldsArray) => baseUpload.fields(fieldsArray),
};

module.exports = upload;
