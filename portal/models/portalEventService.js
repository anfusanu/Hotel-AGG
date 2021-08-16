const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bookingSchema = new Schema({
  _bookingId: Schema.Types.ObjectId,
  user: { type: Schema.ObjectId, ref: "User" },
  bookingStart: Date,
  bookingEnd: Date,
  duration: Number,
  purpose: { type: String, required: true },
  roomId: { type: Schema.Types.ObjectId, ref: "portalEventService" },
});

const portalEventServiceSchema = new Schema(
  {
    portalId: mongoose.ObjectId,

    hallTitle: String,
    hallImages: Array,
    maxOccupancy: Number,
    hallFeatureType: String,
    hallPrice: Number,
    hallOffer: Number,
    hallDescription: String,
    assets: Array,
    isAvailable: Boolean,
    bookings: [bookingSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("portalEventService", portalEventServiceSchema);
