var express = require('express');
var router = express.Router();
const helper = require('../helpers/adminHelper');


const verifyLogin = (req, res, next) => {
  if (req.session.admin) {
    next()
  } else {
    res.redirect('/admin')
  }
}

/* GET home page. */
router.get('/', function (req, res) {
  if (req.session.admin) {
    res.redirect('/admin/dashboard')
  } else {
    message = false;
    if (req.session.adminInvalid) {
      message = true;
      req.session.adminInvalid = false;
    }
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.render('Admin/admin-login', { layout: 'Admin/admin-layout', nohead: true, message: message });
  }
});

module.exports = router;
