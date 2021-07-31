const mongoose = require("mongoose");

const portalServiceSchema = new mongoose.Schema(
  {
    _id: mongoose.ObjectId,

    hotelRooms: Array,

    hotelEvents: Array,

    hotelFoodMenu: Array,
  },
  { timestamps: true }
);

module.exports = mongoose.model("PortalService", portalServiceSchema);
