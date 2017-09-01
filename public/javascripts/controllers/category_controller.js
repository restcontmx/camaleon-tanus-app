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
                                                    '$q',
                                                    '$log',
                                                    'AuthRepository',
                                                    function(   $scope,
                                                                CategoryRepository,
                                                                LocationRepository,
                                                                $q,
                                                                $log,
                                                                AuthRepository  ) {
        if( AuthRepository.viewVerification() ) {

            $scope.progress_ban = false;
            $scope.selectedIndex = 0;

            $scope.gridOptions = {
                data: [], //required parameter - array with data
                //optional parameter - start sort options
                sort: {
                    predicate: 'total',
                    direction: 'des'
                }
            };
            $scope.reports = [];
            $scope.tabs_grid_options = {
                data : [],
                sort: {
                    predicate: 'total',
                    direction: 'des'
                }
            };

            $scope.get_reports = function() {

                $scope.labels = [];
                $scope.data = [];
                $scope.progress_ban = true;
                $scope.tabs = [];
                $scope.tabs.length = 0;
                $scope.show_options = false;

                let date_1 = ( $scope.date_start.getMonth() + 1) + '/' + $scope.date_start.getDate() + '/' + $scope.date_start.getFullYear(),
                    date_2 = ( $scope.date_end.getMonth() + 1) + '/' + $scope.date_end.getDate() + '/' + $scope.date_end.getFullYear();
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
                            });
                            $scope.gridOptions.data = $scope.reports;
                            LocationRepository.getAll().success( function( d1 ) {
                                if( !d1.error ) {
                                    $scope.show_options = true;
                                    $scope.locations = d1.data;
                                } else {
                                    $scope.errors = d1.message;
                                }
                            }).error( function( error ) {
                                $scope.errors = error;
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

            $scope.$watch('selectedCategory', angular.bind(this, function(categoryIndex) {
                if( categoryIndex != undefined ) {
                    $scope.tabs = $scope.gridOptions.data[categoryIndex] != undefined ? $scope.gridOptions.data[categoryIndex].item_reports : [];
                    $scope.selected_report = $scope.gridOptions.data[categoryIndex] != undefined ? $scope.gridOptions.data[categoryIndex] : [];
                    $scope.tabs_grid_options.data = $scope.tabs;
                    $scope.selectedIndex = categoryIndex;
                    $scope.searchText = "";
                }
            }));

            $scope.$watch( 'selectedLocation', angular.bind( this, function(locationIndex) {
                if( locationIndex != undefined ) {
                    $scope.gridOptions.data = $scope.reports.filter( r => r.location == $scope.locations[$scope.selectedLocation].id );
                    $scope.global_total = $scope.gridOptions.data.map( r => ( r.vta_neta + r.tax1 + r.tax2 + r.tax3 ) ).reduce( ( a, b ) => ( a + b ), 0 );
                    $scope.selectedCategory = 0;
                }
            }));

            $scope.search_item = function() {
                $scope.tabs = $scope.reports[$scope.selectedIndex].item_reports;
                $scope.selected_report = $scope.reports[$scope.selectedIndex];
                $scope.tabs_grid_options.data = $scope.tabs.filter( i => i.description.toLowerCase().includes( $scope.searchText.toLowerCase() ) )
            };
        }
    }]);
