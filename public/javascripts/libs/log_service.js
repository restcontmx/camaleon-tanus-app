angular.module( 'log-service', [])
    .service( 'LogService', [ '$http', function( $http ) {
        this.getActive = function( model ) {
            return $http.get(  '/logs/' + model + '/active/' );
        };
        this.update = function( model, data ) {
            return $http.put( '/logs/' + model + '/', JSON.stringify( data ) );
        };
    }]);