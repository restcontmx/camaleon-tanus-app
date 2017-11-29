yukonApp
    .factory( 'TicketRepository', [ '$http', function( $http ) {
        return({
            getReports : ( d1, d2, loc ) => $http.get( '/reports/ticket/?d1=' + d1 + '&d2=' + d2 + '&loc=' + loc + '&turn=0' ),
            getDetails : ( ticket, loc ) => $http.get( '/reports/ticket/details/?ticket=' + ticket + '&loc=' + loc ),
            getDummyReports : ( d1, d2, p, loc ) => $http.get( '/reports/dummy/?d1=' + d1 + '&d2=' + d2 + '&loc=' + loc + '&turn=0' ),            
            getTicketCount : ( d1, d2, p ) => $http.get( '/reports/ticket/count/?d1=' + d1 + '&d2=' + d2 + '&p=' + p ),
            getTicketCountSize : ( d1, d2 ) => $http.get( '/reports/ticket/count/size/?d1=' + d1 + '&d2=' + d2 )
        })
    }])
    .controller( 'ticket-reports-controller', [ '$scope',
                                                'TicketRepository',
                                                'LocationRepository',
                                                'AuthRepository',
                                                '$rootScope',
                                                'uiGridConstants',
                                                'Excel',
                                                '$timeout',
                                                function(   $scope,
                                                            TicketRepository,
                                                            LocationRepository,
                                                            AuthRepository,
                                                            $rootScope,
                                                            uiGridConstants,
                                                            Excel,
                                                            $timeout  ) {
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
                        $('.date_reports span').html(start.format("MM/DD/YYYY HH:mm:ss") + ' - ' + end.format("MM/DD/YYYY HH:mm:ss"));
                        $scope.date_range.date_start = new Date( start.format("MM/DD/YYYY HH:mm:ss") );
                        $scope.date_range.date_end = new Date( end.format("MM/DD/YYYY HH:mm:ss") );
                    }
				);
            }

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
                    $scope.gridOptions.data = $scope.tickets;
                } else {
                    $scope.gridOptions.data = $scope.tickets.filter( c => ( locations.find( l => ( c.location == l.id ) ) ) );
                }
            };

            $scope.print_tickets = function( ) {
                /*
                var exportHref = Excel.tableToExcel( '#ticket_reports', 'WireWorkbenchDataExport' );
                console.log( exportHref )
                $timeout( function() { 
                    location.href = exportHref; 
                }, 100);
                */
                var data = new Blob( [ JSON.stringify( $scope.gridOptions.data ) ], {
                    type: "application/vnd.ms-excel;charset=charset=utf-8"
                })
                saveAs( data, "Sample.xls" )
            };
        }
    }])
    .controller( 'ticket-count-reports-controller', [   '$scope',
                                                        'TicketRepository',
                                                        'LocationRepository',
                                                        'AuthRepository',
                                                        '$rootScope',
                                                        'uiGridConstants',
                                                        'Excel',
                                                        '$timeout',
                                                        'growl',
                                                        function(   $scope,
                                                                    TicketRepository,
                                                                    LocationRepository,
                                                                    AuthRepository,
                                                                    $rootScope,
                                                                    uiGridConstants,
                                                                    Excel,
                                                                    $timeout,
                                                                    growl  ) {
        if( AuthRepository.viewVerification() ) {

            $scope.progress_ban = false;
            $scope.loading_details = false;
            $rootScope.p = 0;
            $rootScope.loc = 0;
            $scope.locations_options = [];
            $scope.locations_options.push({ 'name': 'ALL', 'location': { 'id': 0 } });
            $rootScope.selected_item = { 'detamoves': [] };

            $scope.gridOptions = {
                enableRowSelection: true, enableRowHeaderSelection: false,
                enableSorting: true,
                showGridFooter: true,
                enableGridMenu: true,
                enableFiltering: true,
                paginationPageSizes: [25, 50, 75],
                paginationPageSize: 25,
                columnDefs: [
                    { field: 'afecto' },
                    { field: 'move_date' },
                    { field: 'ticket_count_fmt' }
                ],
                data : []
            };

            $scope.gridOptions.multiSelect = false;
            $scope.gridOptions.modifierKeysToMultiSelect = false;
            $scope.gridOptions.noUnselect = true;
            $scope.gridOptions.onRegisterApi = function (gridApi) {
                $scope.gridApi = gridApi;
                gridApi.selection.on.rowSelectionChanged($scope, function (row) {
                    $rootScope.grid_action(row.entity);
                });
            };

            let todays = new Date();
            $scope.date_end = new Date();
            todays.setDate(1);
            $scope.date_start = todays;
            $scope.date_start.setHours("00");
            $scope.date_start.setMinutes("00");
            $scope.date_start.setSeconds("00");
            $scope.date_end.setHours("23");
            $scope.date_end.setMinutes("59");
            $scope.date_end.setSeconds("59");

            $scope.date_range = {
                today: moment().format('MMMM D, YYYY'),
                last_month: moment().subtract('M', 1).format('MMMM D, YYYY'),
                date_start: $scope.date_start,
                date_end: $scope.date_end
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
                    function (start, end) {
                        $('#drp_predefined span').html(start.format("MM/DD/YYYY HH:mm:ss") + ' - ' + end.format("MM/DD/YYYY HH:mm:ss"));
                        $('.date_reports span').html(start.format("MM/DD/YYYY HH:mm:ss") + ' - ' + end.format("MM/DD/YYYY HH:mm:ss"));
                        $scope.date_range.date_start = new Date(start.format("MM/DD/YYYY HH:mm:ss"));
                        $scope.date_range.date_end = new Date(end.format("MM/DD/YYYY HH:mm:ss"));
                    }
                );
            }

            LocationRepository.getAll().success(function (d1) {
                if (!d1.error) {
                    let location_names = "";
                    $scope.locations = d1.data;
                    $scope.locations.forEach(l => location_names += (l.location_name + ","));
                    location_names = location_names.substring(0, location_names.length - 1);
                    // locations on tokenization field
                    // is just an array with the names
                    // And sets by default all with a string separated by commas
                    $('#locations_tokenization').val(location_names);
                    if ($('#locations_tokenization').length) {
                        $('#locations_tokenization').select2({
                            placeholder: "Select Locations (all by default)...",
                            tags: $scope.locations.map(l => l.location_name),
                            tokenSeparators: [","]
                        });
                    }
                } else {
                    growl.error( "There was an error " + d1.message, {} )
                }
            }).error(function (error) {
                growl.error( "There was an error " + error, {} )
            });

            $scope.get_reports = function (p) {
                $timeout( function() {
                    let date_1 = ($scope.date_range.date_start.getMonth() + 1) + '/' + $scope.date_range.date_start.getDate() + '/' + $scope.date_range.date_start.getFullYear() + ' ' + $scope.date_range.date_start.getHours() + ':' + $scope.date_range.date_start.getMinutes() + ':' + $scope.date_range.date_start.getSeconds(),
                        date_2 = ($scope.date_range.date_end.getMonth() + 1) + '/' + $scope.date_range.date_end.getDate() + '/' + $scope.date_range.date_end.getFullYear() + ' ' + $scope.date_range.date_end.getHours() + ':' + $scope.date_range.date_end.getMinutes() + ':' + $scope.date_range.date_end.getSeconds();
                    if (date_1 != undefined && date_2 != undefined) {
                        TicketRepository.getTicketCount( date_1, date_2, p ).success(function (response) {
                            if (!response.error) {
                                let temporary_reports = response.data.reports
                                temporary_reports.forEach( r => {
                                    switch( r.docu_type_id ) {
                                        case 3 :
                                            // Boleta 
                                            r.ticket_count_fmt = "B" + r.ticket_count
                                            break;
                                        case 1 :
                                            // Factura
                                            r.ticket_count_fmt = "F" + r.ticket_count; 
                                            break;
                                        case 7 :
                                            // nota credito
                                            r.ticket_count_fmt = r.ticket_count
                                            break;
                                    }
                                })
                                Array.prototype.push.apply( $scope.gridOptions.data, temporary_reports )
                                $scope.streamming_msg = ( ( ( p + 1 ) * 15000 ) + " of " + $scope.size + " done..." )
                            } else {
                                growl.error( "There was an error " + response.message, {} )
                            }
                        }).error(function (error) {
                            growl.error( "There was an error " + error, {} )
                        });
                    }
                }, 1000 );
            };

            $scope.get_size = function() {
                $scope.gridOptions.data = []
                let date_1 = ($scope.date_range.date_start.getMonth() + 1) + '/' + $scope.date_range.date_start.getDate() + '/' + $scope.date_range.date_start.getFullYear() + ' ' + $scope.date_range.date_start.getHours() + ':' + $scope.date_range.date_start.getMinutes() + ':' + $scope.date_range.date_start.getSeconds(),
                    date_2 = ($scope.date_range.date_end.getMonth() + 1) + '/' + $scope.date_range.date_end.getDate() + '/' + $scope.date_range.date_end.getFullYear() + ' ' + $scope.date_range.date_end.getHours() + ':' + $scope.date_range.date_end.getMinutes() + ':' + $scope.date_range.date_end.getSeconds();
                if (date_1 != undefined && date_2 != undefined) {
                    TicketRepository.getTicketCountSize( date_1, date_2 ).success(function (response) {
                        if (!response.error) {
                            console.log( response.data.size )
                            let size = response.data.size
                            $scope.size = response.data.size
                            let num_pettitions = Math.ceil(  size / 15000 )
                            for( let i = 0; i < num_pettitions; i++ ) {
                                $timeout( () => {
                                    $scope.streamming_msg =  ( ( i + 1 ) * 15000) + " registers loanding...";
                                    $scope.get_reports( i )
                                }, ( i + 1 ) * 8000 )
                            }
                        } else {
                            growl.error( "There was an error " + response.message, {} )
                        }
                    }).error(function (error) {
                        growl.error( "There was an error " + error, {} )
                    });
                }
            }
            
            $scope.customActions = {};
            $scope.customActions.refresh = $scope.reload_table;

            $scope.back = function () {
                $rootScope.p > 0 ? $scope.get_reports($rootScope.p - 1) : false
            };

            $rootScope.next = function () {
                ($rootScope.p < ($rootScope.count / 20)) ? $scope.get_reports($rootScope.p + 1) : false
            };

            $rootScope.grid_action = function (item) {
                console.log( "Row pressed" )
            };
            // Locations select change
            // When the locations field changes of locations
            $scope.locations_select_change = function () {
                let locations_selected = $scope.locations_select.split(','),
                    locations = [],
                    removal_ids = [];

                locations_selected.forEach(ls => {
                    let temp_location = $scope.locations.find(l => (l.location_name == ls))
                    if (temp_location) {
                        locations.push(temp_location);
                    }
                });

                if (locations.length == 0 || locations.length == $scope.locations.length) {
                    $scope.gridOptions.data = $scope.tickets;
                } else {
                    $scope.gridOptions.data = $scope.tickets.filter(c => (locations.find(l => (c.location == l.id))));
                }
            };

            $scope.print_tickets = function () {
                /*
                var exportHref = Excel.tableToExcel( '#ticket_reports', 'WireWorkbenchDataExport' );
                console.log( exportHref )
                $timeout( function() { 
                location.href = exportHref; 
                }, 100);
                */
                var data = new Blob([JSON.stringify($scope.gridOptions.data)], {
                    type: "application/vnd.ms-excel;charset=charset=utf-8"
                })
                saveAs(data, "Sample.xls")
            };
        }
    }])
    .controller( 'ticket-count-detail-reports-controller', [    '$scope',
                                                                'TicketRepository',
                                                                'LocationRepository',
                                                                'AuthRepository',
                                                                '$rootScope',
                                                                'uiGridConstants',
                                                                'Excel',
                                                                '$timeout',
                                                                'growl',
                                                                'uiGridTreeViewConstants',
                                                                'uiGridConstants',
                                                                function(   $scope,
                                                                            TicketRepository,
                                                                            LocationRepository,
                                                                            AuthRepository,
                                                                            $rootScope,
                                                                            uiGridConstants,
                                                                            Excel,
                                                                            $timeout,
                                                                            growl,
                                                                            uiGridTreeViewConstants,
                                                                            uiGridConstants ) {
        if( AuthRepository.viewVerification() ) {

            $scope.progress_ban = false;
            $scope.loading_details = false;
            $rootScope.p = 0;
            $rootScope.loc = 0;
            $scope.locations_options = [];
            $scope.locations_options.push({ 'name': 'ALL', 'location': { 'id': 0 } });
            $rootScope.selected_item = { 'detamoves': [] };
            $scope.scroll ={
                top: 0,
                left: 0
            };
            $scope.gridOptions = {
                enableRowSelection: true, enableRowHeaderSelection: false,
                enableSorting: true,
                enableGridMenu: true,
                enableFiltering: true,
                flatEntityAccess: true,
                showGridFooter: true,
                fastWatch: true,
                columnDefs: [
                    { field: 'location_name', displayName : "Location", width:150 },
                    { field: 'move_date', displayName : 'Date', width : 150 },
                    { field: 'ticket_count_fmt', displayName : 'Ticket Count', width:150 },
                    { field: 'item_description', displayName : 'Description', width:150 },
                    { field: 'cate_name', displayName : 'Category', width:150 },
                    { field: 'afecto',  width:100 },
                    { field: 'noafecto',width:100 },
                    { field: 'move_regi_name',  displayName : 'Registradora', width:150 },
                    { field: 'move_cash_value', displayName : 'Cash', width:100 },
                    { field: 'money_conv',      displayName : 'Cambio', width:100 },
                    { field: 'move_wic_value', width:100 },
                    { field: 'ucost',   displayName : 'Cost' , width:100 },
                    { field: 'tx',      displayName : "I.G.V.", width:100},
                    { field: 'tx2',     displayName : "RC" , width:100},
                    { field: 'tx3',     displayName : "Tax3", width:100 },
                    { field: 'servicio',displayName : "Servicio", width:100 },
                    { field: 'total',   displayName : "Total", width:100 },
                    { field: 'tx3',     displayName : "Payment", width:100},
                    { field: 'tx3',     displayName : "Nota Credito", width:100 }
                ],
                data: [],
                customScroller: function myScrolling(uiGridViewport, scrollHandler) {
                    uiGridViewport.on('scroll', function myScrollingOverride(event) {
                      $scope.scroll.top = uiGridViewport[0].scrollTop;
                      $scope.scroll.left = uiGridViewport[0].scrollLeft;
               
                      // You should always pass the event to the callback since ui-grid 
                      scrollHandler(event);
                    });
                  }
            };

            $scope.gridOptions.multiSelect = false;
            $scope.gridOptions.modifierKeysToMultiSelect = false;
            $scope.gridOptions.noUnselect = true;
            $scope.gridOptions.onRegisterApi = function (gridApi) {
                $scope.gridApi = gridApi;
                gridApi.selection.on.rowSelectionChanged($scope, function (row) {
                    $rootScope.grid_action(row.entity);
                });
            };

            let todays = new Date();
            $scope.date_end = new Date();
            todays.setDate(1);
            $scope.date_start = todays;
            $scope.date_start.setHours("00");
            $scope.date_start.setMinutes("00");
            $scope.date_start.setSeconds("00");
            $scope.date_end.setHours("23");
            $scope.date_end.setMinutes("59");
            $scope.date_end.setSeconds("59");

            $scope.date_range = {
                today: moment().format('MMMM D, YYYY'),
                last_month: moment().subtract('M', 1).format('MMMM D, YYYY'),
                date_start: $scope.date_start,
                date_end: $scope.date_end
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
                    function (start, end) {
                        $('#drp_predefined span').html(start.format("MM/DD/YYYY HH:mm:ss") + ' - ' + end.format("MM/DD/YYYY HH:mm:ss"));
                        $('.date_reports span').html(start.format("MM/DD/YYYY HH:mm:ss") + ' - ' + end.format("MM/DD/YYYY HH:mm:ss"));
                        $scope.date_range.date_start = new Date(start.format("MM/DD/YYYY HH:mm:ss"));
                        $scope.date_range.date_end = new Date(end.format("MM/DD/YYYY HH:mm:ss"));
                    }
                );
            }

            LocationRepository.getAll().success(function (d1) {
                if (!d1.error) {
                    let location_names = "";
                    $scope.locations = d1.data;
                    $scope.locations.forEach(l => location_names += (l.location_name + ","));
                    location_names = location_names.substring(0, location_names.length - 1);
                    // locations on tokenization field
                    // is just an array with the names
                    // And sets by default all with a string separated by commas
                    $('#locations_tokenization').val(location_names);
                    if ($('#locations_tokenization').length) {
                        $('#locations_tokenization').select2({
                            placeholder: "Select Locations (all by default)...",
                            tags: $scope.locations.map(l => l.location_name),
                            tokenSeparators: [","]
                        });
                    }
                } else {
                    growl.error("There was an error " + d1.message, {})
                }
            }).error(function (error) {
                growl.error("There was an error " + error, {})
            });

            $scope.get_reports = function (p) {
                $timeout(function () {
                    let date_1 = ($scope.date_range.date_start.getMonth() + 1) + '/' + $scope.date_range.date_start.getDate() + '/' + $scope.date_range.date_start.getFullYear() + ' ' + $scope.date_range.date_start.getHours() + ':' + $scope.date_range.date_start.getMinutes() + ':' + $scope.date_range.date_start.getSeconds(),
                        date_2 = ($scope.date_range.date_end.getMonth() + 1) + '/' + $scope.date_range.date_end.getDate() + '/' + $scope.date_range.date_end.getFullYear() + ' ' + $scope.date_range.date_end.getHours() + ':' + $scope.date_range.date_end.getMinutes() + ':' + $scope.date_range.date_end.getSeconds();
                    if (date_1 != undefined && date_2 != undefined) {
                        TicketRepository.getTicketCount(date_1, date_2, p).success(function (response) {
                            if (!response.error) {
                                let temporary_reports = response.data.reports
                                temporary_reports.forEach(r => {
                                    switch (r.docu_type_id) {
                                        case 3:
                                            // Boleta 
                                            r.ticket_count_fmt = "B" + r.ticket_count;
                                            break;
                                        case 1:
                                            // Factura
                                            r.ticket_count_fmt = "F" + r.ticket_count;
                                            break;
                                        case 7:
                                            // nota credito
                                            r.ticket_count_fmt = r.ticket_count;
                                            break;
                                    }
                                })
                                temporary_reports.forEach( r => {
                                    let finded_data = $scope.display_data.find( p => p.ticket_count_fmt == r.ticket_count_fmt && p.location == r.location )
                                    if( finded_data ) {

                                        finded_data.total += r.total
                                        finded_data.sub_total += r.sub_total
                                        finded_data.tx  += r.tx
                                        finded_data.tx2 += r.tx2
                                        finded_data.tx3 += r.tx3

                                        finded_data.total = round( finded_data.total, 2 )
                                        finded_data.sub_total = round( finded_data.sub_total, 2 )
                                        finded_data.tx = round( finded_data.tx, 2 )
                                        finded_data.tx2 = round( finded_data.tx2, 2 )
                                        finded_data.tx3 = round( finded_data.tx3, 2 )

                                        finded_data.details.push( { 'item_description' : r.item_description, 
                                                                    'cate_name' : r.cate_name,
                                                                    'tx' : r.tx,
                                                                    'tx2' : r.tx2,
                                                                    'tx3' : r.tx3,
                                                                    'total' : r.total, 
                                                                    'ucost' : r.ucost,
                                                                    'sub_total' : r.sub_total,
                                                                    'move_wic_value' : r.move_wic_value,
                                                                    'move_cash_value' : r.move_cash_value,
                                                                    'move_regi_name' : r.move_regi_name,
                                                                    'afecto' : r.afecto,
                                                                    'noafecto' : r.noafecto,
                                                                    'money_conv' : r.money_conv,
                                                                    'location' : r.location } )
                                    } else {
                                        let temp_data = {   
                                                            'ticket_count_fmt' : r.ticket_count_fmt, 
                                                            'details' : [], 
                                                            'location' : r.location, 
                                                            'move_date' : r.move_date, 
                                                            'location_name' : r.location_name,
                                                            'location' : r.location }
                                        temp_data.total = 0
                                        temp_data.sub_total = 0
                                        temp_data.tx  = 0
                                        temp_data.tx2 = 0
                                        temp_data.tx3 = 0
                                        $scope.display_data.push( temp_data )
                                    }
                                })
                                $scope.streamming_msg = ( ( ( p + 1 ) / $scope.num_pettitions ) * 100 ) + "% done..."
                                if( ( p + 1 ) == Math.ceil( $scope.size / 15000 ) ) {
                                    $scope.display_data.forEach( r => {
                                        r.$$treeLevel = 0
                                        $scope.gridOptions.data.push( r )
                                        r.details.forEach( d => {
                                            $scope.gridOptions.data.push( d )
                                        }) 
                                    })
                                    $scope.real_data = $scope.gridOptions.data
                                    $scope.streamming_msg = ""
                                }
                            } else {
                                growl.error("There was an error " + response.message, {})
                            }
                        }).error(function (error) {
                            growl.error("There was an error " + error, {})
                        });
                    }
                }, 1000);
            };

            $scope.get_size = function () {
                $scope.streamming_msg = "Wating response..."
                $scope.gridOptions.data = []
                $scope.display_data = []
                let date_1 = ($scope.date_range.date_start.getMonth() + 1) + '/' + $scope.date_range.date_start.getDate() + '/' + $scope.date_range.date_start.getFullYear() + ' ' + $scope.date_range.date_start.getHours() + ':' + $scope.date_range.date_start.getMinutes() + ':' + $scope.date_range.date_start.getSeconds(),
                    date_2 = ($scope.date_range.date_end.getMonth() + 1) + '/' + $scope.date_range.date_end.getDate() + '/' + $scope.date_range.date_end.getFullYear() + ' ' + $scope.date_range.date_end.getHours() + ':' + $scope.date_range.date_end.getMinutes() + ':' + $scope.date_range.date_end.getSeconds();
                if (date_1 != undefined && date_2 != undefined) {
                    TicketRepository.getTicketCountSize(date_1, date_2).success(function (response) {
                        if (!response.error) {
                            $scope.size = response.data.size
                            $scope.num_pettitions = Math.ceil($scope.size / 15000)
                            for (let i = 0; i < $scope.num_pettitions; i++) {
                                $timeout(() => {
                                    $scope.streamming_msg = ((i + 1) * 15000) + " registers loanding...";
                                    $scope.get_reports(i)
                                }, (i + 1) * 8000)
                            }
                            
                        } else {
                            growl.error("There was an error " + response.message, {})
                        }
                    }).error(function (error) {
                        growl.error("There was an error " + error, {})
                    });
                }
            }

            $scope.customActions = {};
            $scope.customActions.refresh = $scope.reload_table;

            $scope.back = function () {
                $rootScope.p > 0 ? $scope.get_reports($rootScope.p - 1) : false
            };

            $rootScope.next = function () {
                ($rootScope.p < ($rootScope.count / 20)) ? $scope.get_reports($rootScope.p + 1) : false
            };

            $rootScope.grid_action = function (item) {
                console.log("Row pressed")
            };
            // Locations select change
            // When the locations field changes of locations
            $scope.locations_select_change = function () {
                let locations_selected = $scope.locations_select.split(','),
                    locations = [],
                    removal_ids = [];
                locations_selected.forEach(ls => {
                    let temp_location = $scope.locations.find(l => (l.location_name == ls))
                    if (temp_location) {
                        locations.push(temp_location);
                    }
                });

                if (locations.length == 0 || locations.length == $scope.locations.length) {
                    $scope.gridOptions.data = $scope.real_data;
                } else {
                    $scope.gridOptions.data = $scope.real_data.filter(c => (locations.find(l => (c.location == l.id))));
                }
            };

            $scope.print_tickets = function () {
                /*
                var exportHref = Excel.tableToExcel( '#ticket_reports', 'WireWorkbenchDataExport' );
                console.log( exportHref )
                $timeout( function() { 
                location.href = exportHref; 
                }, 100);
                */
                var data = new Blob([JSON.stringify($scope.gridOptions.data)], {
                    type: "application/vnd.ms-excel;charset=charset=utf-8"
                })
                saveAs(data, "Sample.xls")
            };

            function round(value, decimals) {
                return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
            }
        }
    }]);
