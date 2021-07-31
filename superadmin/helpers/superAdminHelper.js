const bcrypt = require("bcrypt");
const Portal = require("../models/Portal");
const portalRequest = require("../models/PortalRequest");
const Admin = require("../models/Admin");
const Service = require("../models/portalService");

module.exports = {
  login: (formCred) => {
    return new Promise(async (resolve, reject) => {
      Admin.findOne({ adminEmail: formCred.adminEmail }).then((dbUser) => {
        if (dbUser && dbUser.userRole === 0) {
          bcrypt.compare(formCred.passKey, dbUser.passKey).then((isMatch) => {
            if (isMatch) resolve({ isMatch, userId: dbUser._id });
            else reject({ isMatch, message: "User or Password is invalid" });
          });
        } else reject({ isMatch: false, message: "User doesn't exist" });
      });
    });
  },

  getPortalRequests: () => {
    return new Promise(async (resolve, reject) => {
      let portalRequests = await portalRequest
        .find({ requestStatus: "Placed" })
        .lean();
      if (portalRequests) resolve(portalRequests);
      else reject(false);
    });
  },

  getRequestDetail: (tagId) => {
    return new Promise(async (resolve, reject) => {
      let requestDetail = await portalRequest.findById(tagId).lean();
      if (requestDetail) resolve(requestDetail);
      else reject(false);
    });
  },

  acceptRequest: (tagId) => {
    return new Promise(async (resolve, reject) => {
      let requestDetail = await portalRequest.findById(tagId).lean();

      let userDetail = await Admin.updateOne(
        { _id: tagId },
        { userStatus: "Verified" }
      );
      let requestedServices = requestDetail.services;

      ["services", "requestStatus", "__v", "createdAt", "updatedAt"].forEach(
        (x) => delete requestDetail[x]
      );

      let newService = {
        hotelRooms: [],
      };
      if (requestedServices.eventHall.status) newService.hotelEvents = [];
      if (requestedServices.foodService) newService.hotelFoodMenu = [];

      await Service.findOneAndUpdate(
        { _id: tagId },
        newService,
        {
          new: true,
          upsert: true,
        }
      );

      await Portal.findOneAndUpdate({ _id: tagId }, requestDetail, {
        new: true,
        upsert: true,
      })
        .then(async (result) => {
          await portalRequest.deleteOne({ _id: tagId });
          resolve(true);
        })
        .catch((err) => console.log(err));
    });
  },

  rejectRequest: (tagId, rejectReason) => {
    return new Promise(async (resolve, reject) => {
      let userDetail = await Admin.updateOne(
        { _id: tagId },
        { requestStatus: "Pending" }
      );
      let requestDetail = await portalRequest.updateOne(
        { _id: tagId },
        { requestStatus: rejectReason }
      );
      if (requestDetail.n == 1 && userDetail.n == 1) resolve(true);
      else reject(false);
    });
  },

  // initAdmin: (formCred) => {
  //     console.log(formCred);
  //   bcrypt
  //     .hash(formCred.passKey, 10)
  //     .then((hash) => {
  //         console.log(hash);
  //       formCred.passKey = hash;
  //       const user = new Admin(formCred);
  //       user
  //         .save()
  //         .then((user) => {
  //           user.passKey = undefined;
  //         })
  //         .catch((err) =>
  //           reject({ loginStatus: false, message: "User already exist" })
  //         );
  //     })
  //     .catch((err) => console.log(err));
  // },
};
