require('dotenv').config();

var createError = require('http-errors');
var express = require('express');
var hbs = require('hbs')
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');


const redis = require('redis')
var session = require('express-session')
let RedisStore = require('connect-redis')(session)
// let redisClient = redis.createClient()

let redisClient = redis.createClient({
  host: 'localhost',
  port: 6379,
  password: 'A0S98FD76f3g6bvk2g35h98SG7FD2o354hjsd968',
  db: 1,
})
redisClient.unref()
redisClient.on('error', console.log)

// let store = new RedisStore({ client: redisClient })

const mongoose = require('mongoose');
// const fileUpload = require('express-fileupload')



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
  store: new RedisStore({ client: redisClient }),
  resave: false,
  saveUninitialized: false

}))
// app.use(fileUpload({
//   limits: { fileSize: 50 * 1024 * 1024 },
// }));
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
