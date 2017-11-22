yukonApp
    .controller('sales-summary-reports-controller', [   '$scope',
                                                        'LocationRepository',
                                                        'AuthRepository',
                                                        '$rootScope',
                                                        'DashboardRepository',
                                                        'CreditCardRepository',
                                                        '$timeout',
                                                        'Excel',
                                                        function(   $scope,
                                                                    LocationRepository,
                                                                    AuthRepository,
                                                                    $rootScope,
                                                                    DashboardRepository,
                                                                    CreditCardRepository,
                                                                    $timeout,
                                                                    Excel   ) {
        if( AuthRepository.viewVerification() ) {
            $scope.$on('$stateChangeSuccess', function () {
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
                $scope.progress_ban = false; // This is for the loanding simbols or whatever you want to activate
                $scope.total_sales = 0;
                $scope.promedy_sales = 0;
                $scope.orders_completed = 0;
                $scope.ticket_average = 0;
                $scope.discounts = 0;
                $scope.guests = 0;
                $scope.voids_qty = 0;
                $scope.voids_total = 0;
                $scope.cats_done = false
                $scope.dis_done = false
                $scope.credit_cards_done = false
                $scope.voids_done = false
                $scope.cash_done = false
                $scope.totals_done = false
                // Date range variable
                // the important ones area start and end which are already conffigured on the scope
                $scope.date_range = {
                    today: moment().format('MMMM D, YYYY'),
                    last_month: moment().subtract('M', 1).format('MMMM D, YYYY'),
                    date_start: $scope.date_start,
                    date_end: $scope.date_end
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
                        function (start, end) {
                            $('#drp_predefined span').html(start.format("MM/DD/YYYY HH:mm:ss") + ' - ' + end.format("MM/DD/YYYY HH:mm:ss"));
                            $('.date_reports span').html(start.format("MM/DD/YYYY HH:mm:ss") + ' - ' + end.format("MM/DD/YYYY HH:mm:ss"));
                            // When selected the datepicker returns a moment object; this just formats everything to what we need
                            $scope.date_range.date_start = new Date(start.format("MM/DD/YYYY HH:mm:ss"));
                            $scope.date_range.date_end = new Date(end.format("MM/DD/YYYY HH:mm:ss"));
                        }
                    );
                }

                $scope.print_all_reports = function() {
                    var exportHref = Excel.tableToExcel( '#all_reports', 'WireWorkbenchDataExport' );
                    $timeout( function() { 
                        location.href = exportHref; 
                    }, 100);
                }

                $scope.get_locations_reports = function () {
                    
                    let date_1 = ( $scope.date_range.date_start.getMonth() + 1 ) + '/' + $scope.date_range.date_start.getDate() + '/' + $scope.date_range.date_start.getFullYear() + ' ' + $scope.date_range.date_start.getHours() + ':' + $scope.date_range.date_start.getMinutes() + ':' + $scope.date_range.date_start.getSeconds(),
                        date_2 = ( $scope.date_range.date_end.getMonth() + 1 ) + '/' + $scope.date_range.date_end.getDate() + '/' + $scope.date_range.date_end.getFullYear() + ' ' + $scope.date_range.date_end.getHours() + ':' + $scope.date_range.date_end.getMinutes() + ':' + $scope.date_range.date_end.getSeconds();
                    
                    $scope.cats_done = false
                    $scope.dis_done = false
                    $scope.credit_cards_done = false
                    $scope.voids_done = false
                    $scope.cash_done = false
                    $scope.totals_done = false 

                    DashboardRepository.get_sales_by_dates_locations(date_1, date_2).success(function (response) {
                        if( !response.error ) {
                            LocationRepository.getAll().success( function( data ) {
                                if( !data.error ) {
                                    
                                    $scope.locations = data.data;
                                    $scope.locations_sales = response.data.sale_reports
                                    
                                    DashboardRepository.get_totals_by_dates_locations(  date_1, date_2 ).success( function( d1 ) {
                                        if( !response.error ) {
                                            $scope.locations.forEach( l => {
                                                l.sales = response.data.sale_reports.filter( r => r.location == l.id )
                                                l.orders_completed = d1.data.total_orders.filter( r => r.location == l.id ).reduce( ( a, b ) => ( a + b.completed_orders ), 0 )
                                                l.guests = d1.data.total_guests.filter( r => r.location == l.id ).reduce( ( a, b ) => ( a + b.total_guests ), 0 )
                                                l.discounts = d1.data.total_discounts.filter( r => r.location == l.id ).reduce( ( a, b ) => ( a + b.total_discounts ), 0 )
                                                l.discounts_qty = d1.data.total_discounts.filter( r => r.location == l.id ).reduce( ( a, b ) => ( a + b.qty ), 0 )
                                                l.total_sales = l.sales.map(s => s.total).reduce((a, b) => (a + b), 0)
                                                l.total_tax = l.sales.map( s => s.tax1 + s.tax2 + s.tax3 ).reduce( ( a, b ) => ( a + b ), 0)
                                                l.total_vta_neta = l.sales.map( s => s.vta_neta ).reduce( ( a, b ) => ( a + b ), 0)
                                                l.promedy_sales = l.sales.length > 0 ? l.total_sales / l.sales.length : 0
                                                l.ticket_average = l.guests > 0 ? l.total_sales / l.guests : 0
                                            })
                                            $scope.discounts_qty = $scope.locations.reduce( ( a, b ) => ( a + b.discounts_qty ), 0 )
                                            $scope.discounts = $scope.locations.reduce( ( a, b ) => ( a + b.discounts ), 0 )
                                            $scope.total_sales = $scope.locations.reduce( ( a, b ) => ( a + b.total_sales ), 0 )
                                            $scope.total_tax = $scope.locations.reduce( ( a, b ) => ( a + b.total_tax ), 0 )
                                            $scope.total_vta_neta = $scope.locations.reduce( ( a, b ) => ( a + b.total_vta_neta ), 0 )
                                        } else {
                                            growl.error("There was an error;" + response.message, {});
                                        }
                                        $scope.totals_done = true
                                    }).error( function( error ) {
                                        growl.error("There was an error;" + error, {});
                                    })

                                    CreditCardRepository.reportsByDate( date_1, date_2, 0 ).success( function( d1 ) {
                                        if( !d1.error ) {
                                            $scope.creditcard_reports = d1.data.creditcard_reports
                                            $scope.locations.forEach( l => {
                                                l.creditcard_reports = $scope.creditcard_reports.filter( r => r.location == l.id )
                                                l.creditcard_reports_total = $scope.creditcard_reports.filter( r => r.location == l.id ).reduce( ( a, b  ) => ( a + b.amount ), 0 )
                                            })
                                            // Calculate all debit total
                                            $scope.total_credit_card = $scope.locations.map( l => l.creditcard_reports_total ).reduce( ( a, b ) => ( a + b ), 0 )
                                        } else {
                                            growl.error("There was an error;" + d1.message, {});
                                        }    
                                        $scope.credit_cards_done = true
                                    }).error( function( error ) {
                                        growl.error("There was an error;" + error, {});
                                    })
                            
                                    DashboardRepository.get_void_data_by_dates_locations( date_1, date_2 ).success( function( d1 ) {
                                        if( !d1.error ) {
                                            $scope.void_reports = d1.data.void_reports
                                            $scope.locations.forEach( l => {
                                                l.void_reports = $scope.void_reports.filter( r => r.location == l.id )
                                                if( l.void_reports.length > 0 ) {
                                                    l.voids_qty = l.void_reports[0].qty;
                                                    l.voids_total = l.void_reports[0].total;
                                                } else {
                                                    l.voids_qty = 0
                                                    l.voids_total = 0
                                                }
                                            })
                                            $scope.voids_qty = $scope.locations.reduce( ( a, b ) => ( a + b.voids_qty ), 0 )
                                            $scope.voids_total = $scope.locations.reduce( ( a, b ) => ( a + b.voids_total ), 0 )
                                            $scope.voids_done = true
                                        } else {
                                            growl.error("There was an error;" + d1.message, {});
                                        }
                                    }).error(function (error) {
                                        growl.error("There was an error;" + error, {});
                                    });
                                } else {
                                    growl.error("There was an error;" + data.message, {});
                                }
                            }).error( function( error ) {
                                growl.error("There was an error;" + error, {});
                            })

                        } else {
                            growl.error("There was an error;" + response.message, {});
                        } $scope.progress_ban = false;
                    }).error(function (error) {
                        growl.error("There was an error;" + error, {});
                        $scope.progress_ban = false;
                    });
                };
                $scope.get_locations_reports()
            });
        }
    }]);
