var express = require("express");
var router = express.Router();
const helper = require("../helpers/superAdminHelper");

const verifyLogin = (req, res, next) => {
  // if (req.session.admin) {
  next();
  // } else {
  // res.redirect('/admin')
  // }
};

/* GET home page. */
router.get("/dashboard", verifyLogin, function (req, res) {
  res.render("index", { Active: "dashboard" });
});

router.get("/portal-mgt", verifyLogin, function (req, res) {
  res.render("portal-mgt", { Active: "portal" });
});

router.get("/subs-mgt", verifyLogin, function (req, res) {
  res.render("subs-mgt", { Active: "subs" });
});

router.get("/sales", verifyLogin, function (req, res) {
  res.render("sales", { Active: "sales" });
});

router.get("/login", function (req, res) {
  res.send("login");
});

router.post("/login", function (req, res) {
  helper.login(req.body).then((loginStatus) => {
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
