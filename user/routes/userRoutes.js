var express = require("express");
var router = express.Router();
const helper = require("../helpers/userHelper");

const verifyLogin = (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    req.session.destroy();
    res.redirect("/app/login");
  }
};

const notLogin = (req, res, next) => {
  if (req.session.user) {
    res.redirect("/app");
  } else {
    next();
  }
};

/* GET home page. */
router.get("/", function (req, res) {
  res.render("index", { homeActive: true, user: req.session.user });
});

router.get("/login", notLogin, function (req, res) {
  res.render("login", { Active: "noHead" });
});

router.post("/login", function (req, res) {
  helper
    .logIn(req.body)
    .then((loginStatus) => {
      req.session.user = loginStatus;
      res.json(loginStatus);
    })
    .catch((err) => res.json(err));
});

router.get("/register", notLogin, function (req, res) {
  res.render("register", { Active: "noHead" });
});
router.post("/signup", function (req, res) {
  helper
    .signUp(req.body)
    .then((loginStatus) => {
      req.session.user = loginStatus;
      res.json(loginStatus);
    })
    .catch((err) => res.json(err));
});

router.get("/logout", function (req, res) {
  req.session.destroy();
  res.redirect("/app");
});

//have both user details and order history
router.get("/profile", verifyLogin, function (req, res) {
  let tagId = req.session.user.userId;

  helper.getUserProfile(tagId).then((aggDetails) => {
    res.render("profile", { ...aggDetails, user: req.session.user });
  });
});

router.get("/order-invoice/:orderId", verifyLogin, function (req, res) {
  // let tagId = req.session.user.userId;
  if(!req.params.orderId) return res.redirect('/app')

  let orderId = req.params.orderId;

  helper.getInvoice(orderId).then((getInvoice) => {
    res.render("invoice", { ...getInvoice, user: req.session.user });
  });
});

router.get("/wishlist", verifyLogin, function (req, res) {
  res.render("wishlist", { user: req.session.user });
});

router.get("/checkout-room", verifyLogin, (req, res) => {
  if (!req.query.roomId) res.redirect("/app");

  helper
    .getRoomDetails(req.query.roomId)
    .then((roomDetails) => {
      helper.getUserDetails(req.session.user.userId).then((userDetails) => {
        res.render("payment", {
          roomDetails,
          query: req.query,
          userDetails,
          user: req.session.user,
        });
      });
    })
    .catch((err) => res.redirect("/app"));
});

router.post("/book-and-pay", function (req, res) {
  let tagId = req.session.user.userId;

  helper
    .orderPlace({ ...req.body, tagId })
    .then((orderStatus) => {
      if (orderStatus.paymentMethod == "COD") {
        res.json(orderStatus);
      } else {
        console.log(orderStatus);
        helper
          .generateRazorPay(orderStatus._id, orderStatus.totalAmount)
          .then((order) => {
            helper.getUserDetails(tagId).then((userDetails) => {
              res.json({ ...orderStatus, order, userDetails });
            });
          });
      }
    })
    .catch((err) => res.json(err));
});

router.get("/order-completed/:orderId", verifyLogin, (req, res) => {
  let user = req.session.user;
  helper
    .getOrderDetail(req.params.orderId)
    .then((orderDetail) => {
      let { guestInfo } = orderDetail;
      if (`${orderDetail._id}` == req.params.orderId)
        res.render("order-confirmation", { user, guestInfo });
      else res.redirect("/app");
    })
    .catch((err) => res.redirect("/app"));
});

router.post("/book-and-pay/verifyPayment", verifyLogin, function (req, res) {
  helper.verifyPayment(req.body).then((paymentStatus) => {
    if (paymentStatus) {
      helper
        .changePaymentStatus(req.body.orderId)
        .then((paymentStatus) => res.json({ status: true }));
    } else {
      helper
        .paymentAborted(req.body.orderId)
        .then((paymentStatus) => res.json({ status: false }));
    }
  });
});

router.post("/book-and-pay/paymentAborted", verifyLogin, function (req, res) {
  helper.paymentAborted(req.body.orderId);
  res.json({ status: true });
});


router.post("/update-profile", verifyLogin, function (req, res) {
  let tagId = req.session.user.userId
  helper.updateProfile(tagId,req.body)
  .then(eventStatus => {
    res.json(eventStatus)
  })
  .catch(err => res.json(err))
});

router.post("/update-password", verifyLogin, function (req, res) {
  let tagId = req.session.user.userId
  helper.updatePassword(tagId,req.body)
  .then(eventStatus => {
    res.json(eventStatus)
  })
  .catch(err => res.json(err))
});
//update-password

module.exports = router;
