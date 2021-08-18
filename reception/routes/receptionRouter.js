var express = require("express");
var router = express.Router();
const helper = require("../helpers/receptionHelper");

const verifyLogin = (req, res, next) => {
  if (req.session.reception) {
    next();
  } else {
    res.redirect("/login");
  }
};
const notLogin = (req, res, next) => {
  if (req.session.reception) {
    res.redirect("/reception/dashboard");
  } else {
    next();
  }
};

// Pages that are only accessible if not logged in. [LOGIN]
router.get("/login", notLogin, function (req, res) {
  res.render("login", { layout: null });
});

router.post("/login", notLogin, function (req, res) {
  helper
    .login(req.body)
    .then((loginStatus) => {
      req.session.reception = loginStatus;
      res.json({ isMatch: true });
    })
    .catch((err) => res.json(err));
});

router.get("/logout", function (req, res) {
  req.session.destroy();
  res.redirect("/login");
});

/* GET home page or dashboard */
router.get("/dashboard", verifyLogin, function (req, res) {
  let portalId = req.session.reception.portalId;
  helper.getServiceDetails(portalId).then((serviceDetails) => {
    res.render("roomService", { Active: "dashboard", ...serviceDetails });
  });
});

router.get("/event-hall", verifyLogin, function (req, res) {
  let portalId = req.session.reception.portalId;
  helper.getServiceDetails(portalId).then((serviceDetails) => {
    res.render("eventService", { Active: "dashboard", ...serviceDetails });
  });
});

router.get("/food-menu", verifyLogin, function (req, res) {
  let portalId = req.session.reception.portalId;
  helper.getServiceDetails(portalId).then((serviceDetails) => {
    res.render("foodService", { Active: "dashboard", ...serviceDetails });
  });
});

router.get(`/offline-rooms/:roomId`, verifyLogin, (req, res) => {
  let tagId = req.session.admin.userId;
  let roomId = req.params.roomId;
  helper
    .getRoomOfflineList(tagId, roomId)
    .then((aggDetails) => {
      res.render("offline-rooms", { Active: "service", ...aggDetails });
    })
    .catch((err) => res.redirect("/reception/dashboard"));
});
///reserve-room

router.get(`/offline-rooms-booking`, verifyLogin, (req, res) => {
  res.render("offline-room-booking", { Active: "dashboard", query: req.query });
});

router.post(`/offline-rooms-booking`, verifyLogin, (req, res) => {
  let portalId = req.session.reception.portalId;
  console.log(req.body);
  helper.bookRoomOffline(portalId, req.body).then((orderStatus) => {
    res.json(orderStatus)
  }).catch(err => res.json(err))
});


router.get(`/offline-rooms-booking`, verifyLogin, (req, res) => {
  res.render("offline-room-booking", { Active: "dashboard", query: req.query });
});

router.post(`/offline-rooms-booking`, verifyLogin, (req, res) => {
  let portalId = req.session.reception.portalId;
  console.log(req.body);
  helper.bookRoomOffline(portalId, req.body).then((orderStatus) => {
    res.json(orderStatus)
  }).catch(err => res.json(err))
});

router.get("/orders", verifyLogin, function (req, res) {
  let portalId = req.session.reception.portalId;
  helper.getOrderList(portalId, req.query).then((orderList) => {
    console.log(orderList);
    res.render("orders", {
      Active: "orders",
      select: req.query.select,
      orderList,
      query: req.query,
    });
  });
});
router.get("/orders/today", verifyLogin, function (req, res) {
  let portalId = req.session.reception.portalId;
  helper.getOrderListToday(portalId, req.query).then((orderList) => {
    res.render("orders-today", {
      Active: "orders",
      select: "Today",
      orderList,
      query: req.query,
    });
  });
});

router.get("/order-cancel/:orderId", verifyLogin, (req, res) => {
  let portalId = req.session.reception.portalId;

  helper
    .orderCancel(portalId, req.params.orderId)
    .then((status) => {
      res.redirect("/user/profile");
    })
    .catch((err) => res.redirect("/app"));
});

router.get("/order-invoice/:orderId", verifyLogin, function (req, res) {
  if (!req.params.orderId) return res.redirect("/reception");

  let portalId = req.session.reception.portalId;
  let orderId = req.params.orderId;

  helper.getInvoice(orderId, portalId).then((getInvoice) => {
    res.render("invoice", {
      Active: "orders",
      ...getInvoice,
      user: req.session.user,
    });
  });
});

router.get("/order-check-in", verifyLogin, function (req, res) {
  let portalId = req.session.reception.portalId;
  const { roomId, orderId } = req.query;

  helper.getRoomOfflineList(portalId, roomId).then((aggDetails) => {
    res.render("offline-room-set", {
      Active: "orders",
      ...aggDetails,
      user: req.session.user,
      query: req.query,
    });
  });
});

router.post("/check-in-room-select", verifyLogin, function (req, res) {
  let portalId = req.session.reception.portalId;

  helper
    .checkInUser(portalId, req.body)
    .then((checkInStatus) => res.json(checkInStatus))
    .catch((err) => res.json(err));
});

///reception/check-in-room-select

module.exports = router;
