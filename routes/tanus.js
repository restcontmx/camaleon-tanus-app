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
* tanus ticket_reference documents reports pettition
**/
router.get( '/ticketrefdocs', jsonParser, function( req, res ) {
    var userdata = JSON.parse( req.cookies['userdata'] ),
        url_parts = urlLib.parse( req.url, true );
    request(
        {
            url : http_helper.get_business_api_uri( userdata.user_data.e_p, 'tanus/ticketrefdocs/', '?ticket_ref=' + url_parts.query.ticket_ref + '&loc=' + url_parts.query.loc ),
            method : 'GET',
            json : true,
            headers : {
                'Authorization' : http_helper.get_basic_auth_w_token( encryption_system.decryptCookie( userdata.auth_data ) )
            }
        },
        ( error, response, body ) => { res.send( http_helper.data_format_ok( error, response, body ) ) }
    );
});

/**
* tanus ticket_reference detail reports pettition
**/
router.get( '/ticketrefdetail', jsonParser, function( req, res ) {
    var userdata = JSON.parse( req.cookies['userdata'] ),
        url_parts = urlLib.parse( req.url, true );
    request(
        {
            url : http_helper.get_business_api_uri( userdata.user_data.e_p, 'tanus/ticketrefdetail/', '?move_id=' + url_parts.query.move_id + '&loc=' + url_parts.query.loc ),
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