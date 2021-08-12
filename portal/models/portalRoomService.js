const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bookingSchema = new Schema({
  _bookingId: Schema.Types.ObjectId,
  user: { type: Schema.ObjectId, ref: "User" },
  bookingStart: Date,
  bookingEnd: Date,
  duration: Number,
  purpose: { type: String, required: true },
  roomId: { type: Schema.Types.ObjectId, ref: "portalRoomService" },
});

const portalRoomServiceSchema = new Schema(
  {
    portalId: mongoose.ObjectId,

    roomTitle: String,
    roomImages: Array,
    maxOccupancy: Number,
    roomFeatureType: String,
    roomPrivacyType: String,
    roomPrice: Number,
    roomOffer: Number,
    extraBed: Number,
    roomQty: Number,
    roomDescription: String,
    assets: Array,
    isAvailable: Boolean,
    bookings: [bookingSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("portalRoomService", portalRoomServiceSchema);
