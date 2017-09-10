angular.module( 'log-service', [])
    .service( 'LogService', [ '$http', function( $http ) {
        this.update = function( model, data ) {
            return $http.put( '/logs/' + model + '/', JSON.stringify( data ) );
        };
    }]);