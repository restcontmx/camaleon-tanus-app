'use strict';

var express = require( 'express' );
var bodyParser = require( 'body-parser' );
var urlLib = require( 'url' );
var request = require( 'request' );
var http_helper = require( '../helpers/http_helper_ne' );
var encryption_system = require( '../helpers/encryption_helper' );
var router = express.Router();
var jsonParser = bodyParser.json();

/**
 * it_titem update item and set a log for global update
 */
router.put( '/it_titem/', jsonParser,  function( req, res ) {
    var userdata = JSON.parse( req.cookies[ 'userdata' ] );
    request(
        {
            url : http_helper.get_api_uri( 'it_titem/global/', '' ),
            method : 'PUT',
            json : true,
            body : req.body,
            headers : {
                'Authorization' : http_helper.get_basic_auth_w_token( encryption_system.decryptCookie( userdata.auth_data ) )
            }
        },
        ( error, response, body ) => { res.send( http_helper.data_format_updated( error, response, body ) ) }
    );
});

/**
* it_titem get all the active logs
*/
router.get( '/it_titem/active/', jsonParser,  function( req, res ) {
   var userdata = JSON.parse( req.cookies[ 'userdata' ] );
   request(
       {
           url : http_helper.get_api_uri( 'it_titem/logs/active/', '' ),
           method : 'GET',
           json : true,
           headers : {
               'Authorization' : http_helper.get_basic_auth_w_token( encryption_system.decryptCookie( userdata.auth_data ) )
           }
       },
       ( error, response, body ) => { res.send( http_helper.data_format_ok( error, response, body ) ) }
   );
});

module.exports = router;
