const { Router } = require("express");
const multer = require("multer");
const requireAuth = require("../middleware/requireAuth");

const router = Router();

// Keep uploads in memory only long enough to forward them to the image host.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter(req, file, callback) {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/avif",
    ];
    if (!allowedTypes.includes(file.mimetype)) {
      const error = new Error("Use a JPG, PNG, WebP, or AVIF image.");
      error.status = 400;
      return callback(error);
    }
    return callback(null, true);
  },
});

router.post("/", requireAuth, upload.single("image"), async (req, res) => {
  const apiKey =
    process.env.IMGBB_API_KEY || "6eb974a954c5f43ec188694763ce0346";

  if (!apiKey) {
    return res
      .status(503)
      .json({ message: "Image uploads are not configured yet." });
  }
  if (!req.file) {
    return res.status(400).json({ message: "Choose an image to upload." });
  }

  // ImgBB expects the image bytes as base64 in a form-encoded request.
  const form = new URLSearchParams();
  form.set("image", req.file.buffer.toString("base64"));
  const response = await fetch(
    `https://api.imgbb.com/1/upload?key=${encodeURIComponent(apiKey)}`,
    { method: "POST", body: form },
  );
  const result = await response.json();

  if (!response.ok || !result.success || !result.data?.url) {
    return res
      .status(502)
      .json({ message: "The image host could not upload this image." });
  }

  return res.status(201).json({ imageURL: result.data.url });
});

module.exports = router;
