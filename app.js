var express       = require( 'express' ),
    path          = require( 'path' ),
    favicon       = require( 'serve-favicon' ),
    logger        = require( 'morgan' ),
    cookieParser  = require( 'cookie-parser' ),
    bodyParser    = require( 'body-parser' ),
    index         = require( './routes/index' ),
    auth          = require( './routes/auth' )

// var routes
var it_taccotypegeneral = require( './routes/ittaccotypegeneral' ),
    it_taccount         = require( './routes/ittaccount' ),
    it_tcategory        = require( './routes/ittcategory' ),
    it_tclose           = require( './routes/ittclose' ),
    it_tdepartment      = require( './routes/ittdepartment' ),
    it_tdetamove        = require( './routes/ittdetamove' ),
    it_titem            = require( './routes/ittitem' ),
    it_titemclass       = require( './routes/ittitemclass' ),
    it_tmove            = require( './routes/ittmove' ),
    it_tuser            = require( './routes/ittuser' ),
    location            = require( './routes/location' ),
    bussines            = require( './routes/bussines' ),
    userlocations       = require( './routes/userlocations' ),
    reports             = require( './routes/reports' ),
    logs                = require( './routes/logs' ),
    turn                = require( './routes/turn' ),
    support             = require( './routes/support' ),
    itemchange          = require( './routes/itemchange' ),
    dashboard           = require( './routes/dashboard' ),
    permission          = require( './routes/permission' ),
    userreports         = require( './routes/userreports' ),
    camaleonadmin       = require( './routes/camaleonadmin' ),
    profile             = require( './routes/profile' ),
    tanus               = require( './routes/tanus' );

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
app.use( '/it_taccotypegeneral', it_taccotypegeneral );
app.use( '/it_taccount', it_taccount );
app.use( '/it_tcategory', it_tcategory );
app.use( '/it_tclose', it_tclose );
app.use( '/it_tdepartment', it_tdepartment );
app.use( '/it_tdetamove', it_tdetamove );
app.use( '/it_titem', it_titem );
app.use( '/it_titemclass', it_titemclass );
app.use( '/it_tmove', it_tmove );
app.use( '/it_tuser', it_tuser );
app.use( '/bussines', bussines );
app.use( '/location', location );
app.use( '/userlocations', userlocations );
app.use( '/reports', reports );
app.use( '/logs', logs );
app.use( '/turn', turn );
app.use( '/support', support );
app.use( '/itemchange', itemchange );
app.use( '/dashboard', dashboard );
app.use( '/permission', permission );
app.use( '/userreports', userreports );
app.use( '/camaleonadmin', camaleonadmin );
app.use( '/profile', profile );
app.use( '/tanus', tanus );

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
