yukonApp
    .factory( 'TicketRepository', [ '$http', function( $http ) {
        return({
            getReports : ( d1, d2, loc ) => $http.get( '/reports/ticket/?d1=' + d1 + '&d2=' + d2 + '&loc=' + loc + '&turn=0' ),
            getDetails : ( ticket, loc ) => $http.get( '/reports/ticket/details/?ticket=' + ticket + '&loc=' + loc ),
            getDummyReports : ( d1, d2, p, loc ) => $http.get( '/reports/dummy/?d1=' + d1 + '&d2=' + d2 + '&loc=' + loc + '&turn=0' )            
        })
    }])
    .controller( 'ticket-reports-controller', [ '$scope',
                                                'TicketRepository',
                                                'LocationRepository',
                                                'AuthRepository',
                                                '$rootScope',
                                                'uiGridConstants',
                                                function(   $scope,
                                                            TicketRepository,
                                                            LocationRepository,
                                                            AuthRepository,
                                                            $rootScope,
                                                            uiGridConstants  ) {
        if( AuthRepository.viewVerification() ) {

            $scope.progress_ban = false;
            $scope.loading_details = false;
            $rootScope.p = 0;
            $rootScope.loc = 0;
            $scope.locations_options = [];
            $scope.locations_options.push( { 'name' : 'ALL', 'location' : { 'id' : 0 } } );
            $rootScope.selected_item = { 'detamoves' : [] };

            $scope.gridOptions = {
                enableRowSelection: true, enableRowHeaderSelection: false,
                enableSorting: true,
                showGridFooter: true,
                enableGridMenu: true,
                enableFiltering: true,
                paginationPageSizes: [25, 50, 75],
                paginationPageSize: 25,
                columnDefs: [
                    { field: 'move_id' },
                    { field: 'move_date' },
                    { field: 'total', enableSorting: true }
                ]
            };

            $scope.gridOptions.multiSelect = false;
            $scope.gridOptions.modifierKeysToMultiSelect = false;
            $scope.gridOptions.noUnselect = true;
            $scope.gridOptions.onRegisterApi = function( gridApi ) {
                $scope.gridApi = gridApi;
                gridApi.selection.on.rowSelectionChanged($scope,function(row){
                    $rootScope.grid_action( row.entity );
                });
            };

            let todays = new Date();
            $scope.date_end = new Date();
            todays.setDate( 1 );
            $scope.date_start = todays;
            $scope.date_start.setHours( "00" );
            $scope.date_start.setMinutes( "00" );
            $scope.date_start.setSeconds( "00" );
            $scope.date_end.setHours( "23" );
            $scope.date_end.setMinutes( "59" );
            $scope.date_end.setSeconds( "59" );

            $scope.date_range = {
                today: moment().format('MMMM D, YYYY'),
                last_month: moment().subtract('M', 1).format('MMMM D, YYYY'),
                date_start : $scope.date_start,
                date_end : $scope.date_end
            };

            if ($("#drp_predefined").length) {
				$('#drp_predefined').daterangepicker(
                    {
                        timePicker: true,
                        timePicker24Hour: true,
                        ranges: {
                            'Today': [moment(), moment()],
                            'Yesterday': [moment().subtract('days', 1), moment().subtract('days', 1)],
                            'Last 7 Days': [moment().subtract('days', 6), moment()],
                            'Last 30 Days': [moment().subtract('days', 29), moment()],
                            'This Month': [moment().startOf('month'), moment().endOf('month')],
                            'Last Month': [moment().subtract('month', 1).startOf('month'), moment().subtract('month', 1).endOf('month')]
                        },
                        startDate: moment().subtract('days', 6),
                        endDate: moment()
                    },
                    function(start, end) {
                        $('#drp_predefined span').html(start.format("MM/DD/YYYY HH:mm:ss") + ' - ' + end.format("MM/DD/YYYY HH:mm:ss"));
                        $scope.date_range.date_start = new Date( start.format("MM/DD/YYYY HH:mm:ss") );
                        $scope.date_range.date_end = new Date( end.format("MM/DD/YYYY HH:mm:ss") );
                    }
				);
            }

            LocationRepository.getAll().success( function( data ) {
                if( !data.error ) {
                    $scope.locations = data.data;
                    $scope.locations.forEach( l => $scope.locations_options.push( { 'name' : l.location_name, 'location' : l  } ) );
                } else {
                    $scope.errors = data.message;
                }
            }).error( function( error ) {
                $scope.errors = error;
            });

            
            
            $scope.get_reports = function( p ) {
                $scope.progress_ban = true;
                $rootScope.selected_item = { 'detamoves' : [] };
                let date_1 = ( $scope.date_range.date_start.getMonth() + 1) + '/' + $scope.date_range.date_start.getDate() + '/' + $scope.date_range.date_start.getFullYear() + ' ' + $scope.date_range.date_start.getHours() + ':' + $scope.date_range.date_start.getMinutes() + ':' + $scope.date_range.date_start.getSeconds(),
                    date_2 = ( $scope.date_range.date_end.getMonth() + 1) + '/' + $scope.date_range.date_end.getDate() + '/' + $scope.date_range.date_end.getFullYear() + ' ' + $scope.date_range.date_end.getHours() + ':' + $scope.date_range.date_end.getMinutes() + ':' + $scope.date_range.date_end.getSeconds();
                if( date_1 != undefined && date_2 != undefined ) {
                    TicketRepository.getReports( date_1,  date_2, $rootScope.loc ).success( function( data ) {
                        if( !data.error ) {
                            $scope.tickets = data.data.data;
                            $scope.gridOptions.data = $scope.tickets;
                        } else {
                            $scope.errors = data.message;
                        } $scope.progress_ban = false;
                    }).error( function( error ) {
                        $scope.errors = error;
                    });
                }
            };
            
            $scope.customActions = { };
            $scope.customActions.refresh = $scope.reload_table;

            $scope.back = function() {
                $rootScope.p > 0 ? $scope.get_reports( $rootScope.p - 1 ) : false
            };

            $rootScope.next = function() {
                ( $rootScope.p < ( $rootScope.count / 20 ) ) ? $scope.get_reports( $rootScope.p + 1 ) : false
            };

            $rootScope.grid_action = function( item ) {
                $scope.loading_details = true;
                TicketRepository.getDetails( item.move_id, item.location ).success( function( data ) {
                    if( !data.error ) {
                        $rootScope.selected_item = item;
                        $rootScope.selected_item.detamoves = data.data;
                        $rootScope.selected_item.sub_total = parseFloat($rootScope.selected_item.sub_total);
                        $rootScope.selected_item.total = parseFloat($rootScope.selected_item.total);
                        $rootScope.selected_item.tax1 = parseFloat($rootScope.selected_item.tax1);
                        $rootScope.selected_item.tax2 = parseFloat($rootScope.selected_item.tax2);
                        $rootScope.selected_item.tax3 = parseFloat($rootScope.selected_item.tax3);
                    } else {
                        $scope.errors = data.message;
                    }$scope.loading_details = false;
                }).error( function( error ) {
                    $scope.errors = error;
                    $scope.loading_details = false;
                });
            };

            $scope.$watch( 'selectedLocation', angular.bind( this, function(locationIndex) {
                if( locationIndex != undefined ) {
                    $rootScope.loc = $scope.locations_options[locationIndex].location.id;
                }
            }));
        }
    }]);
