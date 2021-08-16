const mongoose = require("mongoose");

const receptionSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      trim: true,
      required: true,
      unique: 32,
    },
    passKey: {
      type: String,
      required: true,
    },

    portalId: mongoose.ObjectId,
    portalEmail: {
      type: String,
      required: true
    },
    accessStatus: {
      type: String,
      required: true,
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Reception", receptionSchema);
