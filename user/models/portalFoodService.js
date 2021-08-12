const mongoose = require("mongoose");

const portalFoodServiceSchema = new mongoose.Schema(
  {
    portalId: mongoose.ObjectId,

    foodMenu : Array
  },
  { timestamps: true }
);

module.exports = mongoose.model("portalFoodService", portalFoodServiceSchema);
