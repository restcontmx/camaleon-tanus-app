var http = require( 'http' );
/**
* application global info for api connection
**/
const   test_config = {
            api_uri : 'https://api-example-ramonbadillo.c9users.io/api/',
            token : 'UkVQT1JUU19XRUJBUFA6NztXZWEhVEBVPkFmUlJ1Yw=='
        },
        auth_production_config = {
            api_uri : 'https://camaleonauth-api.herokuapp.com/api/',
            token : 'QkJRU0RBTl9XRUJBUFA6Wj1WUjRyNXB6UVtKW0ZXXw=='
        };
        
const g_opts = auth_production_config;
const DEBUG = false

/**
* Get the full api uri compose with the model and the url data
**/
var get_api_uri = ( model, url_data ) => ( DEBUG ? ( test_config.api_uri + model + url_data ) : ( auth_production_config.api_uri + model + url_data ) )

/**
 * Get full formatted url for business
 */
var get_business_api_uri = ( e_p, model, url_data ) => ( DEBUG ? ( test_config.api_uri + model + url_data ) : ( e_p + model + url_data ) )

/**
* Get the basic authorization appliation header
**/
var get_basic_auth_app_header = ( ) => ( DEBUG ? ( 'Basic ' + test_config.token ) : ( 'Basic ' + auth_production_config.token ) )

/**
* Get the user basic authorization appliation header
* with pass and username
**/
var get_user_basic_auth = ( username, password ) => ( new Buffer( username + ':' + password ).toString( 'base64' ) );

/**
* get the basic authentication string
* with the token
**/
var get_basic_auth_w_token = ( token ) => ( 'Basic ' + token );

/**
* retrieve data format to client with response and body and error
* response 200 OK
**/
var data_format_ok = function( error, response, body ) {
    if( response ) {
        switch (response.statusCode) {
            case 200 :
                return JSON.stringify({
                    error : false,
                    data : body.data
                });
            case 400 :
                return JSON.stringify({
                    error : true,
                    message : body.message
                });
            case 401 :
                return JSON.stringify({
                    error : true,
                    message : "Credentials are not valid."
                });
            case 403 :
                return JSON.stringify({
                    error : true,
                    message : "Forbidden pettition."
                });
            case 500 :
                return JSON.stringify({
                    error : true,
                    message : "Server Error or Connection error."
                });
        }
    } else {
        return error;
    }
};

/**
* retrieve data format to client with response and body and error
* response 200 OK
**/
var data_format_ok_streaming = function( error, response, body ) {
    if( response ) {
        switch (response.statusCode) {
            case 200 :
                return JSON.stringify({
                    error : false,
                    data : body
                });
            case 400 :
                return JSON.stringify({
                    error : true,
                    message : body.message
                });
            case 401 :
                return JSON.stringify({
                    error : true,
                    message : "Credentials are not valid."
                });
            case 403 :
                return JSON.stringify({
                    error : true,
                    message : "Forbidden pettition."
                });
            case 500 :
                return JSON.stringify({
                    error : true,
                    message : "Server Error or Connection error."
                });
        }
    } else {
        return error;
    }
};

/**
* retrieve data format to client with response and body and error
* response 200 OK
**/
var data_format_updated = function( error, response, body ) {
    if( response ) {
        switch (response.statusCode) {
            case 200 :
                return JSON.stringify({
                    error : false,
                    data : body.data
                });
            case 400 :
                return JSON.stringify({
                    error : true,
                    message : body.message
                });
            case 409 :
                return JSON.stringify({
                    error : true,
                    message : "There was a conflict updating this object."
                });
            case 401 :
                return JSON.stringify({
                    error : true,
                    message : "Credentials are not valid."
                });
            case 403 :
                return JSON.stringify({
                    error : true,
                    message : "Forbidden pettition."
                });
            case 500 :
                return JSON.stringify({
                    error : true,
                    message : "Server Error or Connection error."
                });
        }
    } else {
        return error;
    }
};

/**
* retrieve data format to client with reponse and body error
* reponse 201 CREATED
**/
var data_format_created = function( error, response, body ) {
    if( response ) {
        switch (response.statusCode) {
            case 201 :
                return JSON.stringify({
                    error : false,
                    data : body.message
                });
            case 400 :
                return JSON.stringify({
                    error : true,
                    message : body.message
                });
            case 409 :
                return JSON.stringify({
                    error : true,
                    message : body.message
                });
            case 401 :
                return JSON.stringify({
                    error : true,
                    message : "Credentials are not valid."
                });
            case 403 :
                return JSON.stringify({
                    error : true,
                    message : "Forbidden pettition."
                });
            case 500 :
                return JSON.stringify({
                    error : true,
                    message : "Server Error or Connection error."
                });
        }
    } else {
        return error;
    }
};

/**
* retrieve data format to client with response, body and error
* 204 DELETED
**/
var data_format_deleted = function( error, response, body ) {
    if( response ) {
        switch (response.statusCode) {
            case 204 :
                return JSON.stringify({
                    error : false,
                    data : "Objeto eliminado"
                });
            case 400 :
                return JSON.stringify({
                    error : true,
                    message : body.message
                });
            case 401 :
                return JSON.stringify({
                    error : true,
                    message : "Credentials are not valid."
                });
            case 403 :
                return JSON.stringify({
                    error : true,
                    message : "Forbidden pettition."
                });
            case 500 :
                return JSON.stringify({
                    error : true,
                    message : "Server Error or Connection error."
                });
        }
    } else {
        return error;
    }
};

// Exports magic
module.exports.g_opts = g_opts;
module.exports.get_basic_auth_app_header = get_basic_auth_app_header;
module.exports.get_api_uri = get_api_uri;
module.exports.get_user_basic_auth = get_user_basic_auth;
module.exports.get_basic_auth_w_token = get_basic_auth_w_token;
module.exports.data_format_ok = data_format_ok;
module.exports.data_format_created = data_format_created;
module.exports.data_format_updated = data_format_updated;
module.exports.data_format_deleted = data_format_deleted;
module.exports.data_format_ok_streaming = data_format_ok_streaming;
module.exports.get_business_api_uri = get_business_api_uri;