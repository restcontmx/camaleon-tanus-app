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
                data: [] //required parameter - array with data
                //optional parameter - start sort options
            };
            $scope.reports = [];
            $scope.tabs_grid_options = {
                data : []
            };

            $scope.locations_options = [];
            $scope.locations_options.push( { 'name' : 'ALL', 'location' : {} } );
            $scope.categories_options = [];
            $scope.categories_options.push( { 'name' : 'ALL', 'category' : {} } );

            $scope.get_reports = function() {

                $scope.labels = [];
                $scope.data = [];
                $scope.labels_compare = [];
                $scope.data_compare = [];
                $scope.series_compare = [];
                $scope.progress_ban = true;
                $scope.tabs = [];
                $scope.tabs.length = 0;
                $scope.show_options = false;

                let date_1 = ( $scope.date_start.getMonth() + 1) + '/' + $scope.date_start.getDate() + '/' + $scope.date_start.getFullYear(),
                    date_2 = ( $scope.date_end.getMonth() + 1) + '/' + $scope.date_end.getDate() + '/' + $scope.date_end.getFullYear();
                if( date_1 != undefined && date_2 != undefined ) {
                    CategoryRepository.reportsByDate( date_1, date_2 ).success( function( data ) {
                        if( !data.error ) {
                            $scope.category_reports = data.data.category_reports;
                            $scope.item_reports = data.data.item_reports;
                            $scope.category_reports_all = data.data.categories_all_reports;
                            $scope.gridOptions.data = $scope.category_reports_all;
                            $scope.global_total = $scope.gridOptions.data.map( r => parseFloat( r.total ) ).reduce( ( a, b ) => ( a + b ), 0 );
                            $scope.gridOptions.data.slice(0, 10).forEach( r => {
                                $scope.labels.push( r.cate_name )
                                $scope.data.push( parseFloat( r.total ) )
                            });
                            LocationRepository.getAll().success( function( d1 ) {
                                if( !d1.error ) {
                                    $scope.show_options = true;
                                    $scope.locations = d1.data;
                                    $scope.locations.forEach( l => $scope.locations_options.push( { 'name' : l.location_name, 'location' : l } ) );
                                    $scope.category_reports_all.forEach( c => $scope.categories_options.push( { 'name' : c.cate_name, 'category' : c } ) );
                                    $scope.selectedLocation = $scope.locations_options[0];
                                    set_compare_table();
                                } else {
                                    $scope.errors = d1.message;
                                }
                                $scope.show_options = true;
                                $scope.progress_ban = false;
                            }).error( function( error ) {
                                $scope.errors = error;
                            });
                        } else {
                            $scope.errors = data.error;
                        }
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
                    $scope.tabs_grid_options.data = categoryIndex > 0 ? $scope.item_reports.filter( r => r.item_cate_id == $scope.categories_options[categoryIndex].category.cate_id ) : $scope.item_reports;
                    $scope.tabs_real_data = $scope.tabs_grid_options.data;
                    $scope.selected_report_total = $scope.tabs_grid_options.data.map(r => parseFloat( r.total )).reduce( ( a, b ) => ( a + b ), 0 );
                }
            }));

            $scope.$watch( 'selectedLocation', angular.bind( this, function(locationIndex) {
                if( locationIndex != undefined ) {
                    // Another location
                    $scope.data = [];
                    $scope.labels = [];
                    $scope.gridOptions.data = locationIndex > 0 ? $scope.category_reports.filter( r => r.location == $scope.locations_options[locationIndex].location.id ) : $scope.category_reports_all;
                    $scope.global_total = $scope.gridOptions.data.map( r => parseFloat( r.total ) ).reduce( ( a, b ) => ( a + b ), 0 );
                    $scope.gridOptions.data.slice(0, 10).forEach( r => {
                        $scope.labels.push( r.cate_name )
                        $scope.data.push( parseFloat( r.total ) )
                    });
                }
            }));

            $scope.search_item = function() {
                $scope.tabs_grid_options.data = $scope.tabs_real_data.filter( i => i.item_description.toLowerCase().includes( $scope.searchText.toLowerCase() ) )

            };

            var set_compare_table = function() {
                $scope.locations.forEach( l => {
                    let arr_data = [];
                    let reports = $scope.category_reports.filter( r => r.location == l.id );
                    reports.slice(0, 10).forEach( r => {
                        arr_data.push( parseFloat( r.total ) )
                    });
                    $scope.data_compare.push( arr_data );
                    $scope.series_compare.push( l.location_name );
                });
                for( var i = 10; i > 0 ; i-- ) {
                    $scope.labels_compare.push( i );
                }
            };

        }
    }]);
