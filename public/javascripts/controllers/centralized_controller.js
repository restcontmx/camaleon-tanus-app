yukonApp
    .controller('centralized-reports-controller', ['$scope',
        '$rootScope',
        'AuthRepository',
        'LocationRepository',
        'DashboardRepository',
        'Excel',
        '$timeout',
        function ($scope,
            $rootScope,
            AuthRepository,
            LocationRepository,
            DashboardRepository,
            Excel,
            $timeout) {

           
            $scope.full_table_display = true;
            $scope.progress_ban = false; // This is for the loanding simbols or whatever you want to activate
            $scope.users_info = $rootScope.user_info.first_name ? $rootScope.user_info.first_name + ' ' + $rootScope.user_info.last_name : $rootScope.user_info.email;
            $scope.current_year = new Date().getFullYear();
            $scope.last_year = new Date().getFullYear() - 1;
            $scope.target_percentage = 10/100;
            if ($("#dp_basic").length) {
                $("#dp_basic").datepicker({
                    autoclose: true
                });
            }

            LocationRepository.getAll().success(function (response) {
                if (!response.error) {
                    $scope.locations = response.data
                } else  {
                    $scope.errors = response.message
                }
            }).error(function (error) {
                $scope.errors = error
            })
            $scope.get_reports = function () {
                $scope.progress_ban = true; // This is for the loanding simbols or whatever you want to activate
                let date_f = document.getElementById('dp_basic').value
                if (date_f) {

                    dailyReports(date_f)

                    $timeout(function () {
                        monthlyReports(date_f)
                    }, 1000)

                    $timeout(function () {
                        yearlyReports(date_f)
                    }, 2000)
                    
                }
            }
            function dailyReports(date_f) {
                $scope.the_date = new Date(date_f)
                let selected_date = new Date(date_f)
                $scope.current_year = selected_date.getFullYear();
                $scope.last_year = selected_date.getFullYear() - 1;
                let daily_date_s = date_f + ' 00:00:00',
                    daily_date_e = date_f + ' 23:59:59'
                let last_year_daily_date_e = (selected_date.getMonth() + 1) + '/' + selected_date.getDate() + '/' + (selected_date.getFullYear() - 1) + ' 23:59:59'
                let last_year_daily_date_s = (selected_date.getMonth() + 1) + '/' + selected_date.getDate() + '/' + (selected_date.getFullYear() - 1) + ' 00:00:00'

                DashboardRepository.get_sales_by_dates_locations(daily_date_s, daily_date_e).success(function (response) {
                    if (!response.error) {
                        $scope.locations_sales = response.data
                        DashboardRepository.get_totals_by_dates_locations(daily_date_s, daily_date_e).success(function (r_t) {
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

                    } else {
                        console.log(response.message)
                    }
                }).error(function (error) {
                });

                DashboardRepository.get_sales_by_dates_locations(last_year_daily_date_s, last_year_daily_date_e).success(function (response2) {
                    if (!response2.error) {
                        $scope.l_y_locations_sales = response2.data
                        DashboardRepository.get_totals_by_dates_locations(last_year_daily_date_s, last_year_daily_date_e).success(function (r_t) {
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
                    } else {
                        console.log(response2.message)
                    }
                }).error(function (error) {
                });

            }
            function monthlyReports(date_f) {
                let selected_date = new Date(date_f)
                let daily_date_e = date_f + ' 23:59:59'
                let monthly_date_s = (selected_date.getMonth() + 1) + '/01/' + selected_date.getFullYear() + ' 00:00:00'
                let last_year_daily_date_e = (selected_date.getMonth() + 1) + '/' + selected_date.getDate() + '/' + (selected_date.getFullYear() - 1) + ' 23:59:59'
                let last_year_monthly_date_s = (selected_date.getMonth() + 1) + '/01/' + (selected_date.getFullYear() - 1) + ' 00:00:00'

                DashboardRepository.get_sales_by_dates_locations(monthly_date_s, daily_date_e).success(function (response) {
                    if (!response.error) {
                        $scope.m_locations_sales = response.data
                        DashboardRepository.get_totals_by_dates_locations(monthly_date_s, daily_date_e).success(function (r_t) {
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
                    } else {
                        console.log(response.message)
                    }
                }).error(function (error) {
                });

                DashboardRepository.get_sales_by_dates_locations(last_year_monthly_date_s, last_year_daily_date_e).success(function (response2) {
                    if (!response2.error) {
                        $scope.l_y_m_locations_sales = response2.data
                        DashboardRepository.get_totals_by_dates_locations(last_year_monthly_date_s, last_year_daily_date_e).success(function (r_t) {
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
                    } else {
                        console.log(response2.message)
                    }
                }).error(function (error) {
                });
            }
            // Get the yearly reports by date
            function yearlyReports(date_f) {
                let selected_date = new Date(date_f)
                let daily_date_e = date_f + ' 23:59:59'
                let yearly_date_s = '01/01/' + selected_date.getFullYear() + ' 00:00:00'
                let last_year_daily_date_e = (selected_date.getMonth() + 1) + '/' + selected_date.getDate() + '/' + (selected_date.getFullYear() - 1) + ' 23:59:59'
                let last_year_yearly_date_s = '01/01/' + (selected_date.getFullYear() - 1) + ' 00:00:00'

                DashboardRepository.get_sales_by_dates_locations(yearly_date_s, daily_date_e).success(function (response) {
                    if (!response.error) {
                        $scope.y_locations_sales = response.data
                        DashboardRepository.get_totals_by_dates_locations(yearly_date_s, daily_date_e).success(function (r_t) {
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
                }).error(function (error) {
                });

                DashboardRepository.get_sales_by_dates_locations(last_year_yearly_date_s, last_year_daily_date_e).success(function (response2) {
                    if (!response2.error) {
                        $scope.l_y_y_locations_sales = response2.data
                        DashboardRepository.get_totals_by_dates_locations(last_year_yearly_date_s, last_year_daily_date_e).success(function (r_t) {
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
                }).error(function (error) {
                });
            }



            $scope.print_reports = function () {
                var exportHref = Excel.tableToExcel('#export_table', 'WireWorkbenchDataExport');
                $timeout(function () {
                    location.href = exportHref;
                }, 100);
            }

        }])