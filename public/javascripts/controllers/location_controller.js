yukonApp
    .factory('LocationRepository', ['$http', 'CRUDService', function ($http, CRUDService) {
        var model = 'location';
        return ({
            getAll: () => CRUDService.getAll(model + '/byuser'),
            add: (data) => CRUDService.add(model, data),
            getById: (id) => CRUDService.getById(model, id),
            update: (data) => CRUDService.update(model, data),
            remove: (id) => CRUDService.remove(model, data),
            getAllByBusiness: (business_id) => $http.get('/' + model + '/bybusiness/' + business_id),
            getLocationTodayReports: (d1, d2) => $http.get('/reports/' + model + '/?d1=' + d1 + '&d2=' + d2),
            lastCloses: () => $http.get('/location/lastcloses/')
        });
    }])
    .controller('location-controller', [    '$scope',
                                            '$rootScope',
                                            '$routeParams',
                                            '$location',
                                            'LocationRepository',
                                            'AuthRepository',
                                            function (  $scope,
                                                        $rootScope,
                                                        $routeParams,
                                                        $location,
                                                        LocationRepository,
                                                        AuthRepository  ) {
        if (AuthRepository.viewVerification()) {

            $scope.title = "Locations";

            var getAllLocations = function () {
                LocationRepository.getAll().success(function (data) {
                    if (!data.error) {
                        $scope.locations_table = data.data;
                        $scope.locations = $scope.locations_table;
                    } else {
                        $scope.errors = data.message;
                    }
                }).error(function (error) {
                    $scope.errors = error;
                });
            };

            if ($routeParams.id) {

                LocationRepository.getById($routeParams.id).success(function (data) {
                    if (!data.error) {
                        $scope.location = data.data;
                    } else {
                        $scope.errors = data.message;
                    }
                }).error(function (error) {
                    $scope.errors = error;
                });

                $scope.update = function () {
                    LocationRepository.update($scope.location).success(function (data) {
                        if (!data.error) {
                            $scope.location = data.data;
                            $location.path('/location/');
                        } else {
                            $scope.errors = data.message;
                        }
                    }).error(function (error) {
                        $scope.errors = error;
                    });
                }

            } else {

                $scope.location = {
                    name: "",
                    bussines_id: 0
                }

                $scope.add_from_business = function () {
                    $scope.location.bussines_id = $rootScope.global_business.id;
                    LocationRepository.add($scope.location).success(function (data) {
                        if (!data.error) {
                            $scope.business = data.data;
                            $location.path('/business/' + $rootScope.global_business.id);
                        } else {
                            $scope.errors = data.message;
                        }
                    }).error(function (error) {
                        $scope.errors = error;
                    });
                }
            }
        }
    }])
    .controller('location-reports-controller', [    '$scope',
                                                    '$rootScope',
                                                    '$timeout',
                                                    '$routeParams',
                                                    '$location',
                                                    'LocationRepository',
                                                    'CategoryRepository',
                                                    'DashboardRepository',
                                                    'CreditCardRepository',
                                                    'AuthRepository',
                                                    'Excel',
                                                    'growl',
                                                    function (  $scope,
                                                                $rootScope,
                                                                $timeout,
                                                                $routeParams,
                                                                $location,
                                                                LocationRepository,
                                                                CategoryRepository,
                                                                DashboardRepository,
                                                                CreditCardRepository,
                                                                AuthRepository,
                                                                Excel,
                                                                growl   ) {
        if (AuthRepository.viewVerification()) {
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
            $scope.get_locations_reports = function () {
                let date_1 = ($scope.date_range.date_start.getMonth() + 1) + '/' + $scope.date_range.date_start.getDate() + '/' + $scope.date_range.date_start.getFullYear() + ' ' + $scope.date_range.date_start.getHours() + ':' + $scope.date_range.date_start.getMinutes() + ':' + $scope.date_range.date_start.getSeconds(),
                    date_2 = ($scope.date_range.date_end.getMonth() + 1) + '/' + $scope.date_range.date_end.getDate() + '/' + $scope.date_range.date_end.getFullYear() + ' ' + $scope.date_range.date_end.getHours() + ':' + $scope.date_range.date_end.getMinutes() + ':' + $scope.date_range.date_end.getSeconds();
                $scope.cats_done = false
                $scope.dis_done = false
                $scope.credit_cards_done = false
                $scope.voids_done = false
                $scope.cash_done = false
                $scope.totals_done = false
                DashboardRepository.get_sales_by_dates_locations(date_1, date_2).success(function (response) {
                    if (!response.error) {
                        LocationRepository.getAll().success( function( data ) {
                            if( !data.error ) {
                                $scope.locations = data.data;

                                DashboardRepository.get_totals_by_dates_locations(  date_1, date_2 ).success( function( d1 ) {
                                    if( !d1.error ){
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
                                        $scope.totals_done = true
                                    } else {
                                        growl.error("There was an error;" + d1.message, {});  
                                    }
                                }).error( function( error ) {
                                    growl.error("There was an error;" + error, {});
                                })

                                CategoryRepository.reportsByDate( date_1, date_2, 0 ).success( function( d1 ) {
                                    if( !d1.error ){
                                        $scope.categroy_reports = d1.data.category_reports
                                        $scope.locations.forEach( l => {
                                            l.category_reports = $scope.categroy_reports.filter( r => r.location == l.id )
                                            l.category_reports_qty = $scope.categroy_reports.filter( r => r.location == l.id ).reduce( ( a, b  ) => ( a + b.qty ), 0 )
                                            l.category_reports_total = $scope.categroy_reports.filter( r => r.location == l.id ).reduce( ( a, b  ) => ( a + b.total ), 0 )
                                            l.category_reports_taxes = $scope.categroy_reports.filter( r => r.location == l.id ).reduce( ( a, b  ) => ( a + ( b.tax1 + b.tax2 + b.tax3 ) ), 0 )
                                        })
                                        $scope.cats_done = true
                                    } else {
                                        growl.error("There was an error;" + d1.message, {});  
                                    }
                                }).error( function( error ) {
                                    growl.error("There was an error;" + error, {});
                                })

                                CreditCardRepository.reportsByDate( date_1, date_2, 0 ).success( function( d1 ) {
                                    if( !d1.error ) {
                                        $scope.creditcard_reports = d1.data.creditcard_reports
                                        $scope.locations.forEach( l => {
                                            l.credit_cards = []
                                            $scope.creditcard_reports.filter( cc => cc.location == l.id ).forEach( r => {
                                                let temp = l.credit_cards.find( c_c => c_c.c_t == r.c_t )
                                                temp ? temp.amount += r.amount : l.credit_cards.push( r )
                                            })
                                            l.creditcard_reports_total = $scope.creditcard_reports.filter( r => r.location == l.id ).reduce( ( a, b  ) => ( a + b.amount ), 0 )
                                        })

                                        // Calculate all debit total
                                        $scope.total_credit_card = $scope.locations.map( l => l.creditcard_reports_total ).reduce( ( a, b ) => ( a + b ), 0 )
                                        $scope.credit_cards_done = true
                                    } else {
                                        growl.error("There was an error;" + d1.message, {});  
                                    }
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
                                        $scope.voids_done = true
                                    } else {
                                        growl.error("There was an error;" + d1.message, {});  
                                    }
                                }).error(function (error) {
                                    growl.error("There was an error;" + error, {});
                                });
                                DashboardRepository.get_cash_data_by_dates_locations( date_1, date_2 ).success( function( d1 ) {
                                    if( !d1.error ) {
                                        $scope.cash_reports = d1.data.cash_reports
                                        $scope.locations.forEach( l => {
                                            l.cash_reports = $scope.cash_reports.filter( r => r.location == l.id )[0]
                                        })
                                        $scope.cash_done = true
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
                        $scope.errors = response.message;
                    } $scope.progress_ban = false;
                }).error(function (error) {
                    growl.error("There was an error;" + error, {});
                    $scope.progress_ban = false;
                });
            };
            $scope.get_locations_reports()
            // Export to excel
            $scope.export_location_to_excel = function( location_id ) {
                var exportHref = Excel.tableToExcel( '#' + location_id + '_location', 'WireWorkbenchDataExport' );
                $timeout( function() { 
                    location.href = exportHref; 
                }, 100);
            }
        }
    }]);
