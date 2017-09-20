yukonApp
    .factory( 'TurnRepository', [ 'CRUDService', function( CRUDService ) {
        var model = 'turn';
        return({
            getAll : () => CRUDService.getAll( model ),
            add : ( data ) => CRUDService.add( model, data ),
            getById : ( id ) => CRUDService.getById( model, id ),
            update : ( data ) => CRUDService.update( model, data ),
            remove : ( id ) => CRUDService.remove( model, data )
        });
    }])
    .controller( 'TurnController', [   '$scope',
                                        'TurnRepository',
                                        'AuthRepository',
                                        '$routeParams',
                                        '$location',
                                        'BusinessRepository',
                                        function(   $scope,
                                                    TurnRepository,
                                                    AuthRepository,
                                                    $routeParams,
                                                    $location,
                                                    BusinessRepository  ) {
        if( AuthRepository.viewVerification() ) {

            $scope.progress_ban = false;
            
            var getAllTurns = function() {
                    $scope.progress_ban = true;
                    TurnRepository.getAll().success( function( response ) {
                        if( !response.error ) {
                            $scope.gridOptions.data = response.data;
                            console.log( response.data )
                        } else {
                            $scope.errors = response.message;
                        }$scope.progress_ban = false;
                    }).error( function( error ) {
                        $scope.errors = error;
                        $scope.progress_ban = false;
                    });
                };
            
            if( $routeParams.id ) {

                TurnRepository.getById( $routeParams.id ).success( function( response ) {
                    if( !response.error ) {
                        $scope.turn = response.data;
                    } else {
                        $scope.errors = response.message;
                    }
                }).error( function( error ) {
                    $scope.errors = error;
                });
                
                $scope.edit = function() {
                    TurnRepository.update( $scope.turn ).success( function( response ) {
                        if ( !response.error ) {
                            $scope.turn = response.data;
                        } else {
                            $scope.errors = response.message;
                        }
                    }).error( function( error ) {
                        $scope.errors = error;
                    });
                };

            } else {
                $scope.gridOptions = { data : [] };
                getAllTurns();
                $scope.add = function(ev) { 
                };
            }
        }
    }]);