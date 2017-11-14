var express = require( 'express' );
var bodyParser = require( 'body-parser' );
var urlLib = require( 'url' );
var request = require( 'request' );
var http_helper = require( '../helpers/http_helper_ne' );
var encryption_system = require( '../helpers/encryption_helper' );
var router = express.Router();
var jsonParser = bodyParser.json();

/**
* login function, requires email and password
**/
router.post( '/login', jsonParser, function( req, res ) {
    request(
        {
            url : http_helper.get_api_uri( 'login/', '' ),
            method : 'POST',
            json : true,
            body : req.body,
            headers : {
                'Authorization' : http_helper.get_basic_auth_app_header()
            }
        },
        function( error, response, body ) {
            switch (response.statusCode) {
                case  400:
                    var jsonData = JSON.stringify({
                        error : true,
                        message : "There was a BE connection error."
                    });
                    res.send( jsonData );
                    break;
                case 403:
                    var jsonData = JSON.stringify({
                        error : true,
                        message : "Forbbiden pettition."
                    });
                    res.send( jsonData );
                    break;
                case 401 :
                    var data_from_server = body;
                    var jsonData = JSON.stringify({
                        error : true,
                        message : data_from_server.message
                    });
                    res.send( jsonData );
                    break;
                case 500 :
                    var data_from_server = body;
                    var jsonData = JSON.stringify({
                        error : true,
                        message : "There was a connection error."
                    });
                    res.send( jsonData );
                    break;
                case 200 :
                    var data_from_server = body,
                        jsonData = JSON.stringify({
                            error : false,
                            message : data_from_server.message,
                            user_data : data_from_server.data[ 'user' ]
                        }),
                        user_data = JSON.stringify({
                            user_data : data_from_server.data['user'],
                            auth_data : encryption_system.encryptCookie( http_helper.get_user_basic_auth( req.body.email, req.body.password ) )
                        });
                    res.cookie( 'userdata', user_data, { maxAge : 2592000000, httpOnly:false, sameSite:'strict' } );
                    res.send( jsonData );
                    break;
                
                default :
                    res.send( error );
                    break;
            }
        }
    );
});

/**
* logout function, this destroys the user cookie with the token and shit
**/
router.post( '/logout', jsonParser, function( req, res ) {
    try {
        res.clearCookie( 'userdata' );
        res.send( 204 );
    } catch( err ) {
        res.send( err );
    }
});

module.exports = router;
