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
* turn list petttion
**/
router.get( '/', jsonParser, function( req, res ) {
    var userdata = JSON.parse( req.cookies[ 'userdata' ] );
    request(
        {
            url : http_helper.get_api_uri( 'turn/', '' ),
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
* turn create pettition
**/
router.post( '/', jsonParser, function( req, res ) {
    var userdata = JSON.parse( req.cookies[ 'userdata' ] );
    request(
        {
            url : http_helper.get_api_uri( 'turn/', '' ),
            method : 'POST',
            json : true,
            body : req.body,
            headers : {
                'Authorization' : http_helper.get_basic_auth_w_token( encryption_system.decryptCookie( userdata.auth_data ) )
            }
        },
        ( error, response, body ) => { res.send( http_helper.data_format_created( error, response, body ) ) }
    );
});

/**
* turn retrieve pettition
**/
router.get( '/:id', jsonParser, function( req, res ) {
    var userdata = JSON.parse( req.cookies['userdata'] );
    request(
        {
            url : http_helper.get_api_uri( 'turn/', req.params.idea ),
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
* turn update pettition
**/
router.put( '/:id', jsonParser, function( req, res ) {
    var userdata = JSON.parse( req.cookies['userdata'] );
    request(
        {
            url : http_helper.get_api_uri( 'turn/', req.params.id ),
            method : 'PUT',
            json : true,
            body : req.body,
            headers : {
                'Authorization' : http_helper.get_basic_auth_w_token( encryption_system.decryptCookie( userdata.auth_data ) )
            }
        },
        ( error, response, body ) => { res.send( http_helper.data_format_ok( error, response, body ) ) }
    );
});

/**
* turn delete pettition
**/
router.delete( '/:id', jsonParser, function( req, res ) {
    var userdata = JSON.parse( req.cookies['userdata'] );
    request(
        {
            url : http_helper.get_api_uri( 'turn/', req.params.id ),
            method : 'DELETE',
            json : true,
            headers : {
                'Authorization' : http_helper.get_basic_auth_w_token( encryption_system.decryptCookie( userdata.auth_data ) )
            }
        },
        ( error, response, body ) => { res.send( http_helper.data_format_deleted( error, response, body ) ) }
    );

});

module.exports = router;