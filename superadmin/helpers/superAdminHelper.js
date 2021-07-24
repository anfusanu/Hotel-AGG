const bcrypt = require("bcrypt");
const User = require("../models/User");
const Admin = require("../models/Admin");

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









//   initAdmin: (formCred) => {
//       console.log(formCred);
//     bcrypt
//       .hash(formCred.passKey, 10)
//       .then((hash) => {
//           console.log(hash);
//         formCred.passKey = hash;
//         const user = new Admin(formCred);
//         user
//           .save()
//           .then((user) => {
//             user.passKey = undefined;
//           })
//           .catch((err) =>
//             reject({ loginStatus: false, message: "User already exist" })
//           );
//       })
//       .catch((err) => console.log(err));
//   },
};
