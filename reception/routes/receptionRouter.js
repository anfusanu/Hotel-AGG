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
      req.session.reception = loginStatus
      res.json({isMatch:true});
    })
    .catch((err) => res.json(err));
});

router.get("/logout", function (req, res) {
  req.session.destroy();
  res.redirect("/login");
});




/* GET home page or dashboard */
router.get("/dashboard", verifyLogin, function (req, res) {
  let portalId = req.session.reception.portalId
  helper.getServiceDetails(portalId).then(serviceDetails => {
  res.render("roomService", { Active: "dashboard",...serviceDetails });
  })
});

router.get("/event-hall", verifyLogin, function (req, res) {
  let portalId = req.session.reception.portalId
  helper.getServiceDetails(portalId).then(serviceDetails => {
  res.render("eventService", { Active: "dashboard",...serviceDetails });
  })
});

router.get("/food-menu", verifyLogin, function (req, res) {
  let portalId = req.session.reception.portalId
  helper.getServiceDetails(portalId).then(serviceDetails => {
  res.render("foodService", { Active: "dashboard",...serviceDetails });
  })
});

router.get("/orders", verifyLogin, function (req, res) {
  let portalId = req.session.reception.portalId
  helper.getOrderList(portalId).then(orderList => {
    console.log(orderList)
  res.render("orders", { Active: "orders",orderList });
  })
});

router.get("/order-invoice/:orderId", verifyLogin, function (req, res) {
  // let tagId = req.session.user.userId;
  if(!req.params.orderId) return res.redirect('/app')

  let orderId = req.params.orderId;

  helper.getInvoice(orderId).then((getInvoice) => {
    res.render("invoice", { ...getInvoice, user: req.session.user });
  });
});
//orders

module.exports = router;
