const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    studio: { type: mongoose.Schema.Types.ObjectId, ref: "Studio", required: true },
    studioTitle: { type: String, required: true, trim: true },
    renter: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    renterEmail: { type: String, required: true, lowercase: true, trim: true },
    startAt: { type: Date, required: true },
    endAt: { type: Date, required: true },
    guestCount: { type: Number, required: true, min: 1 },
    totalPrice: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Completed", "Cancelled"],
      default: "Pending",
    },
  },
  { timestamps: true },
);

bookingSchema.index({ studio: 1, status: 1, startAt: 1, endAt: 1 });
bookingSchema.index({ renter: 1, createdAt: -1 });

module.exports = mongoose.model("Booking", bookingSchema);
