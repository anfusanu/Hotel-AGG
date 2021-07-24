var express = require("express");
var router = express.Router();
const helper = require("../helpers/userHelper");

const verifyLogin = (req, res, next) => {
  if (req.session.admin) {
    next();
  } else {
    req.session.destroy();
    res.redirect("/app/login");
  }
};

const notLogin = (req, res, next) => {
  if (req.session.admin) {
    res.redirect("/portal/dashboard");
  } else {
    next();
  }
};

/* GET home page. */
router.get("/", function (req, res) {
  res.render("index", { user: req.session.user });
});

// router.get("/login", notLogin, function (req, res) {
//   res.render("login", { layout: null });
// });

router.post("/login", function (req, res) {
  helper
    .logIn(req.body)
    .then((loginStatus) => {
      console.log(loginStatus);

      req.session.user = loginStatus;
      res.json(loginStatus);
    })
    .catch((err) => res.json(err));
});

router.get("/register", notLogin, function (req, res) {
  res.render("register");
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

// router.get("/admin-init", (req,res) =>{
//   helper.initAdmin({adminEmail: "superUser@AGG.com", passKey : "5up3rK3ym4n",userRole:0,hotelId:0})
//   res.send('WOW')
// })

router.post("/post", function (req, res) {
  console.log(req.body);
});
module.exports = router;
