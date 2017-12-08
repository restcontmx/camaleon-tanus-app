yukonApp
.factory( 'VoidRepository',  [ '$http',  function( $http ) {
    return({
        reportsByDate : ( d1, d2, turn_id ) => $http.get( '/reports/void/?d1=' + d1 + '&d2=' + d2 + '&turn=' + turn_id ) 
    });
}])
.controller( 'void-reports-controller', [   '$scope', 
                                                '$rootScope', 
                                                'AuthRepository',
                                                'VoidRepository',
                                                'TurnRepository',
                                                'LocationRepository', 
                                                function(   $scope,
                                                            $rootScope,
                                                            AuthRepository,
                                                            VoidRepository,
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
                { field: 'ticket', enableSorting: true, width:150 },
                { field: 'location_name', width:150 },
                { field: 'date', width:150 },
                { field: 'producto', width:150 },
                { field: 'reason', width:150 },
                { field: 'price', width:150 },
                { field: 'host', width:150 },
                { field: 'move_cashier', width:150 },
                { field: 'void_id', width:150 },
                { field: 'barcode', width:150 }
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

            VoidRepository.reportsByDate( date_1, date_2, turn_id ).success( function( data ) {
                if( !data.error ) {
                    $scope.void_reports = data.data.void_reports;
                    $scope.gridOptions.data = $scope.void_reports
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
        // Locations select change
        // When the locations field changes of locations
        $scope.locations_select_change = function() {
            
            let locations_selected = $scope.locations_select.split(','), 
                locations = [],
                removal_ids = [];

            locations_selected.forEach( ls => {
                let temp_location = $scope.locations.find( l => ( l.location_name == ls ) )
                if( temp_location ) {
                    locations.push( temp_location );
                }
            });
            
            if ( locations.length == 0 || locations.length == $scope.locations.length ) {
                $scope.gridOptions.data = $scope.void_reports;
            } else {
                $scope.gridOptions.data = $scope.void_reports.filter( c => ( locations.find( l => ( c.location == l.id ) ) ) );
            }
        };
    }
}]);