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

            $scope.progress_ban = false;

            $scope.get_reports = function() {

                $scope.labels = [];
                $scope.data = [];
                $scope.progress_ban = true;
                $scope.tabs = [];
                let date_1 = ( $scope.date_start.getMonth() + 1) + '/' + $scope.date_start.getDate() + '/' + $scope.date_start.getFullYear(),
                    date_2 = ( $scope.date_start.getMonth() + 1) + '/' + $scope.date_start.getDate() + '/' + $scope.date_start.getFullYear();
                if( date_1 != undefined && date_2 != undefined ) {
                    CategoryRepository.reportsByDate( date_1, date_2 ).success( function( data ) {
                        if( !data.error ) {
                            $scope.reports = data.data;
                            $scope.global_total = $scope.reports.map( r => ( r.vta_neta + r.tax1 + r.tax2 + r.tax3 ) ).reduce( ( a, b ) => ( a + b ), 0 );
                            $scope.reports.forEach( r => {
                                $scope.labels.push( r.category.Cate_Name )
                                $scope.data.push( r.vta_neta + r.tax1 + r.tax2 + r.tax3 )
                                r.total = r.vta_neta + r.tax1 + r.tax2 + r.tax3
                                r.item_reports.forEach( i => i.total = ( i.sale_price * i.qty ) + i.tax1 + i.tax2 + i.tax3)
                                $scope.tabs.push( { 'report' : r } )
                            });
                        } else {
                            $scope.errors = data.error;
                        } $scope.progress_ban = false;
                    }).error( function( error ) {
                        $scope.errors = error;
                        $scope.progress_ban = false;
                    });
                } else {
                    alert( "Please select two dates!" );
                }
            }
        }
    }]);
