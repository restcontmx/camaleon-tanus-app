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
router.get( '/it_tcategory', jsonParser, function( req, res ) {
    var userdata = JSON.parse( req.cookies['userdata'] ),
        url_parts = urlLib.parse( req.url, true );
    request(
        {
            url : http_helper.get_business_api_uri( userdata.user_data.e_p, 'it_tcategory/reports/', '?d1=' + url_parts.query.d1 + '&d2=' + url_parts.query.d2 + '&turn=' + url_parts.query.turn  ),
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
router.get( '/it_tcategory/all', jsonParser, function( req, res ) {
    var userdata = JSON.parse( req.cookies['userdata'] ),
        url_parts = urlLib.parse( req.url, true );
    request(
        {
            url : http_helper.get_business_api_uri( userdata.user_data.e_p, 'it_tcategory/reports/all/', '?d1=' + url_parts.query.d1 + '&d2=' + url_parts.query.d2 + '&turn=' + url_parts.query.turn  ),
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
            url : http_helper.get_business_api_uri( userdata.user_data.e_p, 'it_titemclass/reports/', '?d1=' + url_parts.query.d1 + '&d2=' + url_parts.query.d2 + '&turn=' + url_parts.query.turn  ),
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
* it_tdepartment reports pettition
**/
router.get( '/it_tdepartment/', jsonParser, function( req, res ) {
    var userdata = JSON.parse( req.cookies['userdata'] ),
        url_parts = urlLib.parse( req.url, true );
    request(
        {
            url : http_helper.get_business_api_uri( userdata.user_data.e_p, 'it_tdepartment/reports/', '?d1=' + url_parts.query.d1 + '&d2=' + url_parts.query.d2 + '&turn=' + url_parts.query.turn  ),
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
* it_tclose reports pettition
**/
router.get( '/it_tclose', jsonParser, function( req, res ) {
    var userdata = JSON.parse( req.cookies['userdata'] ),
        url_parts = urlLib.parse( req.url, true );
    request(
        {
            url : http_helper.get_business_api_uri( userdata.user_data.e_p, 'it_tclose/reports/', '?d1=' + url_parts.query.d1 + '&d2=' + url_parts.query.d2 + '&turn=' + url_parts.query.turn  ),
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
* it_tclose reports by detail pettition
**/
router.get( '/it_tclose/detail/:id/:loc', jsonParser, function( req, res ) {
    var userdata = JSON.parse( req.cookies['userdata'] );
    request(
        {
            url : http_helper.get_business_api_uri( userdata.user_data.e_p, 'it_tclose/reports/detail/' + req.params.id + '/' + req.params.loc, '' ),
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
* discount reports pettition
**/
router.get( '/discount/', jsonParser, function( req, res ) {
    var userdata = JSON.parse( req.cookies['userdata'] ),
        url_parts = urlLib.parse( req.url, true );
    request(
        {
            url : http_helper.get_business_api_uri( userdata.user_data.e_p, 'discount/reports/', '?d1=' + url_parts.query.d1 + '&d2=' + url_parts.query.d2 + '&turn=' + url_parts.query.turn  ),
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
* void reports pettition
**/
router.get( '/void/', jsonParser, function( req, res ) {
    var userdata = JSON.parse( req.cookies['userdata'] ),
        url_parts = urlLib.parse( req.url, true );
    request(
        {
            url : http_helper.get_business_api_uri( userdata.user_data.e_p, 'void/reports/', '?d1=' + url_parts.query.d1 + '&d2=' + url_parts.query.d2 + '&turn=' + url_parts.query.turn  ),
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
* petty cash reports pettition
**/
router.get( '/pettycash/', jsonParser, function( req, res ) {
    var userdata = JSON.parse( req.cookies['userdata'] ),
        url_parts = urlLib.parse( req.url, true );
    request(
        {
            url : http_helper.get_business_api_uri( userdata.user_data.e_p, 'pettycash/reports/', '?d1=' + url_parts.query.d1 + '&d2=' + url_parts.query.d2 + '&turn=' + url_parts.query.turn  ),
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
* employee reports pettition
**/
router.get( '/it_temployee', jsonParser, function( req, res ) {
    var userdata = JSON.parse( req.cookies['userdata'] ),
        url_parts = urlLib.parse( req.url, true );
    request(
        {
            url : http_helper.get_business_api_uri( userdata.user_data.e_p, 'it_temployee/reports/', '?d1=' + url_parts.query.d1 + '&d2=' + url_parts.query.d2  ),
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
* credit card reports pettition
**/
router.get( '/creditcard', jsonParser, function( req, res ) {
    var userdata = JSON.parse( req.cookies['userdata'] ),
        url_parts = urlLib.parse( req.url, true );
    request(
        {
            url : http_helper.get_business_api_uri( userdata.user_data.e_p, 'creditcard/reports/', '?d1=' + url_parts.query.d1 + '&d2=' + url_parts.query.d2 + '&turn=' + url_parts.query.turn  ),
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
* it_titem reports pettition
**/
router.get( '/it_titem', jsonParser, function( req, res ) {
    var userdata = JSON.parse( req.cookies['userdata'] ),
        url_parts = urlLib.parse( req.url, true );
    request(
        {
            url : http_helper.get_business_api_uri( userdata.user_data.e_p, 'it_titem/reports/', '?d1=' + url_parts.query.d1 + '&d2=' + url_parts.query.d2 + '&turn=' + url_parts.query.turn  ),
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
* it_titem reports pettition
**/
router.get( '/it_titem/bycategory', jsonParser, function( req, res ) {
    var userdata = JSON.parse( req.cookies['userdata'] ),
        url_parts = urlLib.parse( req.url, true );
    request(
        {
            url : http_helper.get_business_api_uri( userdata.user_data.e_p, 'it_titem/bycategory/reports/', '?d1=' + url_parts.query.d1 + '&d2=' + url_parts.query.d2 + '&turn=' + url_parts.query.turn + '&cate_name=' + url_parts.query.cate_name + '&cate_id=' + url_parts.query.cate_id ),
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
            url : http_helper.get_business_api_uri( userdata.user_data.e_p, 'location/reports/', '?d1=' + url_parts.query.d1 + '&d2=' + url_parts.query.d2  ),
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
            url : http_helper.get_business_api_uri( userdata.user_data.e_p, 'ticket/reports/', '?d1=' + url_parts.query.d1 + '&d2=' + url_parts.query.d2  + '&loc=' + url_parts.query.loc + '&turn=' + url_parts.query.turn ),
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
router.get( '/ticket/count', jsonParser, function( req, res ) {
    var userdata = JSON.parse( req.cookies['userdata'] ),
        url_parts = urlLib.parse( req.url, true );
    request(
        {
            url : http_helper.get_business_api_uri( userdata.user_data.e_p, 'ticket/count/', '?d1=' + url_parts.query.d1 + '&d2=' + url_parts.query.d2  + '&p=' + url_parts.query.p ),
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
router.get( '/ticket/count/size', jsonParser, function( req, res ) {
    var userdata = JSON.parse( req.cookies['userdata'] ),
        url_parts = urlLib.parse( req.url, true );
    request(
        {
            url : http_helper.get_business_api_uri( userdata.user_data.e_p, 'ticket/count/size/', '?d1=' + url_parts.query.d1 + '&d2=' + url_parts.query.d2 ),
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
            url : http_helper.get_business_api_uri( userdata.user_data.e_p, 'ticket/details/', '?ticket=' + url_parts.query.ticket + '&loc=' + url_parts.query.loc ),
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
            url : http_helper.get_business_api_uri( userdata.user_data.e_p, 'dummy/reports/', '?d1=' + url_parts.query.d1 + '&d2=' + url_parts.query.d2  + '&loc=' + url_parts.query.loc + '&turn=' + url_parts.query.turn ),
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

module.exports = router;
