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
* it_tcategory reports pettition
**/
router.get( '/it_tcategory/', jsonParser, function( req, res ) {
    var userdata = JSON.parse( req.cookies['userdata'] ),
        url_parts = urlLib.parse( req.url, true );
    request(
        {
            url : http_helper.get_api_uri( 'it_tcategory/reports/', '?d1=' + url_parts.query.d1 + '&d2=' + url_parts.query.d2  ),
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
* it_tcategory reports pettition
**/
router.get( '/it_titemclass/', jsonParser, function( req, res ) {
    var userdata = JSON.parse( req.cookies['userdata'] ),
        url_parts = urlLib.parse( req.url, true );
    request(
        {
            url : http_helper.get_api_uri( 'it_titemclass/reports/', '?d1=' + url_parts.query.d1 + '&d2=' + url_parts.query.d2  ),
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
* local reports pettition
**/
router.get( '/location/', jsonParser, function( req, res ) {
    var userdata = JSON.parse( req.cookies['userdata'] ),
        url_parts = urlLib.parse( req.url, true );
    request(
        {
            url : http_helper.get_api_uri( 'location/reports/', '?d1=' + url_parts.query.d1 + '&d2=' + url_parts.query.d2  ),
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
* ticket reports pettition
**/
router.get( '/ticket/', jsonParser, function( req, res ) {
    var userdata = JSON.parse( req.cookies['userdata'] ),
        url_parts = urlLib.parse( req.url, true );
    request(
        {
            url : http_helper.get_api_uri( 'ticket/reports/', '?d1=' + url_parts.query.d1 + '&d2=' + url_parts.query.d2 + '&p=' + url_parts.query.p + '&loc=' + url_parts.query.loc ),
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
* ticket reports pettition
**/
router.get( '/ticket/details', jsonParser, function( req, res ) {
    var userdata = JSON.parse( req.cookies['userdata'] ),
        url_parts = urlLib.parse( req.url, true );
    request(
        {
            url : http_helper.get_api_uri( 'ticket/details/', '?ticket=' + url_parts.query.ticket + '&loc=' + url_parts.query.loc ),
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
