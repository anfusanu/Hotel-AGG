const bcrypt = require("bcrypt");
const User = require("../models/User");
const Admin = require("../models/Admin");
const portalRequest = require("../models/PortalRequest");

module.exports = {
  logIn: (formCred) => {
    return new Promise(async (resolve, reject) => {
      Admin.findOne({ adminEmail: formCred.adminEmail }).then((dbUser) => {
        if (dbUser && dbUser.userRole === 1) {
          bcrypt.compare(formCred.passKey, dbUser.passKey).then((isMatch) => {
            if (isMatch)
              resolve({ isMatch, userId: dbUser._id, userStatus: dbUser.userStatus });
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
          formCred.userStatus = "Pending"
          const admin = new Admin(formCred);
          admin
            .save()
            .then((dbUser) => {
              resolve({
                isMatch: true,
                userId: dbUser._id,
                userStatus: dbUser.userStatus 
              });
            })
            .catch((err) =>{
              console.log(err);
              reject({
                isMatch: false,
                message:
                  "Check the credentials you have provided. You cannot signup if you are already a member",
              })
            }
              
            );
        })
        .catch((err) => console.log(err));
    });
  }
};
