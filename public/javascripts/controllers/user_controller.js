app
    .factory( 'UserRepository', [ 'CRUDService', function( CRUDService ) {
        var model = 'user';
        return({
            getAll : () => CRUDService.getAll( model ),
            add : ( data ) => CRUDService.add( model, data ),
            getById : ( id ) => CRUDService.getById( model, id ),
            update : ( data ) => CRUDService.update( model, data ),
            remove : ( id ) => CRUDService.remove( model, data ),
            validateData : function( data, scope ) {
                var ban = false;
                scope.errors = "";
                // Set model validations
                return !ban;
            }
        });
    }])
    .controller( 'user-controller', [ '$scope', 'UserRepository', function( $scope, UserRepository ) {
        $scope.title = "User Dashboard";

    }]);
