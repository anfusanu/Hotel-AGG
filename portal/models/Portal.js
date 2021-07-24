const mongoose = require('mongoose')

const portalSchema = new mongoose.Schema(
  {
    hotelName: {
      type: String,
      trim: true,
      required: true,
      unique: 32,
    },
    hotelLocation: {
      type: String,
      required: true,
    },
    
    hotelRating: {
      type: Number,
    },
    hotelStatus: {
      type: String,
      required: true,
    },
    hotelDescription: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);


module.exports = mongoose.model("Portal", portalSchema);