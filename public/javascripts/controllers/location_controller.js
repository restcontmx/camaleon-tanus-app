yukonApp
    .factory( 'LocationRepository', [ '$http', 'CRUDService', function( $http, CRUDService ) {
        var model = 'location';
        return({
            getAll : () => CRUDService.getAll( model + '/byuser' ),
            add : ( data ) => CRUDService.add( model, data ),
            getById : ( id ) => CRUDService.getById( model, id ),
            update : ( data ) => CRUDService.update( model, data ),
            remove : ( id ) => CRUDService.remove( model, data ),
            getAllByBusiness : ( business_id ) => $http.get( '/' + model + '/bybusiness/' + business_id ),
            getLocationTodayReports : ( d1, d2 ) => $http.get( '/reports/' + model + '/?d1=' + d1 + '&d2=' + d2 ),
            lastCloses : () => $http.get( '/location/lastcloses/' )
        });
    }])
    .controller( 'location-controller', [   '$scope',
                                            '$rootScope',
                                            '$routeParams',
                                            '$location',
                                            'LocationRepository',
                                            'AuthRepository',
                                            function(   $scope,
                                                        $rootScope,
                                                        $routeParams,
                                                        $location,
                                                        LocationRepository,
                                                        AuthRepository  ) {
        if( AuthRepository.viewVerification() ) {

            $scope.title = "Locations";

            var getAllLocations = function() {
                LocationRepository.getAll().success( function( data ) {
                    if( !data.error ) {
                        $scope.locations_table = data.data;
                        $scope.locations = $scope.locations_table;
                    } else {
                        $scope.errors = data.message;
                    }
                }).error( function( error ) {
                    $scope.errors = error;
                });
            };

            if( $routeParams.id ) {

                LocationRepository.getById( $routeParams.id ).success( function( data ) {
                    if(!data.error) {
                        $scope.location = data.data;
                    } else {
                        $scope.errors = data.message;
                    }
                }).error( function( error ) {
                    $scope.errors = error;
                });

                $scope.update = function() {
                    LocationRepository.update( $scope.location ).success( function( data ) {
                        if( !data.error ) {
                            $scope.location = data.data;
                            $location.path( '/location/' );
                        } else {
                            $scope.errors = data.message;
                        }
                    }).error( function( error ) {
                        $scope.errors = error;
                    });
                }

            } else {

                $scope.location = {
                    name : "",
                    bussines_id : 0
                }

                $scope.add_from_business = function() {
                    $scope.location.bussines_id = $rootScope.global_business.id;
                    LocationRepository.add( $scope.location ).success( function( data ) {
                        if( !data.error ) {
                            $scope.business = data.data;
                            $location.path( '/business/' + $rootScope.global_business.id );
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
