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
    var url_parts = urlLib.parse( req.url, true );
    request(
        {
            url : http_helper.get_api_uri( 'tanus/ticketrefdocs/', '?ticket_ref=' + url_parts.query.ticket_ref + '&loc=' + url_parts.query.loc +'&docu=' + url_parts.query.docu),
            method : 'GET',
            json : true,
            headers : {
                'Authorization' : http_helper.get_basic_auth_app_header( )
            }
        },
        ( error, response, body ) => { res.send( http_helper.data_format_ok( error, response, body ) ) }
    );
    
});

/**
* tanus ticket_reference detail reports pettition
**/
router.get( '/ticketrefdetail', jsonParser, function( req, res ) {
    var url_parts = urlLib.parse( req.url, true );
    request(
        {
            url : http_helper.get_api_uri( 'tanus/ticketrefdetail/', '?move_id=' + url_parts.query.move_id + '&loc=' + url_parts.query.loc ),
            method : 'GET',
            json : true,
            headers : {
                'Authorization' : http_helper.get_basic_auth_app_header(  )
            }
        },
        ( error, response, body ) => { res.send( http_helper.data_format_ok( error, response, body ) ) }
    );
});

/**
* tanus locations by business reports pettition
**/
router.get( '/locations/bybusiness/:id', jsonParser, function( req, res ) {
    var url_parts = urlLib.parse( req.url, true );
    console.log( req.params.id )
    request(
        {
            url : http_helper.get_api_uri( 'tanus/locations/bybusiness/', req.params.id ),
            method : 'GET',
            json : true,
            headers : {
                'Authorization' : http_helper.get_basic_auth_app_header(  )
            }
        },
        ( error, response, body ) => { res.send( http_helper.data_format_ok( error, response, body ) ) }
    );
});

module.exports = router;