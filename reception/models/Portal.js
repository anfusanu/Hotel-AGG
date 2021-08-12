const mongoose = require("mongoose");

const portalSchema = new mongoose.Schema(
  {
    _id: mongoose.ObjectId,

    firstName: {
      type: String,
      trim: true,
      required: true,
      maxlength: 32,
    },
    lastName: {
      type: String,
      trim: true,
      required: true,
      maxlength: 32,
    },
    portalTitle: {
      type: String,
      trim: true,
      required: true,
      maxlength: 32,
    },
    portalTag: {
      type: String,
    },
    spaceType: {
      type: String,
      required: true,
    },
    spacePrivacy: {
      type: String,
      required: true,
    },
    userBio: {
      type: String,
      trim: true,
      required: true,
    },
    portalBio: {
      type: String,
      trim: true,
      required: true,
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    portalAddress: {
      place: {
        type: String,
        trim: true,
        required: true,
      },
      address: {
        type: String,
        trim: true,
        required: true,
      },
      district: {
        type: String,
        trim: true,
        required: true,
      },
      state: {
        type: String,
        trim: true,
        required: true,
      },
      pincode: {
        type: String,
        trim: true,
        required: true,
      },
    },
    portalStatus: {
      type: String,
      default: "Inactive",
    },
    services:{
      roomService: Boolean,
      foodService: Boolean,
      eventService: Boolean,
    },
    portalImages : Array

  },
  { timestamps: true }
);
portalSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Portal", portalSchema);
