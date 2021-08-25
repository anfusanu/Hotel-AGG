const bcrypt = require("bcrypt");

const User = require("../models/User");
const Admin = require("../models/Admin");
const Portal = require("../models/Portal");
const RoomService = require("../models/portalRoomService");
const Order = require("../models/Order");




module.exports = {
  logIn: (formCred) => {
    return new Promise(async (resolve, reject) => {
      User.findOne({ userEmail: formCred.userEmail }).then((dbUser) => {
        if (dbUser) {
          bcrypt.compare(formCred.passKey, dbUser.passKey).then((isMatch) => {
            if (isMatch)
              resolve({
                isMatch,
                userId: dbUser._id,
                userName: dbUser.firstName,
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
          const user = new User(formCred);
          user.accessStatus = true;
          user
            .save()
            .then((insertedData) => {
              resolve({
                isMatch: true,
                userId: insertedData._id,
                userName: insertedData.firstName,
              });
            })
            .catch((err) =>
              reject({
                isMatch: false,
                message:
                  "Check the credentials you have provided. You cannot signup if you are already a member",
              })
            );
        })
        .catch((err) => console.log(err));
    });
  },
  getUserDetails: (tagId) =>
  new Promise(async (resolve, reject) => {
    let userDetails = await User.findById(tagId).lean();
    if (userDetails) resolve(userDetails);
    else reject(false);
  }),

  autoSuggestionSearch: async (searchKeyword) => {
    return new Promise(async (resolve, reject) => {
      let searchResult = await Portal.find(
        {
          portalTag: { $regex: `${searchKeyword}`, $options: "i" },
        },
        { _id: 1, portalTag: 1 }
      )
        .limit(6)
        .lean();

      //   let searchResult = await Portal.aggregate([
      //   {
      //     $project: { data: "$_id", value: "$portalTag", _id: 0 },
      //   },
      // ])

      if (searchResult) resolve(searchResult);
      else reject({ isResult: false });
    });
  },

  getSearchResults: (query) => {
    console.log(query)
    return new Promise(async (resolve, reject) => {
      //initial find query
      let findQuery = { portalStatus: "Inactive" };
      let pageNumber = query.page || 1;

      //find query incase of geolocation
      if (query.geolocation)
        findQuery.portalDetail.location = {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [query.longitude, query.latitude],
            },
            $maxDistance: query.radius || 30000,
          },
        };

      // if (query.searchKeyword)
      //   findQuery.portalTag = {
      //     $regex: `${query.searchKeyword}`,
      //     $options: "i",
      //   };

      if (query.searchKeyword)
        findQuery = {'portalDetail.portalTag':{ $regex: `${query.searchKeyword}`, $options: "i"}}
        // {'portalDetail.portalTag':{ $regex: `${query.searchKeyword}`, $options: "i"}}
      // { $regexFindAll: { input: "$category", regex: /cafe/ }  }

      console.log(findQuery);
      let searchResult = await RoomService.aggregate([
        {
          $lookup: {
            from: "portals",
            localField: "portalId",
            foreignField: "_id",
            as: "portalDetail",
          },
        },
        { $unwind: "$portalDetail" },
        { $match: findQuery },

        // { $limit: 6 },
        // { $skip: (pageNumber - 1) * 6 },
      ]);

      // console.log(searchResult);
      // let searchResult = await Portal.find(findQuery)
      //   .limit(6)
      //   .skip((pageNumber - 1) * 6)
      //   .lean();
      if (searchResult) resolve(searchResult);
    });
  },

  getHotelDetails: async (portalId) => {
    return new Promise(async (resolve, reject) => {
      let portalDetails = await Portal.findById(portalId).lean();
      let roomServices = await RoomService.find({ portalId: portalId }).lean();

      let aggDetails = { portalDetails, roomServices };

      // if (portalDetails.services.eventService){
      //   let eventServices = await EventService.find({portalId:roomDetails.portalId}).lean()
      //   aggDetails.eventServices = eventServices
      // }
      // if (portalDetails.services.foodService){
      //   let foodServices = await FoodService.find({portalId:roomDetails.portalId}).lean()
      //   aggDetails.foodServices = foodServices

      // }

      if (portalDetails) resolve(aggDetails);
      else reject(false);
    });
  },
  getRoomWIthPortal: async (roomId) => {
    return new Promise(async (resolve, reject) => {
      // let roomDetails = await RoomService.aggregate([
      //   { $match: {_id : roomId} },
      //   {
      //     $lookup: {
      //       from: "portals",
      //       localField: "portalId",
      //       foreignField: "_id",
      //       as: "portalDetail",
      //     },
      //   },
      //   { $unwind: "$portalDetail" }
      // ]);
      let roomDetails = await RoomService.findById(roomId).lean();
      let portalDetails = await Portal.findById(roomDetails.portalId).lean();
      let roomServices = await RoomService.find({
        portalId: roomDetails.portalId,
      }).lean();

      let aggDetails = { roomDetails, portalDetails, roomServices };

      // if (portalDetails.services.eventService){
      //   let eventServices = await EventService.find({portalId:roomDetails.portalId}).lean()
      //   aggDetails.eventServices = eventServices
      // }
      // if (portalDetails.services.foodService){
      //   let foodServices = await FoodService.find({portalId:roomDetails.portalId}).lean()
      //   aggDetails.foodServices = foodServices

      // }

      if (roomDetails) resolve(aggDetails);
      else reject(false);
    });
  },
  getRoomDetails: (roomId) => {
    return new Promise(async (resolve, reject) => {
      let roomDetails = await RoomService.findById(roomId).lean();
      if (roomDetails) resolve(roomDetails);
      else reject(false);
    });
  },

};
