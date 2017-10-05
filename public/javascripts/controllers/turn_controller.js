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
    .controller( 'TurnController', [    '$scope',
                                        '$rootScope',
                                        'TurnRepository',
                                        'AuthRepository',
                                        '$routeParams',
                                        '$location',
                                        'BusinessRepository',
                                        'growl',
                                        function(   $scope,
                                                    $rootScope,
                                                    TurnRepository,
                                                    AuthRepository,
                                                    $routeParams,
                                                    $location,
                                                    BusinessRepository,
                                                    growl  ) {
        if( AuthRepository.viewVerification() ) {

            $scope.progress_ban = false;
            var initTurn = function() {
                    $scope.turn = {
                        name : "",
                        description : "",
                        time_start : "00:00",
                        time_end : "23:59",
                        business_id : $rootScope.user_info.business.id
                    }
                },
                getAllTurns = function() {
                    $scope.progress_ban = true;
                    TurnRepository.getAll().success( function( response ) {
                        if( !response.error ) {
                            $scope.turns = response.data;
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
                $scope.initNew = function() {
                    
                    $('.clockpicker').clockpicker();
                    initTurn();

                    $scope.add = function() { 
                        TurnRepository.add( $scope.turn ).success( function( response ){
                            if( !response.error ) {
                                initTurn();
                                growl.success( "Turn successfuly added.", {});
                            } else {
                                growl.error( "There was an error;" + response.message, {});
                            }
                        }).error( function( error ) {
                            growl.error( "There was an error;" + error, {});
                        });
                    };          
                }
                $scope.initList = function() {
                    getAllTurns();
                }      
            }
        }
    }]);