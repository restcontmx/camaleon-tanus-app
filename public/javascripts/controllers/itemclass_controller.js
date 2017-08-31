app
    .factory( 'ItemClassRepository', [ '$http', function( $http ) {
        var model = 'it_titemclass';
        return({
            reportsByDate : ( d1, d2 ) => $http.get( '/reports/' + model + '/?d1=' + d1 + '&d2=' + d2 )
        });
    }])
    .controller( 'itemclass-controller', [  '$scope',
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
    .controller('itemclass-reports-controller', [   '$scope',
                                                    'ItemClassRepository',
                                                    'AuthRepository',
                                                    function(   $scope,
                                                                ItemClassRepository,
                                                                AuthRepository  ) {
        if( AuthRepository.viewVerification() ) {

            $scope.progress_ban = false;

            $scope.gridOptions = {
                data: [], //required parameter - array with data
                //optional parameter - start sort options
                sort: {
                    predicate: 'companyName',
                    direction: 'asc'
                }
            };
            $scope.reports = [];
            $scope.tabs_grid_options = {
                data : [],
                sort: {
                    predicate: 'companyName',
                    direction: 'asc'
                }
            };

            $scope.get_reports = function() {

                $scope.labels = [];
                $scope.data = [];
                $scope.progress_ban = true;
                $scope.tabs = [];
                $scope.tabs.length = 0;

                let date_1 = ( $scope.date_start.getMonth() + 1) + '/' + $scope.date_start.getDate() + '/' + $scope.date_start.getFullYear(),
                    date_2 = ( $scope.date_end.getMonth() + 1) + '/' + $scope.date_end.getDate() + '/' + $scope.date_end.getFullYear();
                if( date_1 != undefined && date_2 != undefined ) {
                    ItemClassRepository.reportsByDate( date_1, date_2 ).success( function( data ) {
                        if( !data.error ) {
                            $scope.reports = data.data;
                            $scope.global_total = $scope.reports.map( r => ( r.vta_neta + r.tax1 + r.tax2 + r.tax3 ) ).reduce( ( a, b ) => ( a + b ), 0 );
                            $scope.reports.forEach( r => {
                                $scope.labels.push( r.item_class.Class_Name )
                                $scope.data.push( r.vta_neta + r.tax1 + r.tax2 + r.tax3 )
                                r.total = r.vta_neta + r.tax1 + r.tax2 + r.tax3
                                r.item_reports.forEach( i => i.total = ( i.sale_price * i.qty ) + i.tax1 + i.tax2 + i.tax3)
                            });
                            $scope.gridOptions.data = $scope.reports;
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

            $scope.$watch('selectedClass', angular.bind(this, function(classIndex) {
                if( classIndex != undefined ) {
                    $scope.tabs = $scope.reports[classIndex].item_reports;
                    $scope.selected_report = $scope.reports[classIndex];
                    $scope.tabs_grid_options.data = $scope.tabs;
                }
            }));
        }
    }]);
