var express = require("express");
var router = express.Router();
const helper = require("../helpers/superAdminHelper");

const verifyLogin = (req, res, next) => {
  if (req.session.superAdmin) {
    next();
  } else {
    res.redirect("/admin");
  }
};
const notLogin = (req, res, next) => {
  if (req.session.superAdmin) {
    res.redirect("/super-admin/dashboard");
  } else {
    next();
  }
};



// Pages that are only accessible if not logged in. [LOGIN, SIGNUP]
router.get("/login", notLogin, function (req, res) {
  res.render("login", { layout: null });
});

router.post("/login", notLogin, function (req, res) {
  helper
    .login(req.body)
    .then((loginStatus) => {
      req.session.superAdmin = {
        userId: loginStatus.userId,
        isLogged: true,
      };
      res.json(loginStatus);
    })
    .catch((err) => res.json(err));
});

router.get("/logout", function (req, res) {
  req.session.destroy();
  res.redirect("/login");
});

/* GET home page or dashboard */
router.get("/dashboard", verifyLogin, function (req, res) {
  res.render("index", { Active: "dashboard" });
});

//  Poratl MGT router where you handle the become a host requests
router.get("/portal-mgt", verifyLogin, function (req, res) {
  helper.getPortalRequests().then((portalRequests) => {
    res.render("portal-mgt/request-mgt", { Active: "portal", portalRequests });
  });
});

// detailed request of a user to become host, Where admin can choose to accept or reject it
router.get("/portal-mgt/detailed-request/:reqId", verifyLogin, (req, res) => {
  helper.getRequestDetail(req.params.reqId).then((requestDetail) => {
    res.render("portal-mgt/detailed-request", { requestDetail });
  });
});

// Admin accepts a request (GET request)
router.get(
  "/portal-mgt/accept-request/:reqId",
  verifyLogin,
  function (req, res) {
    helper.acceptRequest(req.params.reqId).then((requestDetail) => {
      res.redirect("/super-admin/portal-mgt/");
    });
  }
);

// Admin rejects a request with a message (POST request)

router.post("/portal-mgt/reject-request/", verifyLogin, function (req, res) {
  console.log(req.body);
  // helper.rejectRequest(req.body.reqId)
  // .then(requestDetail => {
  //   res.render('portal-mgt/detailed-request',{requestDetail})

  // })
});

router.get("/subs-mgt", verifyLogin, function (req, res) {
  res.render("subs-mgt", { Active: "subs" });
});

router.get("/sales", verifyLogin, function (req, res) {
  res.render("sales", { Active: "sales" });
});





module.exports = router;
