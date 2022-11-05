var createError = require('http-errors');
var express = require('express');
var path = require('path');
var hbs = require('hbs')
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var db = require('./config/connection')
var userRouter = require('./routes/users');
var adminRouter = require('./routes/admin');
var easyinvoice = require('easyinvoice');
var app = express();
var nocache = require('nocache')
var session = require('express-session')
var hbsRegisterHelpers = require('./helpers/hbsRegisterHelpers');
const { handlebars } = require('hbs');
require('dotenv').config()


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
hbs.registerPartials(__dirname+'/views/partials')

hbsRegisterHelpers.inc()
hbsRegisterHelpers.isZero()
hbsRegisterHelpers.isShipped()
hbsRegisterHelpers.isReturnReq()
hbsRegisterHelpers.checkButton()
hbsRegisterHelpers.checkNull()
hbsRegisterHelpers.deliveryOver()
hbsRegisterHelpers.afterReturnAccepted()
hbsRegisterHelpers.isStatusPending()
hbsRegisterHelpers.isInitiated()
hbsRegisterHelpers.isReturnApproved()
hbsRegisterHelpers.topsellingrevenue()
hbsRegisterHelpers.isCancelled()
hbsRegisterHelpers.checkStock()



app.use(nocache())
//app.use(fileUpload())
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({ secret: process.env.Session_secret, cookie: { maxAge: 100000000} }));

db.connect((err)=>{
  if(err) console.log("connection error"+err);
  else console.log("Database connected to port 27017");
})

app.use('/', userRouter);
app.use('/admin', adminRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  // res.status(err.status || 500);
  res.render('Users/error',{err,login:true});
});

module.exports = app;
