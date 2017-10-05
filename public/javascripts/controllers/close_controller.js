yukonApp
    .factory( 'CloseRepository',  [ '$http',  function( $http ) {
        var model = "it_tclose"
        return({
            reportsByDate : ( d1, d2, turn_id ) => $http.get( '/reports/' + model + '/?d1=' + d1 + '&d2=' + d2 + '&turn=' + turn_id ) 
        });
    }])
    .controller( 'close-reports-controller', [  '$scope', 
                                                '$rootScope', 
                                                'AuthRepository',
                                                'CloseRepository',
                                                'TurnRepository',
                                                'LocationRepository', 
                                                function(   $scope,
                                                            $rootScope,
                                                            AuthRepository,
                                                            CloseRepository,
                                                            TurnRepository,
                                                            LocationRepository ) {
        if( AuthRepository.viewVerification() ) {
            let todays = new Date();
            $scope.hideGrid = false;
            $scope.date_end = new Date();
            todays.setDate( 1 );
            $scope.date_start = todays;
            $scope.date_start.setHours( "00" );
            $scope.date_start.setMinutes( "00" );
            $scope.date_start.setSeconds( "00" );
            $scope.date_end.setHours( "23" );
            $scope.date_end.setMinutes( "59" );
            $scope.date_end.setSeconds( "59" );
            $scope.full_table_display = true;
            $scope.progress_ban = true; // This is for the loanding simbols or whatever you want to activate
            $scope.detail_progress = false;
            $scope.turn_options = Array.of( { text : 'All',  id : 0 } );
            // Table grid options
            $scope.gridOptions = {
                enableRowSelection: true, enableRowHeaderSelection: false,
                enableSorting: true,
                showGridFooter: true,
                enableGridMenu: true,
                enableFiltering: true,
                paginationPageSizes: [25, 50, 75],
                paginationPageSize: 25,
                columnDefs: [
                    { field: 'close_id', enableSorting: true },
                    { field: 'date' },
                    { field: 'time' },
                    { field: 'register_id' },
                    { field: 'system_amount' },
                    { field: 'cashier_amount' },
                    { field: 'difference', enableSorting: true }
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
            // Grid action for selected rows
            $rootScope.grid_action = function( row ) {
                // Selected row option
            };
            // Date range variable
            // the important ones area start and end which are already conffigured on the scope
            $scope.date_range = {
                today: moment().format('MMMM D, YYYY'),
                last_month: moment().subtract('M', 1).format('MMMM D, YYYY'),
                date_start : $scope.date_start,
                date_end : $scope.date_end
            };
            // Date range picker settings
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
                        // When selected the datepicker returns a moment object; this just formats everything to what we need
                        $scope.date_range.date_start = new Date( start.format("MM/DD/YYYY HH:mm:ss") );
                        $scope.date_range.date_end = new Date( end.format("MM/DD/YYYY HH:mm:ss") );
                    }
				);
            }
            // Get all the turns
            // Then addthem to the turns select
            // Its on jquery, so be careful
            TurnRepository.getAll().success( function( response ) {
                if( !response.error ) {
                    $scope.turns = response.data;
                    $scope.turns.forEach( t => $scope.turn_options.push( { text : t.name, id : t.id } ));
                    $("#turns_select").select2({
                        placeholder: "Select Turn...",
                        data : $scope.turn_options
                    });
                    $( '#turns_select' ).val(0);
                } else {
                    $scope.errors = response.message;
                }
            }).error( function( error ) {
                $scope.errors = error;
            });
            // Get reports
            // Function that sets all the reports by date range and turn
            $scope.get_reports = function() {
                $scope.progress_ban = true;
                $scope.full_table_display = true;

                let date_1  = ( $scope.date_range.date_start.getMonth() + 1) + '/' + $scope.date_range.date_start.getDate() + '/' + $scope.date_range.date_start.getFullYear() + ' ' + $scope.date_range.date_start.getHours() + ':' + $scope.date_range.date_start.getMinutes() + ':' + $scope.date_range.date_start.getSeconds(),
                    date_2  = ( $scope.date_range.date_end.getMonth() + 1) + '/' + $scope.date_range.date_end.getDate() + '/' + $scope.date_range.date_end.getFullYear() + ' ' + $scope.date_range.date_end.getHours() + ':' + $scope.date_range.date_end.getMinutes() + ':' + $scope.date_range.date_end.getSeconds(),
                    turn_id = $( '#turns_select' ).val() ? $( '#turns_select' ).val() : 0;

                CloseRepository.reportsByDate( date_1, date_2, turn_id ).success( function( data ) {
                    if( !data.error ) {
                        $scope.close_reports = data.data.close_reports;
                        $scope.gridOptions.data = $scope.close_reports
                        $scope.global_total = $scope.close_reports.map( r => parseFloat( r.total ) ).reduce( ( a, b ) => ( a + b ), 0 );
                        // Get locations
                        LocationRepository.getAll().success( function( d1 ) {
                            if( !d1.error ) {
                                let location_names = "";
                                $scope.locations = d1.data;
                                $scope.locations.forEach( l => location_names += (l.location_name + ",") );
                                location_names = location_names.substring( 0, location_names.length-1 );
                                // locations on tokenization field
                                // is just an array with the names
                                // And sets by default all with a string separated by commas
                                $( '#locations_tokenization' ).val( location_names );
                                if($('#locations_tokenization').length) {
                                    $('#locations_tokenization').select2({
                                        placeholder: "Select Locations (all by default)...",
                                        tags: $scope.locations.map( l => l.location_name ),
                                        tokenSeparators: [","]
                                    });
                                }
                            } else {
                                $scope.errors = d1.message;
                            }
                            $scope.progress_ban = false;
                            $scope.hideGrid = true;
                        }).error( function( error ) {
                            $scope.errors = error;
                            $scope.progress_ban = false;
                        });
                    } else {
                        $scope.errors = data.error;
                    }
                }).error( function( error ) {
                    $scope.errors = error;
                });
            };
            // Get reports by default
            $scope.get_reports();

        }
    }]);