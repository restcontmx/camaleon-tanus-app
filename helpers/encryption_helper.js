'use strict';

var fs = require( 'fs' ),
    ursa = require( 'ursa' ),
    crt, server_pub_key, client_pub_key, client_priv_key, msg;

server_pub_key = ursa.createPublicKey( fs.readFileSync( './certs/server_rsa.pub' ) );
client_pub_key = ursa.createPublicKey( fs.readFileSync( './certs/client_admin_balpres.pub' ) );
client_priv_key = ursa.createPrivateKey( fs.readFileSync( './certs/client_admin_balpres.key.pem' ) );

/**
* encrypt data sended as json format
**/
var encrypt_json_msg = ( data ) => server_pub_key.encrypt( JSON.stringify( data ), 'utf8', 'base64' );

/**
* encrypt long data
* this will encrypt the data in several peaces on an array
**/
var encrypt_long_data = function( data ) {
    var str_data = JSON.stringify( data );
    if( str_data.length < 200 ) {
        return [ server_pub_key.encrypt( str_data, 'utf8', 'base64' ) ];
    } else {
        var data_length = str_data.length, count = data_length / 200, div_data = [];
        while( count >= 1 ) {
            div_data.push( server_pub_key.encrypt( str_data.slice( 0, 200 ), 'utf8', 'base64' ) );
            str_data = str_data.slice( 200, str_data.length );
            count--;
        }
        div_data.push( server_pub_key.encrypt( str_data, 'utf8', 'base64' ) );
        return div_data;
    }
};

/**
* this will decrypt the data on an array
* every object of the array is a peace of the data
* sended by the server
**/
var decrypt_long_data = function( data ) {
    var final_json = "";
    for( var i = 0; i < data.length; i++ ) {
        final_json = final_json.concat( client_priv_key.decrypt( data[i], 'base64', 'utf8', ursa.RSA_PKCS1_OAEP_PADDING ) );
    }
    return JSON.parse( final_json );
};

/**
* decrypt data and return it as json
**/
var descrypt_json_msg = ( data ) => JSON.parse( client_priv_key.decrypt( data, 'base64', 'utf8', ursa.RSA_PKCS1_OAEP_PADDING ) );

/**
* encrypt cookie token
**/
var encrypt_cookie_token = ( token ) => client_pub_key.encrypt( token, 'utf8', 'base64' );

/**
* decrypt an encrypted cookie token
**/
var decrypt_cookie_token = ( en_token ) => client_priv_key.decrypt( en_token, 'base64', 'utf8' );

/**
* encrypt with private key on the client side
* tis will mainly be or test
**/
var encrypt_with_priv_test = ( data ) => client_pub_key.encrypt( JSON.stringify( data ), 'utf8', 'base64' );

/**
* decrypt with private key on the client side
* this will mainly be for test
**/
var decrypt_with_priv_test = ( data ) => JSON.parse( client_priv_key.decrypt( data, 'base64', 'utf8' ) );

// function exports
module.exports.encryptJSON = encrypt_json_msg;
module.exports.decryptJSON = descrypt_json_msg;

module.exports.encryptCookie = encrypt_cookie_token;
module.exports.decryptCookie = decrypt_cookie_token;

module.exports.encryptLongJSON = encrypt_long_data;
module.exports.decryptLongJSON = decrypt_long_data;

module.exports.encrypt_test = encrypt_with_priv_test;
module.exports.decrypt_test = decrypt_with_priv_test;
