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
            url : http_helper.get_api_uri( 'it_tcategory/reports/', '?d1=' + url_parts.query.d1 + '&d2=' + url_parts.query.d2 + '&turn=' + url_parts.query.turn  ),
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
            url : http_helper.get_api_uri( 'it_titemclass/reports/', '?d1=' + url_parts.query.d1 + '&d2=' + url_parts.query.d2 + '&turn=' + url_parts.query.turn  ),
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
router.get( '/ticket', jsonParser, function( req, res ) {
    var userdata = JSON.parse( req.cookies['userdata'] ),
        url_parts = urlLib.parse( req.url, true );
    request(
        {
            url : http_helper.get_api_uri( 'ticket/reports/', '?d1=' + url_parts.query.d1 + '&d2=' + url_parts.query.d2  + '&loc=' + url_parts.query.loc + '&turn=' + url_parts.query.turn ),
            method : 'GET',
            json : true,
            headers : {
                'Authorization' : http_helper.get_basic_auth_w_token( encryption_system.decryptCookie( userdata.auth_data ) )
            }
        },
        ( error, response, body ) => { res.send( http_helper.data_format_ok_streaming( error, response, body ) ) }
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

/**
* ticket reports pettition
**/
router.get( '/dummy', jsonParser, function( req, res ) {
    var userdata = JSON.parse( req.cookies['userdata'] ),
        url_parts = urlLib.parse( req.url, true );
    request(
        {
            url : http_helper.get_api_uri( 'dummy/reports/', '?d1=' + url_parts.query.d1 + '&d2=' + url_parts.query.d2  + '&loc=' + url_parts.query.loc + '&turn=' + url_parts.query.turn ),
            method : 'GET',
            json : true,
            headers : {
                'Authorization' : http_helper.get_basic_auth_w_token( encryption_system.decryptCookie( userdata.auth_data ) ),
                'Content-type' : 'application/json'
            }
        },
        ( error, response, body ) => { res.send( http_helper.data_format_ok_streaming( error, response, body ) ) }
    );
});


        /**( error, response, body ) => { 
            res.send( http_helper.data_format_ok_streaming( error, response, body ) ) 
            if( response ) {
                switch (response.statusCode) {
                    case 200 :
                        console.log()
                        res.send( JSON.stringify({
                            error : false,
                            data : body
                        }));

                    case 400 :
                        return JSON.stringify({
                            error : true,
                            message : body
                        });
                    default:
                        return error;
                }
            } else {
                return error;
            }
        }**/
module.exports = router;
