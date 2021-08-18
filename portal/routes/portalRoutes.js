var express = require("express");
var router = express.Router();
const helper = require("../helpers/portalHelper");
const { imageUpload } = require("../helpers/s3bucket");

/* Middleware*/

const verifyLogin = (req, res, next) => {
  if (req.session.admin) {
    if (req.session.admin.verifiedUser == "Verified") next();
    else if (req.session.admin.verifiedUser == "Placed")
      res.redirect("/registration/placed");
    else res.redirect("/registration/initial");
  } else {
    req.session.destroy();
    res.redirect("/portal/login");
  }
};

const notLogin = (req, res, next) => {
  if (req.session.admin) {
    res.redirect("/portal/dashboard");
  } else {
    next();
  }
};

/* Login and Signup */

router.get("/login", notLogin, function (req, res) {
  res.render("login", { layout: null });
});

router.post("/login", function (req, res) {
  helper
    .logIn(req.body)
    .then((loginStatus) => {
      req.session.admin = loginStatus;
      res.json({ isMatch: true });
    })
    .catch((err) => res.json(err));
});

router.post("/signup", function (req, res) {
  helper
    .signUp(req.body)
    .then((loginStatus) => {
      req.session.admin = loginStatus;
      res.json({ isMatch: true });
    })
    .catch((err) => res.json(err));
});

router.get("/logout", function (req, res) {
  req.session.destroy();
  res.redirect("/login");
});

/* GET home page. */
router.get("/dashboard", verifyLogin, function (req, res) {
  res.render("index", { Active: "dashboard" });
});

router.get("/reception-mgt", verifyLogin, function (req, res) {
  let tagId = req.session.admin.userId;

  helper.getReceptionList(tagId).then((receptionList) => {
    res.render("reception-mgt", { Active: "reception", receptionList });
  });
});
router.post(`/reception-mgt/add-reception`, verifyLogin, (req, res) => {
  let adminCred = req.session.admin;
  let formData = req.body;

  helper
    .addReception(adminCred, formData)
    .then((saved) => res.redirect("/portal/reception-mgt"))
    .catch((err) => res.redirect("/portal/reception-mgt"));
});

router.get("/service-mgt", verifyLogin, function (req, res) {
  let tagId = req.session.admin.userId;
  helper.getPortalDetail(tagId).then((portalDetail) => {
    helper.getServiceList(tagId, portalDetail.services).then((serviceList) => {
      res.render("service-mgt", {
        Active: "service",
        serviceStatus: portalDetail.services,
        serviceList,
      });
    });
  });
});

router.post(`/service-mgt/add-room`, verifyLogin, imageUpload, (req, res) => {
  let tagId = req.session.admin.userId;
  let formData = req.body;
  formData.roomImages = req.files.map(({ location }) => location);

  helper.addRoomService(tagId, formData).then((saved) => {
    res.redirect("/portal/service-mgt");
  });
});

router.get(`/service-mgt/edit-room/:roomId`, verifyLogin, (req, res) => {
  let tagId = req.session.admin.userId;
  let roomId = req.params.roomId;
  helper
    .getRoomService(tagId, roomId)
    .then((roomService) => {
      console.log(roomService);
      res.render("room-edit", { Active: "service", roomService });
    })
    .catch((err) => res.redirect("/portal/service-mgt"));
});

router.post(`/service-mgt/edit-room/`, verifyLogin, imageUpload, (req, res) => {
  let tagId = req.session.admin.userId;
  let formData = req.body;

  let roomId = formData.roomId;
  delete formData.roomId;

  helper.getRoomService(tagId, roomId).then((roomService) => {
    formData.roomImages = roomService.roomImages.concat(
      req.files.map(({ location }) => location)
    );

    helper.updateRoomService(tagId, roomId, formData).then((saved) => {
      res.redirect("/portal/service-mgt");
    });
  });
});

router.post(`/service-mgt/edit-room/delete-image`, verifyLogin, (req, res) => {
  let tagId = req.session.admin.userId;
  helper
    .deleteRoomImage(tagId, req.body)
    .then((status) => {
      res.json({ isSuccess: true });
    })
    .catch((err) =>
      res.json({ isSuccess: false, message: "Error on server side\n" + err })
    );
});

router.get(`/service-mgt/disable-room/:roomId`, verifyLogin, (req, res) => {
  let tagId = req.session.admin.userId;
  let roomId = req.params.roomId;
  helper
    .getRoomService(tagId, roomId)
    .then((roomService) => {
      console.log(roomService);
      res.render("room-edit", { Active: "service", roomService });
    })
    .catch((err) => res.redirect("/portal/service-mgt"));
});

router.get(`/service-mgt/remove-room/:roomId`, verifyLogin, (req, res) => {
  let tagId = req.session.admin.userId;
  let roomId = req.params.roomId;
  helper
    .getRoomService(tagId, roomId)
    .then((roomService) => {
      console.log(roomService);
      res.render("room-edit", { Active: "service", roomService });
    })
    .catch((err) => res.redirect("/portal/service-mgt"));
});

router.get(`/service-mgt/set-room/:roomId`, verifyLogin, (req, res) => {
  let tagId = req.session.admin.userId;
  let roomId = req.params.roomId;
  helper.getRoomOfflineList(tagId, roomId).then((aggDetails) => {
    res.render("service-mgt-room", { Active: "service", ...aggDetails });
  });
});

router.post(`/service-mgt/set-room/:roomId`, verifyLogin, (req, res) => {
  let tagId = req.session.admin.userId;
  let roomId = req.params.roomId;
  helper
    .addRoomNumber(tagId, roomId, req.body.roomNumber)
    .then((aggDetails) => {
      res.redirect(`/portal/service-mgt/set-room/${roomId}`);
    });
});

router.get(`/service-mgt/set-room/:roomId`, verifyLogin, (req, res) => {
  let tagId = req.session.admin.userId;
  let roomId = req.params.roomId;
  helper.getRoomOfflineList(tagId, roomId).then((aggDetails) => {
    res.render("service-mgt-room", { Active: "service", ...aggDetails });
  });
});

router.post(`/service-mgt/set-room-update/:roomId`, verifyLogin, (req, res) => {
  let tagId = req.session.admin.userId;
  helper.updateRoomNumber(tagId, roomId, req.body).then((status) => {
    res.redirect(`/portal/service-mgt/set-room/${roomId}`);
  });
});

router.get(`/service-mgt/set-room-delete`, verifyLogin, (req, res) => {
  let tagId = req.session.admin.userId;
  const {roomId, roomNumber} = req.query

  helper.deleteRoomNumber(tagId, roomId, roomNumber).then((status) => {
    res.redirect(`/portal/service-mgt/set-room/${roomId}`);
  });
});

router.get("/subs-mgt", verifyLogin, function (req, res) {
  res.render("subs-mgt", { Active: "subs" });
});

router.get("/sales", verifyLogin, function (req, res) {
  res.render("sales", { Active: "sales" });
});

router.get("/active", verifyLogin, function (req, res) {
  helper.portalStatusChanger(req.session.admin.userId).then((message) => {
    res.json({ message });
  });
});

module.exports = router;
