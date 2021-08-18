const bcrypt = require("bcrypt");
const Portal = require("../models/Portal");
const portalRequest = require("../models/PortalRequest");
const Admin = require("../models/Admin");
const RoomService = require("../models/portalRoomService");
const FoodService = require("../models/portalFoodService");
const EventService = require("../models/portalEventService");
const Reception = require("../models/Reception");
const portalFoodService = require("../models/portalFoodService");
const Order = require("../models/Order");
const RoomOffline = require("../models/portalRoomOffline");

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

  getServiceDetails: (portalId) =>
    new Promise(async (resolve, reject) => {
      let aggDetails = {};
      portalDetails = await Portal.findById(portalId).lean();
      aggDetails.roomServices = await RoomService.find({ portalId }).lean();

      if (portalDetails.services.eventService)
        aggDetails.eventServices = await EventService.find({ portalId }).lean();

      if (portalDetails) resolve(aggDetails);
      else reject(false);
    }),

  getOrderList: (portalId, query) =>
    new Promise(async (resolve, reject) => {
      let findQuery = { portalId };
      let selectDate = new Date();
      selectDate.setHours(0, 0, 0, 0);
      if (query.days)
        findQuery.dateCheckIn = {
          $gt: new Date(selectDate),
          $lte: new Date(selectDate + query.days * 60 * 60 * 24 * 1000),
        };
      console.log(findQuery);

      if (query.select == "Cancelled") findQuery.orderStatus = "Cancelled";
      else if (query.select == "Missed")
        findQuery.dateCheckIn = {
          $lt: new Date(selectDate + 60 * 60 * 24 * 1000),
        };
      console.log(findQuery);
      console.log(query);
      let orderList = await Order.find(findQuery).sort({ dateCheckIn: 1 });
      if (orderList) resolve(orderList);
      else reject(false);
    }),

  getOrderListToday: (portalId, query) =>
    new Promise(async (resolve, reject) => {
      let findQuery = { portalId, orderStatus: "Waiting" };
      let selectDate = new Date();
      selectDate.setHours(0, 0, 0, 0);

      findQuery.dateCheckIn = {
        $gte: new Date(selectDate),
        $lte: new Date(selectDate + 60 * 60 * 24 * 1000),
      };
      let orderList = await Order.find(findQuery).sort({ dateCheckIn: 1 });
      if (orderList) resolve(orderList);
      else reject(false);
    }),

  getInvoice: (orderId, portalId) =>
    new Promise(async (resolve, reject) => {
      let aggDetails = {};
      aggDetails.orderDetails = await Order.findById(orderId).lean();
      aggDetails.portalDetails = await Portal.findById(
        aggDetails.orderDetails.portalId
      ).lean();
      if (aggDetails.orderDetails.roomId)
        aggDetails.roomDetails = await RoomService.findById(
          aggDetails.orderDetails.roomId
        ).lean();
      // if(aggDetails.orderDetails.eventId)
      //   aggDetails.roomDetails = await EventService.findById(aggDetails.orderDetails.eventId).lean()

      resolve(aggDetails);
    }),

  orderCancel: (portalId, orderId) =>
    new Promise(async (resolve, reject) => {
      var findQuery = { _id: orderId, portalId: portalId };

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

  getRoomOfflineList: (portalId, roomId) =>
    new Promise(async (resolve, reject) => {
      let roomList = await RoomOffline.findOne({
        _id: roomId,
        portalId: portalId,
      }).lean();
      let roomDetails = await RoomService.findOne({
        _id: roomId,
        portalId: portalId,
      }).lean();
      const aggDetails = { roomList, roomDetails };
      if (roomList) resolve(aggDetails);
      else reject(false);
    }),

  bookRoomOffline: (portalId, orderCred) =>
    new Promise(async (resolve, reject) => {
      let roomDetails = await RoomService.findById(orderCred.roomId).lean();
      let selectDate = new Date();
      selectDate.setHours(0, 0, 0, 0);
      let reserveDays =
        Math.round(
          (new Date(orderCred.dateTo) - new Date(selectDate)) /
            (1000 * 60 * 60 * 24)
        ) + 1;
      let totalAmount = roomDetails.roomPrice * reserveDays;

      let newOrder = new Order({
        userId: portalId,
        portalId: portalId,
        roomId: roomDetails._id,

        guestInfo: {
          guestName: orderCred.guestName,
          guestPhone: orderCred.guestPhone,
          guestEmail: orderCred.guestEmail,
        },
        paymentMethod: "COD",
        paymentStatus: "Success",
        orderStatus: "Success",
        totalAmount,
        dateCheckIn: new Date(selectDate),
        dateCheckOut: new Date(orderCred.dateTo),
      });
      newOrder
        .save()
        .then(async (insertedData) => {
          let bookingDetails = {
            _id: insertedData._id,
            user: portalId,
            bookingStart: new Date(dateFrom),
            bookingEnd: new Date(orderCred.dateTo),
            duration: reserveDays,
            purpose: orderCred.purpose,
            roomId: orderCred.roomId,
          };
          let newRoomBooking = await RoomService.updateOne(
            { _id: orderCred.roomId },
            { $push: { bookings: bookingDetails } }
          );
          let newOfflineRoom = await RoomOffline.updateOne(
            { _id: orderCred.roomId, "roomList.roomNumber": orderCred.roomNumber },
            {
              $set: {
                "roomList.$.isAvailable": false,
                "roomList.$.orderId": insertedData._id,
              },
            }
          );

          console.log(newRoomBooking)
          console.log(newOfflineRoom)
          resolve({
            isSuccess: true,
            orderId: insertedData._id,
            paymentMethod: insertedData.paymentMethod,
            paymentStatus: insertedData.paymentStatus,
            totalAmount: insertedData.totalAmount,
          });
        })
        .catch((err) => {
          console.log(newOrder);
          reject({
            isSuccess: false,
            message: "Order error",
            err,
          });
        });
    }),

  reserveRoomOffline: (portalId, orderCred) =>
    new Promise(async (resolve, reject) => {
      const { roomId, dateFrom, dateTo } = orderCred;
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

  checkInUser: (portalId, orderCred) =>
    new Promise(async (resolve, reject) => {
      const { orderId, roomId, roomNumber } = orderCred;

      updateQuery = {
        $set: { orderStatus: "Success", paymentStatus: "Success" },
      };

      let orderUpdate = await Order.updateOne({ _id: orderId }, updateQuery);

      let offlineRoomUpdate = await RoomOffline.updateOne(
        { _id: roomId, "roomList.roomNumber": roomNumber },
        {
          $set: {
            "roomList.$.isAvailable": false,
            "roomList.$.orderId": orderId,
          },
        }
      );

      if (offlineRoomUpdate) resolve({ isSuccess: true });
      else reject({ isSuccess: false });
    }),

  checkOutUser: (tagId, orderId) =>
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
