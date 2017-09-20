yukonApp
    .factory( 'BusinessRepository', [ 'CRUDService', function( CRUDService ) {
        var model = 'bussines';
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
    .controller( 'business-controller', [   '$scope',
                                            '$rootScope',
                                            '$routeParams',
                                            '$location',
                                            'BusinessRepository',
                                            'LocationRepository',
                                            'AuthRepository',
                                            function(   $scope,
                                                        $rootScope,
                                                        $routeParams,
                                                        $location,
                                                        BusinessRepository,
                                                        LocationRepository,
                                                        AuthRepository  ) {
        if( AuthRepository.viewVerification() ) {

            $scope.title = "Businesses";

            var getAllBusiness = function() {
                    BusinessRepository.getAll().success( function( data ) {
                        if( !data.error ) {
                            $scope.businesses_table = data.data;
                            $scope.businesses = $scope.businesses_table;
                        } else {
                            $scope.errors = data.message;
                        }
                    }).error( function( error ) {
                        $scope.errors = error;
                    });
                },
                getAllLocations = function( business_id ) {
                    LocationRepository.getAllByBusiness( business_id ).success( function( data ) {
                        if( !data.error ) {
                            $scope.locations_table = data.data;
                            $scope.locations = $scope.locations_table;
                        } else {
                            $scope.errors = data.message;
                        }
                    }).error( function( error ) {
                        $scope.errors = error;
                    });
                }

            if( $routeParams.id ) {

                BusinessRepository.getById( $routeParams.id ).success( function( data ) {
                    if(!data.error) {
                        $scope.business = data.data;
                        $rootScope.global_business = $scope.business;
                        getAllLocations( $routeParams.id );
                    } else {
                        $scope.errors = data.message;
                        $location.path( '/business/' )
                    }
                }).error( function( error ) {
                    $scope.errors = error;
                });

                $scope.update = function() {
                    BusinessRepository.update( $scope.business ).success( function( data ) {
                        if( !data.error ) {
                            $scope.business = data.data;
                            $location.path( '/business/' );
                        } else {
                            $scope.errors = data.message;
                        }
                    }).error( function( error ) {
                        $scope.errors = error;
                    });
                }

            } else {
                $scope.business = {
                    name : "",
                    description : ""
                }

                getAllBusiness();

                $scope.add = function() {
                    BusinessRepository.add( $scope.business ).success( function( data ) {
                        if( !data.error ) {
                            $scope.business = data.data;
                            $location.path( '/business/' );
                        } else {
                            $scope.errors = data.message;
                        }
                    }).error( function( error ) {
                        $scope.errors = error;
                    });
                }
            }
        }
    }]);
