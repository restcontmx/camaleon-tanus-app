app
    .factory( 'CategoryRepository', [ '$http', function( $http ) {
        var model = 'it_tcategory';
        return({
            reportsByDate : ( d1, d2, turn_id ) => $http.get( '/reports/' + model + '/?d1=' + d1 + '&d2=' + d2 + '&turn=' + turn_id )
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
                                                    'TurnRepository',
                                                    'AuthRepository',
                                                    '$mdDialog',
                                                    function(   $scope,
                                                                CategoryRepository,
                                                                LocationRepository,
                                                                $q,
                                                                $log,
                                                                TurnRepository,
                                                                AuthRepository,
                                                                $mdDialog   ) {
        if( AuthRepository.viewVerification() ) {

            $scope.progress_ban = false;
            $scope.selectedIndex = 0;
            
            $scope.gridOptions = {
                data: []
            };
            $scope.reports = [];
            $scope.tabs_grid_options = {
                data : []
            };

            let todays = new Date();
            $scope.date_end = new Date();
            todays.setDate( 1 );
            $scope.date_start = todays;
            $scope.turn_options = Array.of( { 'name' : 'All', 'turn' : { 'id' : 0 } } );
            $scope.selectedTurn = 0;

            TurnRepository.getAll().success( function( response ) {
                if( !response.error ) {
                    $scope.turns = response.data;
                    $scope.turns.forEach( t => $scope.turn_options.push( { 'name' : t.name, 'turn' : t } ));
                } else {
                    $scope.errors = response.message;
                }
            }).error( function( error ) {
                $scope.errors = error;
            });

            $scope.get_reports = function() {

                $scope.locations_options = Array.of( { 'name' : 'ALL', 'location' : {} } );
                $scope.labels = [];
                $scope.data = [];
                $scope.labels_compare = [];
                $scope.data_compare = [];
                $scope.series_compare = [];
                $scope.labels_locations = [];
                $scope.data_locations = [];
                $scope.progress_ban = true;
                $scope.tabs = [];
                $scope.tabs.length = 0;
                $scope.show_options = false;
                $scope.categories_options = [];
                $scope.categories_options.push( { 'name' : 'ALL', 'category' : {} } );

                let date_1  = ( $scope.date_start.getMonth() + 1) + '/' + $scope.date_start.getDate() + '/' + $scope.date_start.getFullYear(),
                    date_2  = ( $scope.date_end.getMonth() + 1) + '/' + $scope.date_end.getDate() + '/' + $scope.date_end.getFullYear(),
                    turn_id = $scope.turn_options[$scope.selectedTurn].turn.id;

                if( date_1 != undefined && date_2 != undefined ) {
                    CategoryRepository.reportsByDate( date_1, date_2, turn_id ).success( function( data ) {
                        if( !data.error ) {
                            $scope.category_reports = data.data.category_reports;
                            $scope.item_reports = [];
                            $scope.category_reports_all = data.data.category_reports_all;
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
                                    $scope.locations.forEach( l => {
                                        $scope.locations_options.push( { 'name' : l.location_name, 'location' : l } )
                                        $scope.labels_locations.push( l.location_name );
                                        $scope.data_locations.push( $scope.category_reports.filter( r => r.location == l.id ).map( r => parseFloat( r.total ) ).reduce( ( a, b ) => ( a + b ), 0 ) );
                                    });
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
            };

            $scope.get_reports();

            $scope.$watch('selectedCategory', angular.bind(this, function(categoryIndex) {
                if( categoryIndex != undefined ) {
                    $scope.tabs_grid_options.data = categoryIndex > 0 ? $scope.item_reports.filter( r => r.item_cate_id == $scope.categories_options[categoryIndex].category.cate_id ) : $scope.item_reports;
                    $scope.tabs_real_data = $scope.tabs_grid_options.data;
                    $scope.selected_report_total = $scope.tabs_grid_options.data.map(r => parseFloat( r.total )).reduce( ( a, b ) => ( a + b ), 0 );
                }
            }));

            $scope.$watch( 'selectedLocation', angular.bind( this, function(locationIndex) {
                if( locationIndex != undefined ) {
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

            $scope.export = function (ev) {
                $mdDialog.show({
                    controller: ExportController,
                    templateUrl: '../views/reports/export_settings.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    clickOutsideToClose: true
                })
                .then(function () {
                    console.log( "Hide" );
                }, function () {
                    console.log( "Cancel" );
                    $scope.status = 'You cancelled the dialog.';
                });
            };
            
            function ExportController( $scope, $rootScope, $mdDialog ) {
                $rootScope.documents = {
                    word : false,
                    excel : false, 
                    pdf : false,
                    text : false
                }
                $scope.hide = function() {
                    $mdDialog.hide();
                };

                $scope.cancel_export = function() {
                    $mdDialog.cancel();
                };

                $scope.accept_export = function() {
                    $mdDialog.hide();
                };
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
