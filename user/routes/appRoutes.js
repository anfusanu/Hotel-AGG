var express = require("express");
var router = express.Router();
const helper = require("../helpers/appHelper");


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

router.get("/autocomplete-search/:searchKeyword", (req, res) => {
  helper
    .autoSuggestionSearch(req.params.searchKeyword)
    .then((result) => res.json(result))
    .catch((err) => res.json(result));
});

router.get("/search", (req, res) => {
  if (!req.query.page) res.redirect(`${req.originalUrl}&page=1`);
  helper.getSearchResults(req.query).then((searchResults) => {
    res.render("hotels-list", {
      Active: "Search",
      searchResults,
      query: req.query,
      user: req.session.user,
    });
  });
});

router.get("/hotel-detail", (req, res) => {
  if (!req.query.hotelId) res.redirect("/app");
  helper
    .getHotelDetails(req.query.hotelId)
    .then((aggDetails) => {
      res.render("hotel-detail", { ...aggDetails, user: req.session.user });
    })
    .catch((err) => res.redirect("/app"));
});

router.get("/hotel-room-detail", (req, res) => {
  if (!req.query.roomId) res.redirect("/app");
  helper
    .getRoomWIthPortal(req.query.roomId)
    .then((aggDetails) => {
      res.render("hotel-room-detail", {
        ...aggDetails,
        query: req.query,
        user: req.session.user,
      });
    })
    .catch((err) => res.redirect("/app"));
});

router.get("/checkout-room", verifyLogin, (req, res) => {
  if (!req.query.roomId) res.redirect("/app");
  let tagId = req.session.user.userId;

  helper
    .getRoomDetails(req.query.roomId)
    .then((roomDetails) => {
      helper.getUserDetails(tagId).then((userDetails) => {
        res.render("payment", {
          roomDetails,
          query: req.query,
          userDetails,
          user: req.session.user,
        })
      });
     
    })
    .catch((err) => res.redirect("/app"));
});


module.exports = router;
