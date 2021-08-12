const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
  {
    adminEmail: {
      type: String,
      trim: true,
      required: true,
      unique: 32,
    },
    passKey: {
      type: String,
      required: true,
    },
    userRole: {
      type: Number,
      required: true,
    },
    userStatus: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Admin", adminSchema);
