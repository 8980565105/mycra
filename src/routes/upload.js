const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");
const upload = require("../middlewares/upload");

router.post("/image", upload.array("image", 20), async (req, res) => {
  try {
    const files = req.files && req.files.length > 0 ? req.files : (req.file ? [req.file] : []);

    if (files.length === 0) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const uploadDir = path.join(process.cwd(), "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const processedFiles = await Promise.all(
      files.map(async (file) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const filename = `${file.fieldname || "image"}-${uniqueSuffix}.webp`;
        const outputPath = path.join(uploadDir, filename);

        await sharp(file.buffer)
          .webp({ quality: 80 })
          .toFile(outputPath);

        return `/uploads/${filename}`;
      })
    );

    if (processedFiles.length === 1) {
      return res.json({
        success: true,
        data: {
          image_url: processedFiles[0],
        },
      });
    }

    return res.json({
      success: true,
      data: processedFiles.map((url) => ({ image_url: url })),
    });
  } catch (err) {
    console.error("WebP Conversion Error:", err);
    res.status(500).json({ success: false, message: err.message || "Failed to process image" });
  }
});

const deleteHandler = (req, res) => {
  try {
    const imageUrl =
      req.body?.imageUrl ||
      req.body?.url ||
      req.body?.filename ||
      req.query?.imageUrl ||
      req.query?.url ||
      req.query?.filename;

    if (!imageUrl) {
      return res
        .status(400)
        .json({ success: false, message: "Filename or imageUrl is required" });
    }

    const safeFilename = path.basename(imageUrl.split("?")[0]);
    const filePath = path.join(process.cwd(), "uploads", safeFilename);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return res.json({
        success: true,
        message: "File deleted successfully from server uploads folder",
      });
    } else {
      return res.json({
        success: true,
        message: "File not found or already deleted from server",
      });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

router.delete("/delete", deleteHandler);
router.post("/delete", deleteHandler);

module.exports = router;
