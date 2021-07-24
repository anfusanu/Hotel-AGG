const bcrypt = require("bcrypt");
const User = require("../models/User");
const Admin = require("../models/Admin");

module.exports = {
  logIn: (formCred) => {
    return new Promise(async (resolve, reject) => {
      User.findOne({ userEmail: formCred.userEmail }).then((dbUser) => {
        if (dbUser) {
          bcrypt.compare(formCred.passKey, dbUser.passKey).then((isMatch) => {
            if (isMatch)
              resolve({ isMatch, userId: dbUser._id, userName: dbUser.firstName });
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
