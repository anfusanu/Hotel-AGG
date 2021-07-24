var express = require("express");
var router = express.Router();
const helper = require("../helpers/portalHelper");

const verifyLogin = (req, res, next) => {
  console.log(req.session.admin);
  if (req.session.admin) {
    if (req.session.admin.verifiedUser) next();
    else res.redirect('/portal/registration')
  } else {
    req.session.destroy();
  res.redirect('/portal/login')
  }
};

const notLogin = (req, res, next) => {
  if (req.session.admin) {
  res.redirect('/portal/dashboard')
  } else {
    next();
  }
};

const verifyNewLogin = (req, res, next) => {
  console.log(req.session.admin);
  if (req.session.admin) {
    if (!req.session.admin.verifiedUser) next();
    else res.redirect('/portal/dashboard')
  } else {
    req.session.destroy();
  res.redirect('/portal/login')
  }
};

/* GET home page. */
router.get("/dashboard", verifyLogin, function (req, res) {
  res.render("index", { Active: "dashboard" });
});

router.get("/registration",verifyNewLogin, function (req, res) {
  res.render("registration", { Active: "registration",newUser:true });
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

router.get("/login",notLogin, function (req, res) {
  res.render("login",{layout: null});
});

router.post("/login", function (req, res) {
  helper.logIn(req.body).then((loginStatus) => {
    
    let _admin = {
      userId: loginStatus.userId,
      verifiedUser: true,
    }
    if (loginStatus.hotelId == "0") _admin.verifiedUser = false

    req.session.admin = _admin
    res.json(loginStatus)
  })
  .catch(err => res.json(err))
});

router.post("/signup", function (req, res) {
  helper.signUp(req.body).then((loginStatus) => {
    req.session.admin = {
      userId: loginStatus.userId,
      isLogged: true,
    };
    res.json(loginStatus)
  })
  .catch(err => res.json(err))
});

router.get("/logout", function (req, res) {
  req.session.destroy();
  res.redirect("/login");
});

// router.get("/admin-init", (req,res) =>{
//   helper.initAdmin({adminEmail: "superUser@AGG.com", passKey : "5up3rK3ym4n",userRole:0,hotelId:0})
//   res.send('WOW')
// })

router.post("/post", function (req, res) {
  console.log(req.body);
});
module.exports = router;
