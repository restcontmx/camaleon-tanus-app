var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var auth = require('./routes/auth');

// var routes
var it_taccotypegeneral = require( './routes/ittaccotypegeneral' );
var it_taccount = require( './routes/ittaccount' );
var it_tcategory = require( './routes/ittcategory' );
var it_tclose = require( './routes/ittclose' );
var it_tdepartment = require( './routes/ittdepartment' );
var it_tdetamove = require( './routes/ittdetamove' );
var it_titem = require( './routes/ittitem' );
var it_titemclass = require( './routes/ittitemclass' );
var it_tmove = require( './routes/ittmove' );
var it_tuser = require( './routes/ittuser' );
var location = require( './routes/location' );
var bussines = require( './routes/bussines' );
var userlocations = require( './routes/userlocations' );
var reports = require( './routes/reports' );
var logs = require( './routes/logs' );
var turn = require( './routes/turn' );

var app = express();

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use( '/auth', auth );

// routes
app.use('/it_taccotypegeneral', it_taccotypegeneral);
app.use('/it_taccount', it_taccount);
app.use('/it_tcategory', it_tcategory);
app.use('/it_tclose', it_tclose);
app.use('/it_tdepartment', it_tdepartment);
app.use('/it_tdetamove', it_tdetamove);
app.use('/it_titem', it_titem);
app.use('/it_titemclass', it_titemclass);
app.use('/it_tmove', it_tmove);
app.use('/it_tuser', it_tuser);
app.use('/bussines', bussines);
app.use('/location', location);
app.use('/userlocations', userlocations);
app.use('/reports', reports);
app.use('/logs', logs);
app.use('/turn', turn);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
