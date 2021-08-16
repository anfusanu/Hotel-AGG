const bcrypt = require("bcrypt");
const Portal = require("../models/Portal");
const portalRequest = require("../models/PortalRequest");
const Admin = require("../models/Admin");
const RoomService = require("../models/portalRoomService");
const FoodService = require("../models/portalFoodService");
const EventService = require("../models/portalEventService");
const Reception = require("../models/Reception");
const portalFoodService = require("../models/portalFoodService");
const Order = require("../models/Order")

// const Service = require("../models/portalService");

module.exports = {
  login: (formCred) => {
    return new Promise(async (resolve, reject) => {
   
      Reception.findOne({
        portalEmail: formCred.portalEmail,
        userName: formCred.userName,
      }).then((dbUser) => {
        if (!dbUser) reject({ isMatch: false, message: "User doesn't exist" });
        else {
          bcrypt.compare(formCred.passKey, dbUser.passKey).then((isMatch) => {
            if (!isMatch)
              reject({ isMatch, message: "User or Password is invalid" });
            else
              resolve({
                isMatch,
                userId: dbUser._id,
                portalId: dbUser.portalId,
                portalEmail: dbUser.portalEmail,
              });
          });
        }
      });
    });
  },

  getServiceDetails: (portalId) => new Promise(async (resolve,reject)=>{
    let aggDetails = {}
    portalDetails = await Portal.findById(portalId).lean()
    aggDetails.roomServices = await RoomService.find({portalId}).lean()

    if (portalDetails.services.eventService)
    aggDetails.eventServices = await EventService.find({portalId}).lean()

    if(portalDetails) resolve(aggDetails)
    else reject(false)
    }),

    getOrderList: (portalId) => new Promise(async (resolve,reject) => {
      let orderList = await Order.find({portalId})
      if (orderList) resolve(orderList)
      else reject(false)
    }),

    getInvoice : (orderId) => new Promise(async(resolve,reject) => {
      let aggDetails = {}
      aggDetails.orderDetails = await Order.findById(orderId).lean()
      aggDetails.portalDetails = await Portal.findById(aggDetails.orderDetails.portalId).lean()
      if(aggDetails.orderDetails.roomId)
        aggDetails.roomDetails = await RoomService.findById(aggDetails.orderDetails.roomId).lean()
      // if(aggDetails.orderDetails.eventId)
      //   aggDetails.roomDetails = await EventService.findById(aggDetails.orderDetails.eventId).lean()
      
      resolve(aggDetails)
  
    }),

};
