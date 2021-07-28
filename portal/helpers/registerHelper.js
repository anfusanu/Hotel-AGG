const bcrypt = require("bcrypt");
const User = require("../models/User");
const Admin = require("../models/Admin");
const portalRequest = require("../models/PortalRequest");
const { request } = require("express");

module.exports = {
  updateRegistration: (regForm, tagId) => {
    return new Promise(async (resolve, reject) => {

      let regDB = {
        _id: tagId,
        firstName: regForm.firstName,
        lastName: regForm.lastName,
        portalTitle: regForm.portalTitle,
        portalTag: `${regForm.portalTitle} ${regForm.place} ${regForm.district} ${regForm.state}`,
        spaceType: regForm.spaceType,
        spacePrivacy: regForm.spacePrivacy,
        userBio: regForm.userBio,
        portalBio: regForm.portalBio,
        services: {
          foodService: regForm.foodService,
          eventHall: regForm.eventHall,
        },
        portalAddress: {
          place: regForm.place,
          address: regForm.address,
          district: regForm.district,
          state: regForm.state,
          pincode: regForm.pincode,
          geolocation: regForm.geolocation,
        },
        requestStatus: "Pending",
      };


      let data = await portalRequest.findOneAndUpdate({ _id: tagId }, regDB, {
        new: true,
        upsert: true,
      });

      if (data) resolve({isSuccess:true,data})
      else reject({isSuccess:false})
    });
  },

  getRequestDetail: (tagId) => {
    return new Promise(async (resolve, reject) => {
      let requestDetail = await portalRequest.findById(tagId);
      if (requestDetail) resolve(requestDetail);
      else reject(false);
    });
  },
};
