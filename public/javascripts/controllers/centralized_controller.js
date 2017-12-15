yukonApp
    .factory( 'CentralizedRepository', [ '$http', function( $http ) {
        return ({
            get_total_guests_per_locations : ( d1, d2 ) => $http.get( '/reports/guest/?d1=' + d1 + '&d2=' + d2 )
        })
    }])
    .controller( 'centralized-reports-controller', [    '$scope',
                                                        '$rootScope',
                                                        'AuthRepository',
                                                        'LocationRepository',
                                                        'DashboardRepository',
                                                        'CentralizedRepository',
                                                        'FamilyRepository',
                                                        'Excel',
                                                        '$timeout',
                                                        'growl',
                                                        function (  $scope,
                                                                    $rootScope,
                                                                    AuthRepository,
                                                                    LocationRepository,
                                                                    DashboardRepository,
                                                                    CentralizedRepository,
                                                                    FamilyRepository,
                                                                    Excel,
                                                                    $timeout,
                                                                    growl   ) {
            if( AuthRepository.viewVerification() ) {
                
                $scope.full_table_display = true;
                $scope.progress_ban = false; // This is for the loanding simbols or whatever you want to activate
                $scope.users_info = $rootScope.user_info.first_name ? $rootScope.user_info.first_name + ' ' + $rootScope.user_info.last_name : $rootScope.user_info.email;
                $scope.current_year = new Date().getFullYear();
                $scope.last_year = new Date().getFullYear() - 1;
                $scope.target_percentage = 10/100;
                
                //
                //  date picker cofnig
                //
                if ($("#dp_basic").length) {
                    $("#dp_basic").datepicker({
                        autoclose: true
                    });
                }

                //
                //  get all the locations
                //
                LocationRepository.getAll().success(function (response) {
                    if (!response.error) {
                        $scope.locations = response.data
                    } else  {
                        $scope.errors = response.message
                    }
                }).error(function (error) {
                    $scope.errors = error
                })

                //
                //  get_reports gets the reports
                //  @params none
                //  @returns none
                //
                $scope.get_reports = function () {

                    let date_f = document.getElementById('dp_basic').value             
                    $scope.progress_ban = true;

                    if (date_f) {

                        dailyReports(date_f)

                        $timeout(function () {
                            monthlyReports(date_f)
                        }, 1000)

                        yearlyReports(date_f)
                        
                    }
                }

                //
                //  dailyReports gets the daly reports by end date
                //  @param date_f end date
                //  @returns none
                //
                function dailyReports(date_f) {

                    let selected_date = new Date(date_f),
                        daily_date_s = date_f + ' 00:00:00',
                        daily_date_e = date_f + ' 23:59:59',
                        last_year_daily_date_e = (selected_date.getMonth() + 1) + '/' + selected_date.getDate() + '/' + (selected_date.getFullYear() - 1) + ' 23:59:59',
                        last_year_daily_date_s = (selected_date.getMonth() + 1) + '/' + selected_date.getDate() + '/' + (selected_date.getFullYear() - 1) + ' 00:00:00'

                    $scope.the_date = new Date(date_f)
                    $scope.current_year = selected_date.getFullYear();
                    $scope.last_year = selected_date.getFullYear() - 1;

                    DashboardRepository.get_sales_by_dates_locations(daily_date_s, daily_date_e).success(function (response) {
                        if (!response.error) {
                            $scope.locations_sales = response.data
                            CentralizedRepository.get_total_guests_per_locations(daily_date_s, daily_date_e).success(function (r_t) {
                                if (!r_t.error) {
                                    $scope.locations.forEach(l => {
                                        l.guests = r_t.data.total_guests.filter(loc => loc.location == l.id).reduce((a, b) => (a + b.total_guests), 0)
                                        l.total_sales = $scope.locations_sales.sale_reports.filter(loc => loc.location == l.id).reduce((a, b) => (a + b.total), 0)
                                        l.ticket_avg = l.guests > 0 ? l.total_sales / l.guests : 0
                                    });
                                    $scope.daily_guests_total = $scope.locations.reduce((a, b) => (a + b.guests), 0)
                                    $scope.daily_sales_total = $scope.locations.reduce((a, b) => (a + b.total_sales), 0)
                                    $scope.daily_ticket_avg_total = $scope.locations.reduce((a, b) => (a + b.ticket_avg), 0)
                                    
                                } else {
                                    console.log(r_t.message)
                                }
                            }).error(function (error) {
                                console.log(error)
                            })
                            FamilyRepository.reportsByDate( daily_date_s, daily_date_e, 0 ).success( function( d1 ) {
                                if( !d1.error ) { 
                                    $scope.locations.forEach(l => {
                                        l.thisDayFamilies = d1.data.family_reports.filter( r => r.location == l.id ) 
                                        l.thisDayAlimentos = l.thisDayFamilies.filter( r => r.fam_name == 'ALIMENTOS' ).reduce( ( a, b ) => ( a + b.total ), 0 )
                                        l.thisDayNoAlcohol = l.thisDayFamilies.filter( r => r.fam_name == 'BEBIDAS SIN ALCOHOL' ).reduce( ( a, b ) => ( a + b.total ), 0 )
                                        l.thisDayAlcohol = l.thisDayFamilies.filter( r => r.fam_name == 'BEBIDAS CON ALCOHOL' ).reduce( ( a, b ) => ( a + b.total ), 0 )
                                        l.thisDayWines = l.thisDayFamilies.filter( r => r.fam_name == 'VINOS' ).reduce( ( a, b ) => ( a + b.total ), 0 )
                                    });
                                    $scope.thisDayAlimentosTotal =  $scope.locations.reduce( ( a, b ) => ( a + b.thisDayAlimentos ), 0 )
                                    $scope.thisDayNoAlcoholTotal =  $scope.locations.reduce( ( a, b ) => ( a + b.thisDayNoAlcohol ), 0 )
                                    $scope.thisDayAlcoholTotal =  $scope.locations.reduce( ( a, b ) => ( a + b.thisDayAlcohol ), 0 )
                                    $scope.thisDayWinesTotal =  $scope.locations.reduce( ( a, b ) => ( a + b.thisDayWines ), 0 )
                                } else {
                                    growl.error( "There was an error getting the families.", {} )
                                }
                            }).error( function( error ) {
                                growl.error( "There was an error getting the families.", {} )
                            })
                        } else {
                            console.log(response.message)
                        }
                    }).error(function (error) {
                    });

                    DashboardRepository.get_sales_by_dates_locations(last_year_daily_date_s, last_year_daily_date_e).success(function (response2) {
                        if (!response2.error) {
                            $scope.l_y_locations_sales = response2.data
                            CentralizedRepository.get_total_guests_per_locations(last_year_daily_date_s, last_year_daily_date_e).success(function (r_t) {
                                if (!r_t.error) {
                                    $scope.locations.forEach(l => {
                                        l.l_y_guests = r_t.data.total_guests.filter(loc => loc.location == l.id).reduce((a, b) => (a + b.total_guests), 0)
                                        l.l_y_total_sales = $scope.l_y_locations_sales.sale_reports.filter(loc => loc.location == l.id).reduce((a, b) => (a + b.total), 0)
                                        l.l_y_ticket_avg = l.l_y_guests > 0 ? l.l_y_total_sales / l.l_y_guests : 0
                                    });
                                    $scope.l_y_daily_guests_total = $scope.locations.reduce((a, b) => (a + b.l_y_guests), 0)
                                    $scope.l_y_daily_sales_total = $scope.locations.reduce((a, b) => (a + b.l_y_total_sales), 0)
                                    $scope.l_y_daily_ticket_avg_total = $scope.locations.reduce((a, b) => (a + b.l_y_ticket_avg), 0)
                                } else {
                                    console.log(r_t.message)
                                }
                            }).error(function (error) {
                                console.log(error)
                            })
                            FamilyRepository.reportsByDate( last_year_daily_date_s, last_year_daily_date_e, 0 ).success( function( d1 ) {
                                if( !d1.error ) { 
                                    $scope.locations.forEach(l => {
                                        l.lastDayFamilies = d1.data.family_reports.filter( r => r.location == l.id )
                                        l.lastDayAlimentos = l.lastDayFamilies.filter( r => r.fam_name == 'ALIMENTOS' ).reduce( ( a, b ) => ( a + b.total ), 0 )
                                        l.lastDayNoAlcohol = l.lastDayFamilies.filter( r => r.fam_name == 'BEBIDAS SIN ALCOHOL' ).reduce( ( a, b ) => ( a + b.total ), 0 )
                                        l.lastDayAlcohol = l.lastDayFamilies.filter( r => r.fam_name == 'BEBIDAS CON ALCOHOL' ).reduce( ( a, b ) => ( a + b.total ), 0 )
                                        l.lastDayWines = l.lastDayFamilies.filter( r => r.fam_name == 'VINOS' ).reduce( ( a, b ) => ( a + b.total ), 0 )
                                    });
                                    $scope.lastDayAlimentosTotal =  $scope.locations.reduce( ( a, b ) => ( a + b.lastDayAlimentos ), 0 )
                                    $scope.lastDayNoAlcoholTotal =  $scope.locations.reduce( ( a, b ) => ( a + b.lastDayNoAlcohol ), 0 )
                                    $scope.lastDayAlcoholTotal =  $scope.locations.reduce( ( a, b ) => ( a + b.lastDayAlcohol ), 0 )
                                    $scope.lastDayWinesTotal =  $scope.locations.reduce( ( a, b ) => ( a + b.lastDayWines ), 0 )
                                } else {
                                    growl.error( "There was an error getting the families.", {} )
                                }
                            }).error( function( error ) {
                                growl.error( "There was an error getting the families.", {} )
                            })
                        } else {
                            console.log(response2.message)
                        }
                    }).error(function (error) {
                    });
                    
                    
                }

                //
                //  monthlyReports gets the monthly reports by end date
                //  @params date_f the end date
                //  @return none
                //
                function monthlyReports(date_f) {

                    let selected_date = new Date(date_f)
                        daily_date_e = date_f + ' 23:59:59',
                        monthly_date_s = (selected_date.getMonth() + 1) + '/01/' + selected_date.getFullYear() + ' 00:00:00',
                        last_year_daily_date_e = (selected_date.getMonth() + 1) + '/' + selected_date.getDate() + '/' + (selected_date.getFullYear() - 1) + ' 23:59:59',
                        last_year_monthly_date_s = (selected_date.getMonth() + 1) + '/01/' + (selected_date.getFullYear() - 1) + ' 00:00:00'

                    DashboardRepository.get_sales_by_dates_locations(monthly_date_s, daily_date_e).success(function (response) {
                        if (!response.error) {
                            $scope.m_locations_sales = response.data
                            CentralizedRepository.get_total_guests_per_locations(monthly_date_s, daily_date_e).success(function (r_t) {
                                if (!r_t.error) {
                                    $scope.locations.forEach(l => {
                                        l.m_total_sales = $scope.m_locations_sales.sale_reports.filter(loc => loc.location == l.id).reduce((a, b) => (a + b.total), 0)
                                        l.m_guests = r_t.data.total_guests.filter(loc => loc.location == l.id).reduce((a, b) => (a + b.total_guests), 0)
                                        l.m_ticket_avg = l.m_guests > 0 ? l.m_total_sales / l.m_guests : 0
                                    });
                                    $scope.monthly_ticket_avg_total = $scope.locations.reduce((a, b) => (a + b.m_ticket_avg), 0)
                                    $scope.monthly_sales_total = $scope.locations.reduce((a, b) => (a + b.m_total_sales), 0)
                                    $scope.monthly_guests_total = $scope.locations.reduce((a, b) => (a + b.m_guests), 0)
                                } else {
                                    console.log(r_t.message)
                                }
                            }).error(function (error) {
                                console.log(error)
                            })

                            FamilyRepository.reportsByDate( monthly_date_s, daily_date_e, 0 ).success( function( d1 ) {
                                if( !d1.error ) { 
                                    $scope.locations.forEach(l => {
                                        l.thisMonthFamilies = d1.data.family_reports.filter( r => r.location == l.id ) 
                                        l.thisMonthAlimentos = l.thisMonthFamilies.filter( r => r.fam_name == 'ALIMENTOS' ).reduce( ( a, b ) => ( a + b.total ), 0 )
                                        l.thisMonthNoAlcohol = l.thisMonthFamilies.filter( r => r.fam_name == 'BEBIDAS SIN ALCOHOL' ).reduce( ( a, b ) => ( a + b.total ), 0 )
                                        l.thisMonthAlcohol = l.thisMonthFamilies.filter( r => r.fam_name == 'BEBIDAS CON ALCOHOL' ).reduce( ( a, b ) => ( a + b.total ), 0 )
                                        l.thisMonthWines = l.thisMonthFamilies.filter( r => r.fam_name == 'VINOS' ).reduce( ( a, b ) => ( a + b.total ), 0 )
                                    });
                                    $scope.thisMonthAlimentosTotal =  $scope.locations.reduce( ( a, b ) => ( a + b.thisMonthAlimentos ), 0 )
                                    $scope.thisMonthNoAlcoholTotal =  $scope.locations.reduce( ( a, b ) => ( a + b.thisMonthNoAlcohol ), 0 )
                                    $scope.thisMonthAlcoholTotal =  $scope.locations.reduce( ( a, b ) => ( a + b.thisMonthAlcohol ), 0 )
                                    $scope.thisMonthWinesTotal =  $scope.locations.reduce( ( a, b ) => ( a + b.thisMonthWines ), 0 )
                                } else {
                                    growl.error( "There was an error getting the families.", {} )
                                }
                            }).error( function( error ) {
                                growl.error( "There was an error getting the families.", {} )
                            })
                        } else {
                            console.log(response.message)
                        }
                    }).error(function (error) {
                    });
                    
                    DashboardRepository.get_sales_by_dates_locations(last_year_monthly_date_s, last_year_daily_date_e).success(function (response2) {
                        if (!response2.error) {
                            $scope.l_y_m_locations_sales = response2.data
                            CentralizedRepository.get_total_guests_per_locations(last_year_monthly_date_s, last_year_daily_date_e).success(function (r_t) {
                                if (!r_t.error) {
                                    $scope.locations.forEach(l => {
                                        l.l_y_m_total_sales = $scope.l_y_m_locations_sales.sale_reports.filter(loc => loc.location == l.id).reduce((a, b) => (a + b.total), 0)
                                        l.l_y_m_guests = r_t.data.total_guests.filter(loc => loc.location == l.id).reduce((a, b) => (a + b.total_guests), 0)
                                        l.l_y_m_ticket_avg = l.l_y_m_guests > 0 ? l.l_y_m_total_sales / l.l_y_m_guests : 0
                                    });
                                    $scope.l_y_monthly_guests_total = $scope.locations.reduce((a, b) => (a + b.l_y_m_guests), 0)
                                    $scope.l_y_monthly_sales_total = $scope.locations.reduce((a, b) => (a + b.l_y_m_total_sales), 0)
                                    $scope.l_y_monthly_ticket_avg_total = $scope.locations.reduce((a, b) => (a + b.l_y_m_ticket_avg), 0)
                                } else {
                                    console.log(r_t.message)
                                }
                            }).error(function (error) {
                                console.log(error)
                            })
                            FamilyRepository.reportsByDate( last_year_monthly_date_s, last_year_daily_date_e, 0 ).success( function( d1 ) {
                                if( !d1.error ) {
                                    $scope.locations.forEach(l => {
                                        l.lastMonthFamilies = d1.data.family_reports.filter( r => r.location == l.id ) 
                                        l.lastMonthAlimentos = l.lastMonthFamilies.filter( r => r.fam_name == 'ALIMENTOS' ).reduce( ( a, b ) => ( a + b.total ), 0 )
                                        l.lastMonthNoAlcohol = l.lastMonthFamilies.filter( r => r.fam_name == 'BEBIDAS SIN ALCOHOL' ).reduce( ( a, b ) => ( a + b.total ), 0 )
                                        l.lastMonthAlcohol = l.lastMonthFamilies.filter( r => r.fam_name == 'BEBIDAS CON ALCOHOL' ).reduce( ( a, b ) => ( a + b.total ), 0 )
                                        l.lastMonthWines = l.lastMonthFamilies.filter( r => r.fam_name == 'VINOS' ).reduce( ( a, b ) => ( a + b.total ), 0 )
                                    });
                                    $scope.lastMonthAlimentosTotal = $scope.locations.reduce( ( a, b ) => ( a + b.lastMonthAlimentos ), 0 )
                                    $scope.lastMonthNoAlcoholTotal = $scope.locations.reduce( ( a, b ) => ( a + b.lastMonthNoAlcohol ), 0 )
                                    $scope.lastMonthAlcoholTotal = $scope.locations.reduce( ( a, b ) => ( a + b.lastMonthAlcohol ), 0 )
                                    $scope.lastMonthWinesTotal = $scope.locations.reduce( ( a, b ) => ( a + b.lastMonthWines ), 0 )
                                } else {
                                    growl.error( "There was an error getting the families.", {} )
                                }
                            }).error( function( error ) {
                                growl.error( "There was an error getting the families.", {} )
                            })
                        } else {
                            console.log(response2.message)
                        }
                    }).error(function (error) {
                    });

                }

                //  
                //  yearlyReports gets the yearly reports by date
                //  @param date_f the end date
                //  @returns none
                //  
                function yearlyReports(date_f) {

                    let selected_date = new Date(date_f)
                        daily_date_e = date_f + ' 23:59:59',
                        yearly_date_s = '01/01/' + selected_date.getFullYear() + ' 00:00:00',
                        last_year_daily_date_e = (selected_date.getMonth() + 1) + '/' + selected_date.getDate() + '/' + (selected_date.getFullYear() - 1) + ' 23:59:59',
                        last_year_yearly_date_s = '01/01/' + (selected_date.getFullYear() - 1) + ' 00:00:00'

                    $timeout(function () {
                        DashboardRepository.get_sales_by_dates_locations(yearly_date_s, daily_date_e).success(function (response) {
                            if (!response.error) {
                                $scope.y_locations_sales = response.data
                                CentralizedRepository.get_total_guests_per_locations(yearly_date_s, daily_date_e).success(function (r_t) {
                                    if (!r_t.error) {
                                        $scope.locations.forEach(l => {
                                            l.y_total_sales = $scope.y_locations_sales.sale_reports.filter(loc => loc.location == l.id).reduce((a, b) => (a + b.total), 0)
                                            l.y_guests = r_t.data.total_guests.filter(loc => loc.location == l.id).reduce((a, b) => (a + b.total_guests), 0)
                                            l.y_ticket_avg = l.y_guests > 0 ? l.y_total_sales / l.y_guests : 0
                                        });
                                        $scope.yearly_ticket_avg_total = $scope.locations.reduce((a, b) => (a + b.y_ticket_avg), 0)
                                        $scope.yearly_sales_total = $scope.locations.reduce((a, b) => (a + b.y_total_sales), 0)
                                        $scope.yearly_guests_total = $scope.locations.reduce((a, b) => (a + b.y_guests), 0)
                                    } else {
                                        console.log(r_t.message)
                                    }
                                }).error(function (error) {
                                    console.log(error)
                                })
                            } else {
                                console.log(response.message)
                            }
                            FamilyRepository.reportsByDate( yearly_date_s, daily_date_e, 0 ).success( function( d1 ) {
                                if( !d1.error ) { 
                                    $scope.locations.forEach(l => {
                                        l.thisYearFamilies = d1.data.family_reports.filter( r => r.location == l.id ) 
                                        l.thisYearAlimentos = l.thisYearFamilies.filter( r => r.fam_name == 'ALIMENTOS' ).reduce( ( a, b ) => ( a + b.total ), 0 )
                                        l.thisYearNoAlcohol = l.thisYearFamilies.filter( r => r.fam_name == 'BEBIDAS SIN ALCOHOL' ).reduce( ( a, b ) => ( a + b.total ), 0 )
                                        l.thisYearAlcohol = l.thisYearFamilies.filter( r => r.fam_name == 'BEBIDAS CON ALCOHOL' ).reduce( ( a, b ) => ( a + b.total ), 0 )
                                        l.thisYearWines = l.thisYearFamilies.filter( r => r.fam_name == 'VINOS' ).reduce( ( a, b ) => ( a + b.total ), 0 )
                                    });
                                    $scope.thisYearAlimentosTotal = $scope.locations.reduce( ( a, b ) => ( a + b.thisYearAlimentos ), 0 )
                                    $scope.thisYearNoAlcoholTotal = $scope.locations.reduce( ( a, b ) => ( a + b.thisYearNoAlcohol ), 0 )
                                    $scope.thisYearAlcoholTotal = $scope.locations.reduce( ( a, b ) => ( a + b.thisYearAlcohol ), 0 )
                                    $scope.thisYearWinesTotal = $scope.locations.reduce( ( a, b ) => ( a + b.thisYearWines ), 0 )
                                } else {
                                    growl.error( "There was an error getting the families.", {} )
                                }
                            }).error( function( error ) {
                                growl.error( "There was an error getting the families.", {} )
                            })
                        }).error(function (error) {
                        });
                    }, 2000 );

                    $timeout(function() {
                        DashboardRepository.get_sales_by_dates_locations(last_year_yearly_date_s, last_year_daily_date_e).success(function (response2) {
                            if (!response2.error) {
                                $scope.l_y_y_locations_sales = response2.data
                                CentralizedRepository.get_total_guests_per_locations(last_year_yearly_date_s, last_year_daily_date_e).success(function (r_t) {
                                    if (!r_t.error) {
                                        $scope.locations.forEach(l => {
                                            l.l_y_y_total_sales = $scope.l_y_y_locations_sales.sale_reports.filter(loc => loc.location == l.id).reduce((a, b) => (a + b.total), 0)
                                            l.l_y_y_guests = r_t.data.total_guests.filter(loc => loc.location == l.id).reduce((a, b) => (a + b.total_guests), 0)
                                            l.l_y_y_ticket_avg = l.l_y_y_guests > 0 ? l.l_y_y_total_sales / l.l_y_y_guests : 0
                                        });
                                        $scope.l_y_yearly_guests_total = $scope.locations.reduce((a, b) => (a + b.l_y_y_guests), 0)
                                        $scope.l_y_yearly_sales_total = $scope.locations.reduce((a, b) => (a + b.l_y_y_total_sales), 0)
                                        $scope.l_y_yearly_ticket_avg_total = $scope.locations.reduce((a, b) => (a + b.l_y_y_ticket_avg), 0)
                                    } else {
                                        console.log(r_t.message)
                                    }
                                    $scope.progress_ban = false
                                }).error(function (error) {
                                    $scope.progress_ban = false
                                })
                            } else {
                                console.log(response2.message)
                            }

                            FamilyRepository.reportsByDate( last_year_yearly_date_s, last_year_daily_date_e, 0 ).success( function( d1 ) {
                                if( !d1.error ) { 
                                    $scope.locations.forEach(l => {
                                        l.lastYearFamilies = d1.data.family_reports.filter( r => r.location == l.id ) 
                                        l.lastYearAlimentos = l.lastYearFamilies.filter( r => r.fam_name == 'ALIMENTOS' ).reduce( ( a, b ) => ( a + b.total ), 0 )
                                        l.lastYearNoAlcohol = l.lastYearFamilies.filter( r => r.fam_name == 'BEBIDAS SIN ALCOHOL' ).reduce( ( a, b ) => ( a + b.total ), 0 )
                                        l.lastYearAlcohol = l.lastYearFamilies.filter( r => r.fam_name == 'BEBIDAS CON ALCOHOL' ).reduce( ( a, b ) => ( a + b.total ), 0 )
                                        l.lastYearWines = l.lastYearFamilies.filter( r => r.fam_name == 'VINOS' ).reduce( ( a, b ) => ( a + b.total ), 0 )
                                    });
                                    $scope.lastYearAlimentosTotal = $scope.locations.reduce( ( a, b ) => ( a + b.lastYearAlimentos ), 0 )
                                    $scope.lastYearNoAlcoholTotal = $scope.locations.reduce( ( a, b ) => ( a + b.lastYearNoAlcohol ), 0 )
                                    $scope.lastYearAlcoholTotal = $scope.locations.reduce( ( a, b ) => ( a + b.lastYearAlcohol ), 0 )
                                    $scope.lastYearWinesTotal = $scope.locations.reduce( ( a, b ) => ( a + b.lastYearWines ), 0 )
                                } else {
                                    growl.error( "There was an error getting the families.", {} )
                                }
                            }).error( function( error ) {
                                growl.error( "There was an error getting the families.", {} )
                            })
                        }).error(function (error) {
                        });
                    }, 4000 );
                }

                //
                //  print_reports prints the reports on an excel sheet
                //  @params none
                //  @returns none
                //
                $scope.print_reports = function () {
                    var exportHref = Excel.tableToExcel('#export_table', 'WireWorkbenchDataExport');
                    $timeout(function () {
                        location.href = exportHref;
                    }, 100);
                }
            }
        }])