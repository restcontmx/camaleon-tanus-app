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
                                                                'CamaleonMath',
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
                                                                            uiGridConstants,
                                                                            CamaleonMath    ) {
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
                    { field: 'location_name',   displayName : "Location", width:150 },
                    { field: 'move_date',       displayName : 'Date', width : 150 },
                    { field: 'ticket_count_fmt',displayName : 'Ticket Count', width:150 },
                    { field: 'taxexemptno',     displayName : 'Tax ID Number', width:150 },
                    { field: 'customer_name',   displayName : 'Customer Name', width:150 },
                    { field: 'item_description',displayName : 'Description', width:150 },
                    { field: 'cate_name',       displayName : 'Category', width:150 },
                    { field: 'afecto',          displayName : 'Taxable', width:150 },
                    { field: 'noafecto',        displayName : 'No Taxable', width:150 },
                    
                    { field: 'pprice',          displayName : 'Price', width:150 },
                    { field: 'ucost',           displayName : 'Cost', width:150 },

                    { field: 'tx',              displayName : "I.G.V.", width:150 },
                    { field: 'tx2',             displayName : "RC", width:150 },
                    { field: 'tx3',             displayName : "Tax3", width:150 },

                    { field: 'servicio',        displayName : "Servicio", width:100 },
                    { field: 'total',           displayName : "Total", width:150 },
                    { field: 'p_type',          displayName : "Type", width:100 },

                    { field: 'move_credit_value',   displayName : 'Credit', width:150 },
                    { field: 'move_cash_value',     displayName : 'Cash', width:150 },
                    { field: 'move_debit_value',    displayName : 'Debit', width:150 },
                    { field: 'move_check_value',    displayName : 'Check', width:150 },
                    { field: 'move_stamp_value',    displayName : 'Stamp', width:150 },
                    { field: 'move_wic_value',      displayName : 'Dollars', width:150 },
                    { field: 'move_gift_value',     displayName : 'GiftCards', width:150 },
                    { field: 'move_onaccount_value',displayName : 'On Account', width:150 },
                    { field: 'move_crnote_value',   displayName : 'Credit Note', width:150 },
                    { field: 'move_tip_value',      displayName : 'Tip', width:150 },
                    { field: 'move_cc_tip',         displayName : 'CC Tip', width:150 },
                    { field: 'move_regi_name',      displayName : 'Station', width:150 },
                    { field: 'money_conv',          displayName : 'Conversion', width:150 },
                    { field: 'move_fiscal_date',    displayName : 'Fiscal Date', width:150 },
                    { field: 'docu_type_id',        displayName : 'Docu Type', width:150 },
                    { field: 'move_refer',          displayName : 'Ref No.', width:150 },
                    { field: 'nota_cr_code',        displayName : 'Credit Note', width:150 }
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
                                        case 1:
                                            // Factura
                                            r.ticket_count_fmt = "F" + r.ticket_count;
                                            break;
                                        case 3:
                                            // Boleta 
                                            r.ticket_count_fmt = "B" + r.ticket_count;
                                            break;
                                        case 7:
                                            // nota credito
                                            r.ticket_count_fmt = r.ticket_count;
                                            break;
                                        case 12:
                                            // Boleta
                                            r.ticket_count_fmt = "B" + r.ticket_count;
                                            break;
                                    }
                                })
                                temporary_reports.forEach( r => {
                                    let finded_data = $scope.display_data.find( p => p.ticket_count_fmt == r.ticket_count_fmt && p.location == r.location )
                                    if( finded_data ) {

                                        finded_data.total += r.total
                                        finded_data.tx  += r.tx
                                        finded_data.tx2 += r.tx2
                                        finded_data.tx3 += r.tx3
                                        finded_data.afecto += r.afecto
                                        finded_data.noafecto += r.noafecto

                                        finded_data.total = CamaleonMath.round( finded_data.total, 2 )
                                        finded_data.tx = CamaleonMath.round( finded_data.tx, 2 )
                                        finded_data.tx2 = CamaleonMath.round( finded_data.tx2, 2 )
                                        finded_data.tx3 = CamaleonMath.round( finded_data.tx3, 2 )
                                        finded_data.afecto = CamaleonMath.round( finded_data.afecto, 2 )
                                        finded_data.noafecto = CamaleonMath.round( finded_data.noafecto, 2 )

                                        finded_data.details.push({
                                            'location' : r.location,
                                            'location_name' : '',
                                            'move_date' : '',
                                            'ticket_count_fmt' : '',
                                            'taxexemptno' : '',
                                            'customer_name' : '',
                                            'item_description' : r.item_description,
                                            'cate_name' : r.cate_name,
                                            'afecto' : r.afecto,
                                            'noafecto' : r.noafecto,
                                            'pprice' : r.pprice,
                                            'ucost' : r.ucost,
                                            'tx' : r.tx,
                                            'tx2' : r.tx2,
                                            'tx3' : r.tx3,
                                            'servicio' : '',
                                            'total' : r.total,
                                            'p_type' : r.p_type,
                                            'move_credit_value' : '',
                                            'move_cash_value' : '',
                                            'move_debit_value' : '',
                                            'move_check_value' : '',
                                            'move_stamp_value' : '',
                                            'move_wic_value' : '',
                                            'move_gift_value' : '',
                                            'move_onaccount_value' : '',
                                            'move_crnote_value' : '',
                                            'move_tip_value' : '',
                                            'move_cc_tip' : '',
                                            'move_regi_name' : '',
                                            'money_conv' : '',
                                            'move_fiscal_date' : '',
                                            'docu_type_id' : '',
                                            'nota_cr_code' : ''
                                         })
                                    } else {

                                        let customer_name = r.company_name != '' ? r.company_name : r.cust_name + ' ' + r.cust_last, 
                                            tax_id_no = r.taxexemptno != '' ? r.taxexemptno : r.ss_no,
                                            temp_data = {
                                                'location' : r.location,
                                                'location_name' : r.location_name,
                                                'move_date' : r.move_date,
                                                'ticket_count_fmt' : r.ticket_count_fmt,
                                                'taxexemptno' : tax_id_no,
                                                'customer_name' : customer_name,
                                                'item_description' : '',
                                                'cate_name' : '',
                                                'afecto' : 0,
                                                'noafecto' : 0,
                                                'pprice' : '',
                                                'ucost' : '',
                                                'tx' : 0,
                                                'tx2' : 0,
                                                'tx3' : 0,
                                                'servicio' : r.servicio,
                                                'total' : 0,
                                                'p_type' : r.p_type,
                                                'move_credit_value' : r.move_credit_value,
                                                'move_cash_value' : r.move_cash_value,
                                                'move_debit_value' : r.move_debit_value,
                                                'move_check_value' : r.move_check_value,
                                                'move_stamp_value' : r.move_stamp_value,
                                                'move_wic_value' : r.move_wic_value,
                                                'move_gift_value' : r.move_gift_value,
                                                'move_onaccount_value' : r.move_onaccount_value,
                                                'move_crnote_value' : r.move_crnote_value,
                                                'move_tip_value' : r.move_tip_value,
                                                'move_cc_tip' : r.move_cc_tip,
                                                'move_regi_name' : r.move_regi_name,
                                                'money_conv' : r.money_conv,
                                                'move_fiscal_date' : r.move_fiscal_date,
                                                'docu_type_id' : r.docu_type_id,
                                                'nota_cr_code' : r.nota_cr_code,
                                                'details' : []
                                            }
                                            
                                        temp_data.p_type += r.move_credit_value > 0 ? 'CREDIT/' : ''
                                        temp_data.p_type += r.move_cash_value > 0 ? 'CASH/' : ''
                                        temp_data.p_type += r.move_debit_value > 0 ? 'DEBIT/' : ''
                                        temp_data.p_type += r.move_check_value > 0 ? 'CHECK/' : ''
                                        temp_data.p_type += r.move_stamp_value > 0 ? 'STAMP/' : ''
                                        temp_data.p_type += r.move_wic_value > 0 ? 'DOLLARS/' : ''
                                        temp_data.p_type += r.move_gift_value > 0 ? 'GIFT/' : ''
                                        temp_data.p_type += r.move_onaccount_value > 0 ? 'ONACC/' : ''
                                        temp_data.p_type += r.move_crnote_value > 0 ? 'CRNOTE/' : ''

                                        if( temp_data.p_type != '' ) {
                                            temp_data.p_type = temp_data.p_type.slice(0, -1)
                                        }

                                        $scope.display_data.push( temp_data )

                                        temp_data.total += r.total
                                        temp_data.tx  += r.tx
                                        temp_data.tx2 += r.tx2
                                        temp_data.tx3 += r.tx3
                                        temp_data.afecto += r.afecto
                                        temp_data.noafecto += r.noafecto

                                        temp_data.total = CamaleonMath.round( temp_data.total, 2 )
                                        temp_data.tx = CamaleonMath.round( temp_data.tx, 2 )
                                        temp_data.tx2 = CamaleonMath.round( temp_data.tx2, 2 )
                                        temp_data.tx3 = CamaleonMath.round( temp_data.tx3, 2 )
                                        temp_data.afecto = CamaleonMath.round( temp_data.afecto, 2 )
                                        temp_data.noafecto = CamaleonMath.round( temp_data.noafecto, 2 )

                                        temp_data.details.push({
                                            'location' : r.location,
                                            'location_name' : '',
                                            'move_date' : '',
                                            'ticket_count_fmt' : '',
                                            'taxexemptno' : '',
                                            'customer_name' : '',
                                            'item_description' : r.item_description,
                                            'cate_name' : r.cate_name,
                                            'afecto' : r.afecto,
                                            'noafecto' : r.noafecto,
                                            'pprice' : r.pprice,
                                            'ucost' : r.ucost,
                                            'tx' : r.tx,
                                            'tx2' : r.tx2,
                                            'tx3' : r.tx3,
                                            'servicio' : '',
                                            'total' : r.total,
                                            'p_type' : r.p_type,
                                            'move_credit_value' : '',
                                            'move_cash_value' : '',
                                            'move_debit_value' : '',
                                            'move_check_value' : '',
                                            'move_stamp_value' : '',
                                            'move_wic_value' : '',
                                            'move_gift_value' : '',
                                            'move_onaccount_value' : '',
                                            'move_crnote_value' : '',
                                            'move_tip_value' : '',
                                            'move_cc_tip' : '',
                                            'move_regi_name' : '',
                                            'money_conv' : '',
                                            'move_fiscal_date' : '',
                                            'docu_type_id' : '',
                                            'nota_cr_code' : ''
                                         })
                                    }
                                })
                                $scope.streamming_msg = ( ( ( p + 1 ) / $scope.num_pettitions ) * 100 ) + "% done..."
                                $scope.pettition_states[p] = true

                                if( $scope.pettition_states.every( b => ( b == true ) ) ) {
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
                $scope.pettition_states = []
                let date_1 = ($scope.date_range.date_start.getMonth() + 1) + '/' + $scope.date_range.date_start.getDate() + '/' + $scope.date_range.date_start.getFullYear() + ' ' + $scope.date_range.date_start.getHours() + ':' + $scope.date_range.date_start.getMinutes() + ':' + $scope.date_range.date_start.getSeconds(),
                    date_2 = ($scope.date_range.date_end.getMonth() + 1) + '/' + $scope.date_range.date_end.getDate() + '/' + $scope.date_range.date_end.getFullYear() + ' ' + $scope.date_range.date_end.getHours() + ':' + $scope.date_range.date_end.getMinutes() + ':' + $scope.date_range.date_end.getSeconds();
                if (date_1 != undefined && date_2 != undefined) {
                    TicketRepository.getTicketCountSize(date_1, date_2).success(function (response) {
                        if (!response.error) {
                            $scope.size = response.data.size

                            $scope.num_pettitions = Math.ceil($scope.size / 15000)

                            for ( let j = 0; j < $scope.num_pettitions; j++ ) {
                                $scope.pettition_states.push( false )
                            }

                            for (let i = 0; i < $scope.num_pettitions; i++) {
                                $timeout(() => {
                                    $scope.streamming_msg = ((i + 1) * 15000) + " registers loanding...";
                                    $scope.get_reports(i)
                                }, (i + 1) * 8000)
                            }
                        } else {
                            growl.error("There was an error " + response.message, {})
                            $scope.streamming_msg = ""
                        }
                    }).error(function (error) {
                        growl.error("There was an error " + error, {})
                        $scope.streamming_msg = ""
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
                // Grid action
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
                if( $scope.gridOptions.data.length > 0 ) {
                    var data = [{
                        location_name : 'Location',
                        move_date : 'Date',
                        ticket_count_fmt : 'Ticket Count',
                        taxexemptno : 'Tax ID Number',
                        customer_name : 'Customer Name',
                        item_description : 'Description',
                        cate_name : 'Category',
                        afecto : 'Taxable',
                        noafecto : 'No Taxable',
                        pprice : 'Price',
                        ucost : 'Cost',
                        tx : 'I.G.V.',
                        tx2 : 'RC',
                        tx3 : 'Tax3',
                        servicio : 'Servicio',
                        total : 'Total',
                        p_type : 'Type',
                        move_credit_value : 'Credit',
                        move_cash_value : 'Cash',
                        move_debit_value : 'Debit',
                        move_check_value : 'Check',
                        move_stamp_value : 'Stamp',
                        move_wic_value : 'Dollars',
                        move_gift_value : 'GiftCards',
                        move_onaccount_value : 'On Account',
                        move_crnote_value : 'Credit Note',
                        move_tip_value : 'Tip',
                        move_cc_tip : 'CC Tip',
                        move_regi_name : 'Station',
                        money_conv : 'Conversion',
                        move_fiscal_date : 'Fiscal Date',
                        docu_type_id : 'Docu Type',
                        move_refer : 'Ref No.',
                        nota_cr_code : 'Credit Note'
                    }]
                    $scope.gridOptions.data.forEach( d => {
                        if( d.$$treeLevel == 0 ) {
                            data.push({
                                location_name : d.location_name,
                                move_date : d.move_date,
                                ticket_count_fmt : d.ticket_count_fmt,
                                taxexemptno : d.taxexemptno,
                                customer_name : d.customer_name,
                                item_description : d.item_description,
                                cate_name : d.cate_name,
                                afecto : d.afecto,
                                noafecto : d.noafecto,
                                pprice : d.pprice,
                                ucost : d.ucost,
                                tx : d.tx,
                                tx2 : d.tx2,
                                tx3 : d.tx3,
                                servicio : d.servicio,
                                total : d.total,
                                p_type : d.p_type,
                                move_credit_value : d.move_credit_value,
                                move_cash_value : d.move_cash_value,
                                move_debit_value : d.move_debit_value,
                                move_check_value : d.move_check_value,
                                move_stamp_value : d.move_stamp_value,
                                move_wic_value : d.move_wic_value,
                                move_gift_value : d.move_gift_value,
                                move_onaccount_value : d.move_onaccount_value,
                                move_crnote_value : d.move_crnote_value,
                                move_tip_value : d.move_tip_value,
                                move_cc_tip : d.move_cc_tip,
                                move_regi_name : d.move_regi_name,
                                money_conv : d.money_conv,
                                move_fiscal_date : d.move_fiscal_date,
                                docu_type_id : d.docu_type_id,
                                move_refer : d.move_refer,
                                nota_cr_code : d.nota_cr_code
                            })
                        } else {
                            data.push({
                                location_name : d.location_name,
                                move_date : d.move_date,
                                ticket_count_fmt : d.ticket_count_fmt,
                                taxexemptno : d.taxexemptno,
                                customer_name : d.customer_name,
                                item_description : d.item_description,
                                cate_name : d.cate_name,
                                afecto : d.afecto,
                                noafecto : d.noafecto,
                                pprice : d.pprice,
                                ucost : d.ucost,
                                tx : d.tx,
                                tx2 : d.tx2,
                                tx3 : d.tx3,
                                servicio : d.servicio,
                                total : d.total,
                                p_type : d.p_type,
                                move_credit_value : d.move_credit_value,
                                move_cash_value : d.move_cash_value,
                                move_debit_value : d.move_debit_value,
                                move_check_value : d.move_check_value,
                                move_stamp_value : d.move_stamp_value,
                                move_wic_value : d.move_wic_value,
                                move_gift_value : d.move_gift_value,
                                move_onaccount_value : d.move_onaccount_value,
                                move_crnote_value : d.move_crnote_value,
                                move_tip_value : d.move_tip_value,
                                move_cc_tip : d.move_cc_tip,
                                move_regi_name : d.move_regi_name,
                                money_conv : d.money_conv,
                                move_fiscal_date : d.move_fiscal_date,
                                docu_type_id : d.docu_type_id,
                                move_refer : d.move_refer,
                                nota_cr_code : d.nota_cr_code
                            })
                        }
                    })
                    alasql("SELECT * INTO XLSX('ticket_count_detail.xlsx', {headers:false}) FROM ? ", [data]);
                } else {
                    growl.error("Please wait, data to load.", {})
                }
            };

            $scope.print_not_detailed_tickets = function( ) {
                if( $scope.gridOptions.data.length > 0 ) {
                    var data = [{
                        location_name : 'Location',
                        move_date : 'Date',
                        ticket_count_fmt : 'Ticket Count',
                        taxexemptno : 'Tax ID Number',
                        customer_name : 'Customer Name',
                        item_description : 'Description',
                        cate_name : 'Category',
                        afecto : 'Taxable',
                        noafecto : 'No Taxable',
                        pprice : 'Price',
                        ucost : 'Cost',
                        tx : 'I.G.V.',
                        tx2 : 'RC',
                        tx3 : 'Tax3',
                        servicio : 'Servicio',
                        total : 'Total',
                        p_type : 'Type',
                        move_credit_value : 'Credit',
                        move_cash_value : 'Cash',
                        move_debit_value : 'Debit',
                        move_check_value : 'Check',
                        move_stamp_value : 'Stamp',
                        move_wic_value : 'Dollars',
                        move_gift_value : 'GiftCards',
                        move_onaccount_value : 'On Account',
                        move_crnote_value : 'Credit Note',
                        move_tip_value : 'Tip',
                        move_cc_tip : 'CC Tip',
                        move_regi_name : 'Station',
                        money_conv : 'Conversion',
                        move_fiscal_date : 'Fiscal Date',
                        docu_type_id : 'Docu Type',
                        move_refer : 'Ref No.',
                        nota_cr_code : 'Credit Note'
                    }]
                    $scope.gridOptions.data.forEach( d => {
                        if( d.$$treeLevel == 0 ) {
                            data.push({
                                location_name : d.location_name,
                                move_date : d.move_date,
                                ticket_count_fmt : d.ticket_count_fmt,
                                taxexemptno : d.taxexemptno,
                                customer_name : d.customer_name,
                                item_description : d.item_description,
                                cate_name : d.cate_name,
                                afecto : d.afecto,
                                noafecto : d.noafecto,
                                pprice : d.pprice,
                                ucost : d.ucost,
                                tx : d.tx,
                                tx2 : d.tx2,
                                tx3 : d.tx3,
                                servicio : d.servicio,
                                total : d.total,
                                p_type : d.p_type,
                                move_credit_value : d.move_credit_value,
                                move_cash_value : d.move_cash_value,
                                move_debit_value : d.move_debit_value,
                                move_check_value : d.move_check_value,
                                move_stamp_value : d.move_stamp_value,
                                move_wic_value : d.move_wic_value,
                                move_gift_value : d.move_gift_value,
                                move_onaccount_value : d.move_onaccount_value,
                                move_crnote_value : d.move_crnote_value,
                                move_tip_value : d.move_tip_value,
                                move_cc_tip : d.move_cc_tip,
                                move_regi_name : d.move_regi_name,
                                money_conv : d.money_conv,
                                move_fiscal_date : d.move_fiscal_date,
                                docu_type_id : d.docu_type_id,
                                move_refer : d.move_refer,
                                nota_cr_code : d.nota_cr_code
                            })
                        }
                    })
                    alasql("SELECT * INTO XLSX('ticket_count_not_detail.xlsx', {headers:false}) FROM ? ", [data]);
                } else {
                    growl.error("Please wait, data to load.", {})
                }
            }

        }
    }]);
