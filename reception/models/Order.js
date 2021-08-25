const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    userId: mongoose.ObjectId,
    portalId: mongoose.ObjectId,
    roomId: mongoose.ObjectId,

    guestInfo: {
      guestName : String,
      guestPhone: String,
      guestEmail : String,
      guestQty: Number,
      purpose: String
    },
    paymentMethod: {
      type: String,
      trim: true,
      required: true,
      maxlength: 32,
    },
    paymentStatus: {
      type: String,
      trim: true,
      required: true,
      maxlength: 32,
    },

    orderStatus: {
      type: String,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    dateCheckIn: {
      type: Date,
      required: true,
    },
    dateCheckOut: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
