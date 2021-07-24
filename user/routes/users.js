var express = require('express');
var router = express.Router();
const helper = require('../helpers/userHelper');

const verifyLogin = (req, res, next) => {
  if (req.session.userId) {
    helper.verifyUser(req.session.userId, check => {
      if (!check) {
        delete req.session.user
        delete req.session.userId
        res.redirect('/');
      } else next();
    })
  }
  else {
    res.redirect('/');
  }
}

const notLogin = (req, res, next) => {
  if (!req.session.userId) {
    delete req.session.changePasswordEmail;
    if (!req.session.cart) req.session.cart = []
    var count = { cart: req.session.cart.length }
    req.count = count
    next()
  }
  else {
    res.redirect('/');
  }

}


router.get('/', notLogin, function (req, res) {
  message = false;
  if (req.session.loginMsg) {
    message = true;
    delete req.session.loginMsg;
  }
  res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  res.render('index', { notLoggedIn: true, message: message, count: req.count });
});


router.get('/a', notLogin, function (req, res) {
req.session.user = "User is logged in"
res.json(req.session)

});

router.get('/b', notLogin, function (req, res) {
console.log(req.session);
res.json(req.session)
});

router.get('/d', notLogin, function (req, res) {
  req.session.destroy();
  });

module.exports = router;
