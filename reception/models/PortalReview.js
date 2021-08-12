const mongoose = require("mongoose");

const PortalReviewSchema = new mongoose.Schema(
  {
    hotelId: {
      type: String,
      required: true,
    },
   
    hotelReview: [{}]
  },
  { timestamps: true }
);

module.exports = mongoose.model("PortalReview", PortalReviewSchema);
