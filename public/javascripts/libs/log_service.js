angular.module( 'log-service', [])
    .service( 'LogService', [ '$http', function( $http ) {
        
        this.getActive = function( model ) {
            return $http.get(  '/logs/' + model + '/active/' );
        };

        this.getInactive = function( model ) {
            return $http.get(  '/logs/' + model + '/inactive/' );
        };

        this.update = function( model, data ) {
            return $http.put( '/logs/' + model + '/', JSON.stringify( data ) );
        };
        
        this.revert = function( model, id ) {
            return $http.put( '/logs/' + model + '/revert/' + id );
        };

        this.delete_itemchange = function( id ) {
            return $http.delete( '/itemchange/' + id );
        };

    }]);