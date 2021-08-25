const bcrypt = require("bcrypt");
const User = require("../models/User");
const Admin = require("../models/Admin");
const portalRequest = require("../models/PortalRequest");

module.exports = {
  updateRegistration: (regForm, tagId) => {
    return new Promise(async (resolve, reject) => {
      console.log(regForm);
      let regDB = {
        _id: tagId,
        firstName: regForm.firstName,
        lastName: regForm.lastName,
        emailAddress: regForm.emailAddress,
        phoneNumber: regForm.phoneNumber,
        portalTitle: regForm.portalTitle,
        portalTag: `${regForm.portalTitle} ${regForm.place} ${regForm.district} ${regForm.state}`,
        spaceType: regForm.spaceType,
        spacePrivacy: regForm.spacePrivacy,
        userBio: regForm.userBio,
        portalBio: regForm.portalBio,
        services: {
          roomService: { status: true, roomDetail: [] },
          foodService: regForm.foodService,
          eventHall: { status: regForm.eventHall, eventDetail: [] },
        },
        portalAddress: {
          place: regForm.place,
          address: regForm.address,
          district: regForm.district,
          state: regForm.state,
          pincode: regForm.pincode,
          geolocation: {
            latitude: regForm.latitude,
            longitude: regForm.longitude,
          },
        },
      };

      let data = await portalRequest.findOneAndUpdate({ _id: tagId }, regDB, {
        upsert: true,
        useFindAndModify :false,
      });

      if (data) resolve({ isSuccess: true, data });
      else reject({ isSuccess: false });
    });
  },

  getRequestDetail: (tagId) => {
    return new Promise(async (resolve, reject) => {
      let requestDetail = await portalRequest.findById(tagId);
      if (requestDetail) resolve(requestDetail);
      else reject(false);
    });
  },
  registerRoom: (roomForm, tagId) => {
    return new Promise(async (resolve, reject) => {
      const res = await portalRequest.updateOne(
        { _id: tagId },
        { $push: { "services.roomService.roomDetail": roomForm } }
      );
      if (res.n == 1) resolve(true);
      else reject(false);
    });
  },
  deleteRoom: (roomTitle, tagId) => {
    return new Promise(async (resolve, reject) => {
      const res = await portalRequest.updateOne(
        { _id: tagId },
        { $pull: { "services.roomService.roomDetail": roomTitle } }
      );
      if (res.n == 1) resolve(true);
      else reject(false);
    });
  },
  registerEvent: (eventForm, tagId) => {
    return new Promise(async (resolve, reject) => {
      const res = await portalRequest.updateOne(
        { _id: tagId },
        { $push: { "services.eventHall.eventDetail": eventForm } }
      );
      console.log(res);
      if (res.n == 1) resolve(true);
      else reject(false);
    });
  },
  deleteEvent: (evenTitle, tagId) => {
    return new Promise(async (resolve, reject) => {
      const res = await portalRequest.updateOne(
        { _id: tagId },
        { $pull: { "services.eventHall.eventDetail": evenTitle } }
      );
      if (res.n == 1) resolve(true);
      else reject(false);
    });
  },

  imageRegistration: (tagId, portalImages) =>
    new Promise(async (resolve, reject) => {
      const portalRequestUpdate = await portalRequest.updateOne(
        { _id: tagId },
        { requestStatus: "Placed" }
      );
    }),

  requestFinishUp: (tagId) => {
    return new Promise(async (resolve, reject) => {
      const portalRequestUpdate = await portalRequest.updateOne(
        { _id: tagId },
        { requestStatus: "Placed" }
      );

      const userUpdate = await Admin.updateOne(
        { _id: tagId },
        { userStatus: "Placed" }
      );

      if (portalRequestUpdate.n == 1 && userUpdate.n == 1) resolve(true);
      else reject(false);
    });
  },
};
