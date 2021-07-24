const bcrypt = require("bcrypt");
const User = require("../models/User");
const Admin = require("../models/Admin");

module.exports = {
  logIn: (formCred) => {
    return new Promise(async (resolve, reject) => {
      Admin.findOne({ adminEmail: formCred.adminEmail }).then((dbUser) => {
        if (dbUser && dbUser.userRole === 1) {
          bcrypt.compare(formCred.passKey, dbUser.passKey).then((isMatch) => {
            if (isMatch)
              resolve({ isMatch, userId: dbUser._id, hotelId: dbUser.hotelId });
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
          formCred.hotelId = "0";
          const admin = new Admin(formCred);
          admin
            .save()
            .then((user) => {
              console.log(user);
              resolve({
                isMatch: true,
                userId: user._id,
                hotelId: user.hotelId,
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

  // initAdmin: (formCred) => {
  //   console.log(formCred);
  //   bcrypt
  //     .hash(formCred.passKey, 10)
  //     .then((hash) => {
  //       console.log(hash);
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
