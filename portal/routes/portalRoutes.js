var express = require("express");
var router = express.Router();
const helper = require("../helpers/portalHelper");

/* Middleware*/

const verifyLogin = (req, res, next) => {
  console.log(req.session.admin);
  if (req.session.admin) {
    if (req.session.admin.verifiedUser == "Verified") next();
    else if (req.session.admin.verifiedUser == "Placed")
      res.redirect("/registration/placed");
    else res.redirect("/registration/initial");
  } 
  else {
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
      let _admin = {
        userId: loginStatus.userId,
        verifiedUser: loginStatus.userStatus,
      };

      req.session.admin = _admin;
      res.json(loginStatus);
    })
    .catch((err) => res.json(err));
});

router.post("/signup", function (req, res) {
  helper
    .signUp(req.body)
    .then((loginStatus) => {
      req.session.admin = {
        userId: loginStatus.userId,
        verifiedUser: loginStatus.userStatus,
      };
      res.json(loginStatus);
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
  res.render("reception-mgt", { Active: "reception" });
});

router.get("/subs-mgt", verifyLogin, function (req, res) {
  res.render("subs-mgt", { Active: "subs" });
});

router.get("/sales", verifyLogin, function (req, res) {
  res.render("sales", { Active: "sales" });
});

router.get("/test", function (req, res) {
  res.render("test", { Active: "sales" });
});

// router.get("/admin-init", (req,res) =>{
//   helper.initAdmin({adminEmail: "superUser@AGG.com", passKey : "5up3rK3ym4n",userRole:0,hotelId:0})
//   res.send('WOW')
// })

module.exports = router;
