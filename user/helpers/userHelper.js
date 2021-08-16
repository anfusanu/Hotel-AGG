const bcrypt = require("bcrypt");
const Razorpay = require("razorpay");

const User = require("../models/User");
const Admin = require("../models/Admin");
const Portal = require("../models/Portal");
const RoomService = require("../models/portalRoomService");
const Order = require("../models/Order");
const { resolve } = require("path");

var instance = new Razorpay({
  key_id: process.env.RAZOR_ID,
  key_secret: process.env.RAZOR_SECRET,
});

module.exports = {
  getUserDetails: (tagId) =>
    new Promise(async (resolve, reject) => {
      let userDetails = await User.findById(tagId).lean();
      delete userDetails.passKey;
      if (userDetails) resolve(userDetails);
      else reject(false);
    }),

  getUserProfile: (tagId) => new Promise(async (resolve, reject) => {
    let aggDetails = {}
    aggDetails.userDetails = await User.findById(tagId).lean();
    delete aggDetails.userDetails.passKey;
    aggDetails.orderHistory = await Order.find({userId : tagId}).lean();
    if (aggDetails) resolve(aggDetails);
    else reject(false);
  }),

  updateProfile: (tagId,formData) => new Promise(async (resolve, reject) => {

  let userUpdate = await User.updateOne({_id : tagId}, {$set: formData})
  if (userUpdate) resolve({isSuccess:true})
  else resolve({isSuccess:false})
  }),

  updatePassword: (tagId,formData) => new Promise(async (resolve, reject) => {
    let userDetails = await User.findById(tagId).lean()

    bcrypt.compare(formData.passKey, userDetails.passKey)
    .then(isMatch => {
      if (!isMatch) reject({isMatch, message: "Wrong password"})
      else {
        bcrypt.hash(formData.newPassKey,10)
        .then( async(hash) => {
          let updateUser = await User.updateOne({_id : tagId},{$set : {passKey : hash}})
          if (updateUser) resolve({isMatch})
          else reject({isMatch:false,message:'Error updating password'})
        })
      }
    }).catch(err => reject({isMatch:false,message:'Error updating password'}))

  }),

  orderPlace: (formData) =>
    new Promise(async (resolve, reject) => {
      const { roomId, guestQty, dateFrom, dateTo, tagId } = formData;
      let roomDetails = await RoomService.findById(roomId).lean();
      let reserveDays =
        Math.round(
          (new Date(dateTo) - new Date(dateFrom)) / (1000 * 60 * 60 * 24)
        ) + 1;
      let totalAmount = roomDetails.roomPrice * reserveDays;

      if (formData.paymentMethod === "COD") formData.paymentStatus = "Pending";
      else formData.paymentStatus = "Placed";

      let newOrder = new Order({
        userId: tagId,
        portalId: roomDetails.portalId,
        roomId: roomDetails._id,

        guestInfo: {
          guestName: `${formData.firstName} ${formData.lastName}`,
          guestPhone: formData.userPhone,
          guestEmail: formData.userEmail,
        },
        paymentMethod: formData.paymentMethod,
        paymentStatus: formData.paymentStatus,
        orderStatus: "Waiting",
        totalAmount,
        dateCheckIn: new Date(dateFrom),
        dateCheckOut: new Date(dateTo),
      });

      newOrder
        .save()
        .then(async (insertedData) => {
          let bookingDetails = {
            _id: insertedData._id,
            user: tagId,
            bookingStart: new Date(dateFrom),
            bookingEnd: new Date(dateTo),
            duration: reserveDays,
            purpose: formData.purpose,
            roomId: roomId,
          };
          await RoomService.updateOne(
            { _id: roomId },
            { $push: { bookings: bookingDetails } }
          );
          resolve({
            isSuccess: true,
            orderId: insertedData._id,
            paymentMethod: insertedData.paymentMethod,
            paymentStatus: insertedData.paymentStatus,
            totalAmount: insertedData.totalAmount,
          });
        })
        .catch((err) =>
          reject({
            isSuccess: false,
            message: "Order error",
            err,
          })
        );
    }),

  getOrderDetail: (orderId) =>
    new Promise(async (resolve, reject) => {
      let orderDetail = await Order.findById(orderId).lean();
      if (orderDetail) resolve(orderDetail);
      else reject(false);
    }),

  generateRazorPay: (orderId, totalAmount) =>
    new Promise((resolve, reject) => {
      var options = {
        amount: totalAmount * 100,
        currency: "INR",
        receipt: `${orderId}`,
      };
      instance.orders.create(options, function (err, order) {
        if (err) reject(err);
        else resolve(order);
      });
    }),

  changePaymentStatus: (orderId) =>
    new Promise(async (resolve, reject) => {
      let updateOrder = await Order.updateOne(
        { _id: orderId },
        { $set: { paymentStatus: "Success" } }
      );
      if (updateOrder) resolve(true);
      else reject(false);
    }),

  verifyPayment: (details) =>
    new Promise((resolve, reject) => {
      const crypto = require("crypto");
      var hmac = crypto.createHmac("sha256", process.env.RAZOR_SECRET);

      hmac.update(
        details.payment.razorpay_order_id +
          "|" +
          details.payment.razorpay_payment_id
      );
      hmac = hmac.digest("hex");

      if (hmac == details.payment.razorpay_signature) resolve(true);
      else reject(false);
    }),

  paymentAborted: (orderId) =>
    new Promise(async (resolve, reject) => {
      let deleteOrder = await Order.deleteOne({ _id: orderId });
      if (deleteOrder) resolve(true);
      else reject(false);
    }),

  getUserOrderList: (tagId) =>
    new Promise(async (resolve, reject) => {
      let orderList = await Order.find({ _id: tagId }).lean();
      if (orderList) resolve(orderList);
      else reject(false);
    }),

  getInvoice : (orderId) => new Promise(async(resolve,reject) => {
    let aggDetails = {}
    aggDetails.orderDetails = await Order.findById(orderId).lean()
    aggDetails.portalDetails = await Portal.findById(aggDetails.orderDetails.portalId).lean()
    if(aggDetails.orderDetails.roomId)
      aggDetails.roomDetails = await RoomService.findById(aggDetails.orderDetails.roomId).lean()
    // if(aggDetails.orderDetails.eventId)
    // aggDetails.roomDetails = await EventService.findById(aggDetails.orderDetails.eventId).lean()

    resolve(aggDetails)

  }),

  orderCancel: (tagId, orderId) =>
    new Promise(async (resolve, reject) => {
      var findQuery = { _id: orderId, userId: tagId };

      let userOrder = await Order.findOne(findQuery).lean();

      if (userOrder) {
        if (userOrder.paymentMethod == "COD")
          updateQuery = {
            $set: { orderStatus: "Cancelled", paymentStatus: "Cancelled" },
          };
        else
          updateQuery = {
            $set: { orderStatus: "Cancelled", paymentStatus: "Refund" },
          };

        let roomUpdate = await RoomService.updateOne(
          { _id: userOrder.roomId },
          { $pull: { bookings: { $elemMatch: { _id: orderId } } } }
        );

        let orderUpdate = await Order.updateOne(findQuery, updateQuery);

        if (roomUpdate && orderUpdate) resolve(true);
        else reject(false);
      }
    }),
};
