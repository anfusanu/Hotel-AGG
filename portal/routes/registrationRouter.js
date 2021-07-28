var express = require("express");
var router = express.Router();
const helper = require("../helpers/registerHelper");

const verifyNewLogin = (req, res, next) => {
  console.log(req.session.admin);
  if (req.session.admin) {
    if (req.session.admin.verifiedUser === "Pending") next();
    else res.redirect("/portal/dashboard");
  } else {
    req.session.destroy();
    res.redirect("/portal/login");
  }
};

/* GET home page. */

router.get("/initial", verifyNewLogin, (req, res) => {
  helper
    .getRequestDetail(req.session.admin.userId)
    .then((requestDetail) => {
      res.render("registration/initial", {
        Active: "registration",
        newUser: true,
        requestDetail,
      });
    })
    .catch((err) => {
      res.render("registration/initial", {
        Active: "registration",
        newUser: true,
      });
    });
});

router.post("/initial-update", verifyNewLogin, (req, res) => {
  console.log(req.body)
  let tagId = req.session.admin.userId;
  helper
    .updateRegistration(req.body, tagId)
    .then((result) => {
      res.json(result.isSuccess)
    })
    .catch((err) => res.json(err.isSuccess));
});

router.get("/image-upload", verifyNewLogin, function (req, res) {
  res.render("registration/image-upload", {
    Active: "imageUpload",
    newUser: true,
    userId: req.session.admin.userId
  });
});
router.post("/image-upload", verifyNewLogin, function (req, res) {
  console.log(req.body);
  if (req.files) console.log(req.files);
  else console.log('No files');

});



router.get("/service-registration", verifyNewLogin, function (req, res) {
  res.render("registration/service-registration", {
    Active: "serviceRegistration",
    newUser: true,
  });
});

module.exports = router;
