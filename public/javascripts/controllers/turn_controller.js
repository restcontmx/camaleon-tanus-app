app
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
    .controller( 'turn-controller', [   '$scope',
                                        'TurnRepository',
                                        'AuthRepository',
                                        '$routeParams',
                                        '$location',
                                        '$mdDialog',
                                        'BusinessRepository',
                                        function(   $scope,
                                                    TurnRepository,
                                                    AuthRepository,
                                                    $routeParams,
                                                    $location,
                                                    $mdDialog,
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
                    $mdDialog.show({
                        controller: TurnUtilsController,
                        templateUrl: '../views/turns/new.html',
                        parent: angular.element(document.body),
                        targetEvent: ev,
                        clickOutsideToClose: true
                    })
                    .then(function () {
                        console.log( "Hide" );
                        getAllTurns();
                    }, function () {
                        console.log( "Cancel" );
                        $scope.status = 'You cancelled the dialog.';
                    });  
                };
            }
            function TurnUtilsController( $scope, $mdDialog ) {
                
                $scope.hide = function() {
                    $mdDialog.hide()
                };
                
                $scope.cancel_save = function() {
                    $mdDialog.cancel();
                };
                
                $scope.accept_save = function() {
                    $scope.progress_ban = true;
                    BusinessRepository.getAll().success( function( response ) {
                        if( !response.error ) {
                            $scope.turn.business_id = response.data[0].id;
                            TurnRepository.add( $scope.turn ).success( function( response_add ) {
                                if( !response_add.error ) { 
                                    $scope.turn = response_add.data;
                                } else {
                                    $scope.errors = response_add.message;
                                }
                                $mdDialog.hide();
                                $scope.progress_ban = false;
                            }).error( function( error ) {
                                $scope.errors = error;
                                $mdDialog.hide();
                                $scope.progress_ban = false;
                            });
                        } else {
                            $scope.errors = response.message;
                        }
                    }).error( function( error ) {
                        $scope.errors = error;
                    });
                    
                };
            }
        }
    }]);