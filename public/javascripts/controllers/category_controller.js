app
    .factory( 'CategoryRepository', [ '$http', function( $http ) {
        var model = 'it_tcategory';
        return({
            reportsByDate : ( d1, d2 ) => $http.get( '/reports/' + model + '/?d1=' + d1 + '&d2=' + d2 )
        });
    }])
    .controller( 'category-controller', [   '$scope',
                                            'LocationRepository',
                                            'AuthRepository',
                                            function(   $scope,
                                                        LocationRepository,
                                                        AuthRepository  ) {
        if( AuthRepository.viewVerification() ) {
            LocationRepository.getAll().success( function( data ) {
                if( !data.error ) {
                    $scope.locations = data.data;
                } else {
                    $scope.errors = data.message;
                }
            }).error( function( error ) {
                $scope.errors = error;
            });
        }
    }])
    .controller('category-reports-controller', [    '$scope',
                                                    'CategoryRepository',
                                                    'LocationRepository',
                                                    'AuthRepository',
                                                    function(   $scope,
                                                                CategoryRepository,
                                                                LocationRepository,
                                                                AuthRepository  ) {
        if( AuthRepository.viewVerification() ) {

            $scope.labels = [];
            $scope.data = [];

            CategoryRepository.reportsByDate( "asd", "awfwe" ).success( function( data ) {
                if( !data.error ) {
                    $scope.reports = data.data;
                    $scope.reports.forEach( r => {
                        $scope.labels.push( r.category.Cate_Name );
                        $scope.data.push( r.total );
                    });
                    $scope.global_total = $scope.reports.map( r => r.total ).reduce( ( a, b ) => ( a + b ), 0 );
                } else {
                    $scope.errors = data.error;
                }
            }).error( function( error ) {
                $scope.errors = error;
            });
        }
    }]);
