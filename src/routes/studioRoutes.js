const { Router } = require("express");
const mongoose = require("mongoose");
const Booking = require("../models/Booking");
const requireAuth = require("../middleware/requireAuth");
const Studio = require("../models/Studio");
const User = require("../models/User");
const { studioCategories } = require("../models/Studio");

const router = Router();

// Accept only web image URLs; reject other protocols before saving a listing.
function isHttpURL(value) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function studioFields(body = {}) {
  const {
    title,
    category,
    hourlyRate,
    securityDeposit,
    maxCapacity,
    location,
    imageURL,
    amenities,
    overview,
  } = body;

  if (typeof title !== "string" || !title.trim()) {
    return { error: "Please enter a title for the studio." };
  }
  if (!studioCategories.includes(category)) {
    return { error: "Please choose a valid studio category." };
  }
  if (!Number.isFinite(Number(hourlyRate)) || Number(hourlyRate) <= 0) {
    return { error: "Hourly rate must be greater than zero." };
  }
  if (
    securityDeposit !== undefined &&
    (!Number.isFinite(Number(securityDeposit)) || Number(securityDeposit) < 0)
  ) {
    return { error: "Security deposit cannot be negative." };
  }
  if (!Number.isInteger(Number(maxCapacity)) || Number(maxCapacity) < 1) {
    return { error: "Maximum capacity must be at least one." };
  }
  if (typeof location !== "string" || !location.trim()) {
    return { error: "Please enter a location." };
  }
  if (typeof imageURL !== "string" || !isHttpURL(imageURL)) {
    return { error: "Please provide a valid studio image URL." };
  }
  if (typeof overview !== "string" || !overview.trim()) {
    return { error: "Please add a studio overview." };
  }
  if (
    amenities !== undefined &&
    (!Array.isArray(amenities) ||
      amenities.some((item) => typeof item !== "string"))
  ) {
    return { error: "Amenities must be a list of text values." };
  }

  // Build a clean allow-list instead of saving arbitrary fields from the request.
  return {
    values: {
      title: title.trim(),
      category,
      hourlyRate: Number(hourlyRate),
      securityDeposit: Number(securityDeposit || 0),
      maxCapacity: Number(maxCapacity),
      location: location.trim(),
      imageURL: imageURL.trim(),
      amenities: (amenities || []).map((item) => item.trim()).filter(Boolean),
      overview: overview.trim(),
    },
  };
}

router.get("/featured", async (req, res) => {
  // The home page requests at most six highly rated, recently added spaces.
  const studios = await Studio.find()
    .sort({ rating: -1, createdAt: -1 })
    .limit(6)
    .populate("owner", "name photoURL");

  return res.json({ studios });
});

router.get("/mine", requireAuth, async (req, res) => {
  const studios = await Studio.find({ owner: req.user._id }).sort({
    createdAt: -1,
  });
  return res.json({ studios });
});

router.get("/saved", requireAuth, async (req, res) => {
  const savedIds = req.user.savedStudios || [];
  const studios = await Studio.find({ _id: { $in: savedIds } }).populate(
    "owner",
    "name photoURL",
  );
  const studiosById = new Map(
    studios.map((studio) => [studio._id.toString(), studio]),
  );

  return res.json({
    studios: savedIds
      .map((id) => studiosById.get(id.toString()))
      .filter(Boolean),
  });
});

router.get("/", async (req, res) => {
  const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(
    Math.max(Number.parseInt(req.query.limit, 10) || 12, 1),
    50,
  );
  const filter = {};

  if (req.query.category) {
    if (!studioCategories.includes(req.query.category)) {
      return res
        .status(400)
        .json({ message: "The selected studio category is not valid." });
    }
    filter.category = req.query.category;
  }

  if (typeof req.query.location === "string" && req.query.location.trim()) {
    filter.location = {
      $regex: escapeRegex(req.query.location.trim()),
      $options: "i",
    };
  }

  if (typeof req.query.search === "string" && req.query.search.trim()) {
    const search = escapeRegex(req.query.search.trim());
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { location: { $regex: search, $options: "i" } },
      { overview: { $regex: search, $options: "i" } },
    ];
  }

  // Fetch the requested page and total count together for the results summary.
  const [studios, total] = await Promise.all([
    Studio.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("owner", "name photoURL"),
    Studio.countDocuments(filter),
  ]);

  return res.json({
    studios,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

router.put("/:id/saved", requireAuth, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "The studio ID is not valid." });
  }

  const studio = await Studio.exists({ _id: req.params.id });
  if (!studio) {
    return res.status(404).json({ message: "Studio listing not found." });
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $addToSet: { savedStudios: studio._id } },
    { new: true },
  ).select("savedStudios");

  if (!user) {
    return res
      .status(401)
      .json({ message: "Your session is no longer valid." });
  }

  return res.json({
    message: "Studio saved to your wishlist.",
    savedStudios: user.savedStudios.map((id) => id.toString()),
  });
});

router.delete("/:id/saved", requireAuth, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "The studio ID is not valid." });
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $pull: { savedStudios: req.params.id } },
    { new: true },
  ).select("savedStudios");

  if (!user) {
    return res
      .status(401)
      .json({ message: "Your session is no longer valid." });
  }

  return res.json({
    message: "Studio removed from your wishlist.",
    savedStudios: user.savedStudios.map((id) => id.toString()),
  });
});

router.post("/", requireAuth, async (req, res) => {
  const result = studioFields(req.body);
  if (result.error) {
    return res.status(400).json({ message: result.error });
  }

  const studio = await Studio.create({
    ...result.values,
    // Host identity always comes from the verified session, never the form.
    owner: req.user._id,
    ownerEmail: req.user.email,
    ownerName: req.user.name,
  });

  return res.status(201).json({ message: "Studio listing created.", studio });
});

router.get("/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "The studio ID is not valid." });
  }

  const studio = await Studio.findById(req.params.id).populate(
    "owner",
    "name email photoURL",
  );
  if (!studio) {
    return res.status(404).json({ message: "Studio listing not found." });
  }

  return res.json({ studio });
});

router.patch("/:id", requireAuth, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "The studio ID is not valid." });
  }

  const result = studioFields(req.body);
  if (result.error) {
    return res.status(400).json({ message: result.error });
  }

  // Match both ID and owner so another host cannot edit this listing.
  const studio = await Studio.findOneAndUpdate(
    { _id: req.params.id, owner: req.user._id },
    result.values,
    { new: true, runValidators: true },
  );
  if (!studio) {
    const exists = await Studio.exists({ _id: req.params.id });
    return res.status(exists ? 403 : 404).json({
      message: exists
        ? "You can only edit your own studio listings."
        : "Studio listing not found.",
    });
  }

  return res.json({ message: "Studio listing updated.", studio });
});

router.delete("/:id", requireAuth, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "The studio ID is not valid." });
  }

  const studio = await Studio.findOne({
    _id: req.params.id,
    owner: req.user._id,
  });
  if (!studio) {
    const exists = await Studio.exists({ _id: req.params.id });
    return res.status(exists ? 403 : 404).json({
      message: exists
        ? "You can only delete your own studio listings."
        : "Studio listing not found.",
    });
  }

  // Preserve listings that still have a future request or confirmed reservation.
  const activeBooking = await Booking.exists({
    studio: studio._id,
    status: { $in: ["Pending", "Confirmed"] },
    endAt: { $gt: new Date() },
  });
  if (activeBooking) {
    return res.status(409).json({
      message:
        "This listing has an upcoming booking and cannot be deleted yet.",
    });
  }

  await studio.deleteOne();
  return res.json({ message: "Studio listing deleted." });
});

router.post("/:id/reviews", requireAuth, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "The studio ID is not valid." });
  }

  const rating = Number(req.body.rating);
  const comment =
    typeof req.body.comment === "string" ? req.body.comment.trim() : "";
  if (!Number.isInteger(rating) || rating < 1 || rating > 5 || !comment) {
    return res
      .status(400)
      .json({ message: "Choose a rating from 1 to 5 and write a review." });
  }

  const studio = await Studio.findById(req.params.id);
  if (!studio) {
    return res.status(404).json({ message: "Studio listing not found." });
  }

  // Only someone who completed a stay may leave one review for this studio.
  const completedBooking = await Booking.exists({
    studio: studio._id,
    renter: req.user._id,
    status: "Completed",
  });
  if (!completedBooking) {
    return res.status(403).json({
      message: "Only guests with a completed booking can review this studio.",
    });
  }
  if (studio.reviews.some((review) => review.author.equals(req.user._id))) {
    return res
      .status(409)
      .json({ message: "You have already reviewed this studio." });
  }

  studio.reviews.push({
    author: req.user._id,
    authorName: req.user.name,
    rating,
    comment,
  });
  studio.rating =
    studio.reviews.reduce((total, review) => total + review.rating, 0) /
    studio.reviews.length;
  await studio.save();

  return res
    .status(201)
    .json({ message: "Your review has been added.", studio });
});

module.exports = router;
