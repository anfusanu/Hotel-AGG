const mongoose = require("mongoose");

const receptionSchema = new mongoose.Schema(
  {
    userEmail: {
      type: String,
      trim: true,
      required: true,
      unique: 32,
    },
    passKey: {
      type: String,
      required: true,
    },

    accessStatus: {
      type: String,
      required: true,
    },
    portalId: mongoose.ObjectId,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Reception", receptionSchema);
