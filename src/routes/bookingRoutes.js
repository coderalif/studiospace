const { Router } = require("express");
const mongoose = require("mongoose");
const Booking = require("../models/Booking");
const requireAuth = require("../middleware/requireAuth");
const Studio = require("../models/Studio");

const router = Router();
router.use(requireAuth);

function validDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

// Two intervals overlap when each one begins before the other one ends.
async function findConfirmedOverlap(studioId, startAt, endAt, ignoredBookingId) {
  const filter = {
    studio: studioId,
    status: "Confirmed",
    startAt: { $lt: endAt },
    endAt: { $gt: startAt },
  };

  if (ignoredBookingId) {
    filter._id = { $ne: ignoredBookingId };
  }

  return Booking.exists(filter);
}

router.post("/", async (req, res) => {
  const { studioId, startAt: startValue, endAt: endValue, guestCount: guestCountValue } = req.body;

  if (!mongoose.isValidObjectId(studioId)) {
    return res.status(400).json({ message: "Choose a valid studio." });
  }

  const startAt = validDate(startValue);
  const endAt = validDate(endValue);
  const guestCount = Number(guestCountValue);
  if (!startAt || !endAt || startAt <= new Date() || endAt <= startAt) {
    return res.status(400).json({ message: "Choose a valid future start and end time." });
  }
  if (!Number.isInteger(guestCount) || guestCount < 1) {
    return res.status(400).json({ message: "Guest count must be at least one." });
  }

  const studio = await Studio.findById(studioId);
  if (!studio) {
    return res.status(404).json({ message: "Studio listing not found." });
  }
  if (studio.owner.equals(req.user._id)) {
    return res.status(400).json({ message: "You cannot book your own studio." });
  }
  if (guestCount > studio.maxCapacity) {
    return res.status(400).json({ message: "Guest count exceeds this studio's maximum capacity." });
  }

  // Pending requests do not reserve a time; only confirmed bookings block it.
  const overlap = await findConfirmedOverlap(studio._id, startAt, endAt);
  if (overlap) {
    return res.status(409).json({
      message: "This time overlaps an existing confirmed booking. Please choose another time.",
    });
  }

  const hours = (endAt.getTime() - startAt.getTime()) / (60 * 60 * 1000);
  const totalPrice = Math.round(hours * studio.hourlyRate * 100) / 100;
  const booking = await Booking.create({
    studio: studio._id,
    studioTitle: studio.title,
    renter: req.user._id,
    renterEmail: req.user.email,
    startAt,
    endAt,
    guestCount,
    totalPrice,
    status: "Pending",
  });

  return res.status(201).json({ message: "Booking request created.", booking });
});

router.get("/host", async (req, res) => {
  // Hosts see requests only for studios they own.
  const ownedStudios = await Studio.find({ owner: req.user._id }).select("_id");
  const bookings = await Booking.find({ studio: { $in: ownedStudios.map((studio) => studio._id) } })
    .sort({ createdAt: -1 })
    .populate("studio", "title category imageURL location")
    .populate("renter", "name email photoURL");

  return res.json({ bookings });
});

router.get("/mine", async (req, res) => {
  const bookings = await Booking.find({ renter: req.user._id })
    .sort({ createdAt: -1 })
    .populate("studio", "title category imageURL location owner");

  return res.json({ bookings });
});

router.patch("/:id/status", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "The booking ID is not valid." });
  }

  const booking = await Booking.findById(req.params.id);
  if (!booking) {
    return res.status(404).json({ message: "Booking not found." });
  }

  const studio = await Studio.findById(booking.studio);
  if (!studio || !studio.owner.equals(req.user._id)) {
    return res.status(403).json({ message: "Only the studio host can update this booking." });
  }

  const { status } = req.body;
  // Limit status changes to the booking's next valid step.
  const allowedTransitions = {
    Pending: ["Confirmed", "Cancelled"],
    Confirmed: ["Completed", "Cancelled"],
  };
  if (!allowedTransitions[booking.status]?.includes(status)) {
    return res.status(400).json({ message: "That booking status change is not allowed." });
  }

  if (status === "Confirmed") {
    const overlap = await findConfirmedOverlap(
      booking.studio,
      booking.startAt,
      booking.endAt,
      booking._id,
    );
    if (overlap) {
      return res.status(409).json({
        message: "Another confirmed booking already uses this time slot.",
      });
    }
  }
  if (status === "Completed" && booking.endAt > new Date()) {
    return res.status(400).json({ message: "A booking can only be completed after its end time." });
  }

  booking.status = status;
  await booking.save();
  return res.json({ message: `Booking status changed to ${status}.`, booking });
});

router.patch("/:id/cancel", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "The booking ID is not valid." });
  }

  const booking = await Booking.findOne({ _id: req.params.id, renter: req.user._id });
  if (!booking) {
    return res.status(404).json({ message: "Booking not found." });
  }
  if (booking.status !== "Pending") {
    return res.status(409).json({ message: "Only pending bookings can be cancelled by the guest." });
  }

  // Guests may cancel their own pending request, but not a confirmed booking.
  booking.status = "Cancelled";
  await booking.save();
  return res.json({ message: "Booking cancelled.", booking });
});

module.exports = router;
