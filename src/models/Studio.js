const mongoose = require("mongoose");

const studioCategories = [
  "Photo Studio",
  "Film Stage",
  "Podcast Lounge",
  "Music Suite",
  "Workshop",
  "Art Workshop",
];

const reviewSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    authorName: { type: String, required: true, trim: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true, maxlength: 1000 },
  },
  { timestamps: true },
);

const studioSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    category: { type: String, required: true, enum: studioCategories },
    hourlyRate: { type: Number, required: true, min: 1 },
    securityDeposit: { type: Number, default: 0, min: 0 },
    maxCapacity: { type: Number, required: true, min: 1 },
    location: { type: String, required: true, trim: true, maxlength: 200 },
    imageURL: { type: String, required: true, trim: true },
    amenities: { type: [String], default: [] },
    overview: { type: String, required: true, trim: true, maxlength: 5000 },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    ownerEmail: { type: String, required: true, lowercase: true, trim: true },
    ownerName: { type: String, required: true, trim: true },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviews: { type: [reviewSchema], default: [] },
  },
  { timestamps: true },
);

studioSchema.index({ category: 1, location: 1 });
studioSchema.index({ title: "text", location: "text", overview: "text" });

module.exports = mongoose.model("Studio", studioSchema);
module.exports.studioCategories = studioCategories;
