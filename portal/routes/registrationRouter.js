var express = require("express");
var router = express.Router();
const helper = require("../helpers/registerHelper");

const verifyNewLogin = (req, res, next) => {
  if (req.session.admin) {
    if (req.session.admin.verifiedUser === "Pending") next();
    else if (req.session.admin.verifiedUser == "Placed") res.redirect("/registration/placed");
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
  let tagId = req.session.admin.userId;
  helper
    .updateRegistration(req.body, tagId)
    .then((result) => {
      res.json(result.isSuccess);
    })
    .catch((err) => res.json(err.isSuccess));
});

router.get("/image-upload", verifyNewLogin, function (req, res) {
  res.render("registration/image-upload", {
    Active: "imageUpload",
    newUser: true,
    userId: req.session.admin.userId,
  });
});
router.post("/image-upload", verifyNewLogin, function (req, res) {
  if (req.files) console.log(req.files);
  else console.log("No files");
});

router.get("/services", verifyNewLogin, function (req, res) {
  helper
    .getRequestDetail(req.session.admin.userId)
    .then((requestDetail) => {
      let services = requestDetail.services;
      if (services.roomService.status) {
        res.render("registration/service", {
          Active: "serviceRegistration",
          newUser: true,
          services,
        });
      } else res.redirect("/registration/initial");
    })
    .catch((err) => {
      res.redirect("/registration/initial");
    });
});

router.post("/services/add-room", verifyNewLogin, (req, res) => {
  let tagId = req.session.admin.userId;
  helper
    .registerRoom(req.body, tagId)
    .then((result) => {
      res.redirect("/registration/services");
    })
    .catch((err) => res.redirect("/registration/services"));
});

router.get("/services/delete-room", verifyNewLogin, (req, res) => {
  let tagId = req.session.admin.userId;
  helper
    .deleteRoom(req.body, tagId)
    .then((result) => {
      res.redirect("/registration/services");
    })
    .catch((err) => res.redirect("/registration/services"));
});

router.post("/services/add-event", verifyNewLogin, (req, res) => {
  let tagId = req.session.admin.userId;
  helper
    .registerEvent(req.body, tagId)
    .then((result) => {
      res.redirect("/registration/services");
    })
    .catch((err) => res.redirect("/registration/services"));
});

router.get("/services/delete-event", verifyNewLogin, (req, res) => {
  let tagId = req.session.admin.userId;
  helper
    .deleteEvent(req.body, tagId)
    .then((result) => {
      res.redirect("/registration/services");
    })
    .catch((err) => res.redirect("/registration/services"));
});

router.get("/finish-up", verifyNewLogin, function (req, res) {
  helper
    .getRequestDetail(req.session.admin.userId)
    .then((requestDetail) => {
      let services = requestDetail.services;
      if (services.roomService.roomDetail.length > 0) {
        res.render("registration/finish-up", {
          Active: "finishUp",
          newUser: true,
        });
      } else res.redirect("/registration/services");
    })
    .catch((err) => {
      console.log(err);
      res.redirect("/registration/services");
    });
});

router.post("/finish-up", verifyNewLogin, function (req, res) {
  helper
    .getRequestDetail(req.session.admin.userId)
    .then((requestDetail) => {
      let services = requestDetail.services;
      if (services.roomService.roomDetail) {
        helper.requestFinishUp(req.session.admin.userId).then((isSuccess) => {
          req.session.admin.verifiedUser = "Placed";
          res.redirect("/registration/placed");
        });
      } else res.redirect("/registration/services");
    })
    .catch((err) => {
      console.log(err);
      res.redirect("/registration/services");
    });
});


router.get("/placed", function (req, res) {

  res.render('registration/placed',{layout:null});
});
module.exports = router;
