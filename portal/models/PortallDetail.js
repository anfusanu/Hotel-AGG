const mongoose = require('mongoose')

const portalDetailSchema = new mongoose.Schema(
  {
    hotelId: {
      type: String,
      required: true,
    },
    hotelRooms: [{}],
    hotelEvents: [{}],
    hotelFoodMenu: [{}]
    
  
  },
  { timestamps: true }
);


module.exports = mongoose.model("PortalDetail", portalDetailsSchema);