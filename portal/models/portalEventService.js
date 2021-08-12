const mongoose = require("mongoose");

const portalEventServiceSchema = new mongoose.Schema(
  {
    portalId: mongoose.ObjectId,

    eventTitle: String,
    maxOccupancy: Number,
    eventFacilityType: String,
    eventFeatureType: String,
    eventPrivacyType : String,
    eventPrice: Number,
    eventOffer: Number,
    eventDescription: String,
    isAvailable: Boolean,

  },
  { timestamps: true }
);

module.exports = mongoose.model("portalEventService", portalEventServiceSchema);
