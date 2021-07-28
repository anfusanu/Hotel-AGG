require('dotenv').config();
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session')
var hbs = require('hbs')
const mongoose = require('mongoose');



var portalRouter = require('./routes/portalRoutes');
var registrationRouter = require('./routes/registrationRouter')

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');


hbs.registerHelper('ifeq', function (arg1, arg2, options) {
  return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
});
hbs.registerHelper('if_eq', function () {
  const args = Array.prototype.slice.call(arguments, 0, -1);
  const options = arguments[arguments.length - 1];
  const allEqual = args.every(function (expression) {
    return args[0] === expression;
  });

  return allEqual ? options.fn(this) : options.inverse(this);
});


app.use(logger('dev'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: process.env.SESSION_SECRET,
  cookie: { maxAge: 6000000 },
  resave: false,
  saveUninitialized: true

}))

mongoose.connect(process.env.MONGO_URL,{
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true
})
.then( () => console.log('DB connected'))
.catch((err) => console.log(err));



app.use('/portal',portalRouter);
app.use('/registration',registrationRouter);

app.use('/',(req,res) =>{
  res.redirect('/portal/login')
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error', { layout: false });
});

module.exports = app;
