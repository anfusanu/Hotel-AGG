const bcrypt = require("bcrypt");
const User = require("../models/User");
const Admin = require("../models/Admin");
const Portal = require("../models/Portal");
const RoomService = require("../models/portalRoomService");
const FoodService = require("../models/portalFoodService");
const EventService = require("../models/portalEventService");

const { imageDelete } = require("../helpers/s3bucket");

module.exports = {
  logIn: (formCred) => {
    return new Promise(async (resolve, reject) => {
      Admin.findOne({ adminEmail: formCred.adminEmail }).then((dbUser) => {
        console.log(dbUser);
        if (dbUser && dbUser.userRole === 1) {
          bcrypt.compare(formCred.passKey, dbUser.passKey).then((isMatch) => {
            if (isMatch)
              resolve({
                isMatch,
                userId: dbUser._id,
                userStatus: dbUser.userStatus,
              });
            else reject({ isMatch, message: "User or Password is invalid" });
          });
        } else reject({ isMatch: false, message: "User doesn't exist" });
      });
    });
  },

  signUp: (formCred) => {
    return new Promise(async (resolve, reject) => {
      bcrypt
        .hash(formCred.passKey, 10)
        .then((hash) => {
          formCred.passKey = hash;
          formCred.userRole = 1;
          formCred.userStatus = "Pending";
          const admin = new Admin(formCred);
          admin
            .save()
            .then((dbUser) => {
              resolve({
                isMatch: true,
                userId: dbUser._id,
                userStatus: dbUser.userStatus,
              });
            })
            .catch((err) => {
              console.log(err);
              reject({
                isMatch: false,
                message:
                  "Check the credentials you have provided. You cannot signup if you are already a member",
              });
            });
        })
        .catch((err) => console.log(err));
    });
  },

  portalStatusChanger: async (tagId) => {
    let requestedPortalDetail = await Portal.findById(tagId);
    if (!requestedPortalDetail)
      reject({ isSuccess: false, message: "Internal Error" });
    let statusChange = null;
    if (requestedPortalDetail.portalStatus === "Active")
      statusChange = "Inactive";
    else statusChange = "Active";

    if (!statusChange)
      reject({ isSuccess: false, message: "Contact admin ASAP.." });
    else {
      await Portal.updateOne({ _id: tagId }, { portalStatus: statusChange });
      resolve({ isSuccess: true });
    }
  },
  getPortalDetail: (tagId) => {
    return new Promise(async (resolve, reject) => {
      let requestedPortalDetail = await Portal.findById(tagId);
      if (requestedPortalDetail) resolve(requestedPortalDetail);
      else reject(false);
    });
  },
  getServiceList: (tagId, services) => {
    return new Promise(async (resolve, reject) => {
      let serviceList = {};
      if (services.roomService)
        serviceList.roomServices = await RoomService.find({
          portalId: tagId,
        }).lean();
      if (services.eventService)
        serviceList.eventServices = await EventService.find({
          portalId: tagId,
        }).lean();
      if (services.foodService)
        serviceList.foodServices = await FoodService.find({
          portalId: tagId,
        }).lean();

      if (serviceList) resolve(serviceList);
      else reject(false);
    });
  },
  addRoomService: (tagId, roomForm) =>
    new Promise(async (resolve, reject) => {
      roomForm.portalId = tagId;
      roomForm.isAvailable = true;
      roomForm.dateAvailable = new Date();
      let newRoom = new RoomService(roomForm);
      newRoom.save((err, saved) => {
        if (err) reject(err);
        resolve(saved);
      });
    }),
  getRoomService: (tagId, roomId) =>
    new Promise(async (resolve, reject) => {
      let roomDetails = await RoomService.findOne({
        _id: roomId,
        portalId: tagId,
      }).lean();
      if (roomDetails) resolve(roomDetails);
      else reject(false);
    }),
  updateRoomService: (tagId, roomId, roomForm) =>
    new Promise(async (resolve, reject) => {
      let roomDetails = await RoomService.updateOne(
        { _id: roomId, portalId: tagId },
        roomForm
      );
      if (roomDetails) resolve(roomDetails);
      else reject(false);
    }),
  deleteRoomImage: (tagId, { roomId, fileName, url }) =>
    new Promise(async (resolve, reject) => {
      let roomDetails = await RoomService.findOne({
        _id: roomId,
        portalId: tagId,
      }).lean();

      if (!roomDetails) reject(false);
      else {
        imageDelete(fileName).then(async (isSuccess) => {
          await RoomService.updateOne(
            { _id: roomId },
            { $pullAll: { roomImages: [url] } }
          );
          resolve(isSuccess);
        });
      }
    }),
};
