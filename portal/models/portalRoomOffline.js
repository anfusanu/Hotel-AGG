const mongoose = require("mongoose");

const portalRoomOfflineSchema = new mongoose.Schema(
  {
    portalId: mongoose.ObjectId,
    roomId : mongoose.ObjectId,
    roomList : Array
  },
  { timestamps: true }
);

module.exports = mongoose.model("portalRoomOffline", portalRoomOfflineSchema);
