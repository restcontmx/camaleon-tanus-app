angular.module( 'crud-service', [])
    .service( 'CRUDService', [ '$http', function( $http ) {
        this.getAll = function( model ) {
            return $http.get( '/' + model );
        };
        this.getBunch = function( model ) {
            return $http.get( '/' + model );
        };
        this.add = function( model, data ) {
            return $http.post( '/' + model, JSON.stringify( data ) );
        };
        this.getById = function( model, id ) {
            return $http.get( '/' + model + '/' + id );
        };
        this.update = function( model, data ) {
            return $http.put( '/' + model + '/' + data.id, JSON.stringify( data ) );
        };
        this.updateBunch = function( route, data ) {
            return $http.put( '/' + route + '/', JSON.stringify( data ) );
        };
        this.remove = function( model, id ) {
            return $http.delete( '/' + model + '/' + id )
        }
    }]);
