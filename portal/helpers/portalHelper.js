const bcrypt = require("bcrypt");
const User = require("../models/User");
const Admin = require("../models/Admin");
const Portal = require("../models/Portal");
const RoomService = require("../models/portalRoomService");
const FoodService = require("../models/portalFoodService");
const EventService = require("../models/portalEventService");
const Reception = require("../models/Reception");
const RoomOffline = require("../models/portalRoomOffline");

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
                verifiedUser: dbUser.userStatus,
                userEmail: dbUser.adminEmail,
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
                verifiedUser: dbUser.userStatus,
                userEmail: dbUser.adminEmail,
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

  updatePassword: (tagId, formData) =>
    new Promise(async (resolve, reject) => {
      let portalDetails = await Admin.findById(tagId).lean();

      bcrypt
        .compare(formData.passKey, portalDetails.passKey)
        .then((isMatch) => {
          if (!isMatch) reject({ isMatch, message: "Wrong password" });
          else {
            bcrypt.hash(formData.newPassKey, 10).then(async (hash) => {
              let updateAdmin = await Admin.updateOne(
                { _id: tagId },
                { $set: { passKey: hash } }
              );
              if (updateAdmin) resolve({ isMatch });
              else
                reject({ isMatch: false, message: "Error updating password" });
            });
          }
        })
        .catch((err) =>
          reject({ isMatch: false, message: "Error updating password" })
        );
    }),

  getReceptionList: (portalId) =>
    new Promise((resolve, reject) => {
      let receptionList = Reception.find({ portalId }).lean();
      if (receptionList) resolve(receptionList);
      else reject(false);
    }),

  addReception: (adminCred, formData) =>
    new Promise((resolve, reject) => {
      bcrypt.hash(formData.passKey, 10).then((hash) => {
        let newReception = new Reception({
          userName: formData.userName,
          passKey: hash,
          accessStatus: "Active",
          portalId: adminCred.userId,
          portalEmail: adminCred.userEmail,
        });
        console.log(newReception);
        newReception
          .save()
          .then((insertedData) => resolve(true))
          .catch((err) => reject(false));
      });
    }),

  removeReception: (portalId, userName) =>
    new Promise(async (resolve, reject) => {
      await Reception.deleteOne({ portalId, userName });
      resolve(true);
    }),

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

  deleteRoom: (tagId, roomId) =>
    new Promise(async (resolve, reject) => {
      let roomDetails = await RoomService.findOne({
        _id: roomId,
        portalId: tagId,
      }).lean();

      if (!roomDetails) reject(false);
      else {
        const remDoc = await RoomService.deleteOne({ _id: roomDetails._id });

        if (remDoc == 1) {
          imageDelete(fileName).then(async (isSuccess) => {
            await RoomService.updateOne(
              { _id: roomId },
              { $pullAll: { roomImages: [url] } }
            );
            resolve(isSuccess);
          });
        }
      }
    }),

  getRoomOfflineList: (tagId, roomId) =>
    new Promise(async (resolve, reject) => {
      let roomList = await RoomOffline.findOne({
        _id: roomId,
        portalId: tagId,
      }).lean();
      let roomDetails = await RoomService.findOne({
        _id: roomId,
        portalId: tagId,
      }).lean();
      const aggDetails = { roomList, roomDetails };
      resolve(aggDetails);
    }),
  addRoomNumber: (tagId, roomId, roomNumber) =>
    new Promise(async (resolve, reject) => {
      let roomUpdate = await RoomOffline.findOneAndUpdate(
        { _id: roomId, portalId: tagId },
        {
          $push: {
            roomList: {
              roomNumber: roomNumber,
              isAvailable: true,
              checkOut: new Date(),
            },
          },
        },
        { upsert: true, useFindAndModify: false }
      );
      if (roomUpdate) resolve(true);
      else reject(false);
    }),

  updateRoomNumber: (tagId, roomId, { roomNumber, newRoomNumber }) =>
    new Promise(async (resolve, reject) => {
      const query = { _id: roomId, "roomList.roomNumber": roomNumber };
      const updateDocument = {
        $set: { "roomList.$.roomNumber": newRoomNumber },
      };
      const roomUpdate = await RoomOffline.updateOne(query, updateDocument);

      if (roomUpdate) resolve(true);
      else reject(false);
    }),
  deleteRoomNumber: (tagId, roomId, roomNumber) =>
    new Promise(async (resolve, reject) => {
      const query = { _id: roomId, portalId: tagId };
      const updateDocument = { $pull: { roomList: { roomNumber } } };
      let roomUpdate = await RoomOffline.updateOne(query, updateDocument);

      if (roomUpdate) resolve(true);
      else reject(false);
    }),
};
