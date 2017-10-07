/* Controllers */
yukonApp
    .controller('mainCtrl', [
        '$scope',
        function ($scope) {
        }
    ])
    .controller('styleSwitcher', [
        '$rootScope',
        '$scope',
        '$timeout',
        '$modal',
        function ($rootScope, $scope, $timeout, $modal) {

            $scope.styleSwitcherToggle = false;
            $scope.toggleStyleSwitcher = function () {
                $scope.styleSwitcherToggle = !$scope.styleSwitcherToggle;
            };

            $rootScope.tbStyleActive = 'style_9';
            $scope.topBarColor = function (style) {
                $rootScope.topBarColor = 'topBar_style_9';
                $rootScope.tbStyleActive = 'style_9';
            };

            $rootScope.bgActive = 'bg_9';
            $scope.siteBg = function (bg) {
                $rootScope.siteBg = bg;
                $rootScope.bgActive = bg;
            };

            // layout switch
            $rootScope.fixedLayout = false;
            $('#fixed_layout_switch').on('change', function () {
                $rootScope.fixedLayout = !$rootScope.fixedLayout;
                $timeout(function () {
                    $(window).resize();
                })
            });

            // menu position
            $('#top_menu_switch').attr('checked', false).on('change', function () {
                $rootScope.topMenuAct = !$rootScope.topMenuAct;
                $rootScope.sideMenuAct = !$rootScope.sideMenuAct;
                console.log($rootScope.sideNavCollapsed);
                console.log($rootScope.topMenuAct);
                if (!$rootScope.sideNavCollapsed && !$rootScope.topMenuAct) {
                    $rootScope.createScrollbar();
                } else {
                    $rootScope.destroyScrollbar();
                }
                $timeout(function () {
                    $(window).resize();
                })
            });

            // hide breadcumbs
            $rootScope.hideBreadcrumbs = false;
            $('#breadcrumbs_switch').attr('checked', false).on('change', function () {
                $rootScope.hideBreadcrumbs = !$rootScope.hideBreadcrumbs;
            });


            $scope.showCSS = function () {
                var modalInstance = $modal.open({
                    templateUrl: 'views/partials/bootstrapModalNoBtns.html',
                    size: 'lg',
                    controller: function ($scope, $modalInstance) {

                        $bodyClasses = $('body').attr('class');
                        $headerClasses = $('#main_header').attr('class');

                        $bodyClassesStr =
                            '// &lt;body&gt; classes'
                            + '<br>&lt;body class="' + $bodyClasses + '"&gt;...&lt;/body&gt;';

                        if ($headerClasses != '') {
                            $headerClassesStr =
                                '<br><br>'
                                + '// &lt;header&gt; classes'
                                + '<br>&lt;header id="main_header" class="' + $headerClasses + '"&gt;...&lt;/header&gt;';
                        } else {
                            $headerClassesStr = '';
                        }

                        $scope.modalTitle = 'CSS classes';
                        $scope.modalContent =
                            '<pre>'
                            + $bodyClassesStr
                            + $headerClassesStr
                            + '</pre>';

                        $scope.cancel = function () {
                            $modalInstance.dismiss('cancel');
                        };

                    }
                });
            };

        }
    ])
    .controller('sideMenuCtrl', [
        '$rootScope',
        '$scope',
        '$state',
        '$stateParams',
        '$timeout',
        function ($rootScope, $scope, $state, $stateParams, $timeout) {
            $scope.sections = [
                {
                    id: 0,
                    title: 'Dashboard',
                    icon: 'icon_house_alt first_level_icon',
                    link: 'auth.home'
                },
                {
                    id: 1,
                    title: 'Support',
                    icon: 'icon_tools first_level_icon',
                    submenu_title: 'Support',
                    submenu: [
                        {
                            title: 'Items',
                            link: 'auth.support.items.edit'
                        },
                        {
                            title: 'Classes',
                            link: 'auth.support.classes'
                        },
                        {
                            title: 'Categories',
                            link: 'auth.support.categories'
                        },
                        {
                            title: 'Departments',
                            link: 'auth.support.departments'
                        },
                        {
                            title: 'Families',
                            link: 'auth.support.families'
                        },
                        {
                            title: 'Sub Families',
                            link: 'auth.support.sub_families'
                        }

                    ]
                },
                {
                    id: 2,
                    title: 'Reports',
                    icon: 'icon_piechart first_level_icon',
                    badge: false,
                    submenu_title: 'Reports',
                    submenu: [
                        {
                            title: 'Categories',
                            link: 'auth.reports.categories'
                        },
                        {
                            title: 'Classes',
                            link: 'auth.reports.classes'
                        },
                        {
                            title: 'Departments',
                            link: 'auth.reports.departments'
                        },
                        {
                            title: 'Close',
                            link: 'auth.reports.close'
                        },
                        {
                            title: 'Discount',
                            link: 'auth.reports.discount'
                        },
                        {
                            title: 'Void',
                            link: 'auth.reports.void'
                        },
                        {
                            title: 'Tickets',
                            link: 'auth.reports.tickets'
                        },
                        {
                            title: 'Items',
                            link: 'auth.reports.items'
                        },
                        {
                            title: 'Locations',
                            link: 'auth.reports.locations'
                        },
                        {
                            title: 'By Employee',
                            link: 'auth.reports.by_employee'
                        },
                        {
                            title: 'By Turn',
                            link: 'auth.reports.by_turn'
                        }
                    ]
                },
                {
                    id: 3,
                    title: 'Settings',
                    icon: 'icon_cogs first_level_icon',
                    badge: true,
                    submenu_title: 'settings',
                    submenu: [
                        {
                            title: 'Security Levels',
                            link: 'auth.settings.security.users'
                        },
                        {
                            title: 'Turns',
                            link: 'auth.settings.turns.list'
                        }
                    ]
                }
            ];

            // accordion menu
            $(document).off('click', '.side_menu_expanded #main_menu .has_submenu > a').on('click', '.side_menu_expanded #main_menu .has_submenu > a', function () {
                if ($(this).parent('.has_submenu').hasClass('first_level')) {
                    var $this_parent = $(this).parent('.has_submenu'),
                        panel_active = $this_parent.hasClass('section_active');

                    if (!panel_active) {
                        $this_parent.siblings().removeClass('section_active').children('ul').slideUp('200');
                        $this_parent.addClass('section_active').children('ul').slideDown('200');
                    } else {
                        $this_parent.removeClass('section_active').children('ul').slideUp('200');
                    }
                } else {
                    var $submenu_parent = $(this).parent('.has_submenu'),
                        submenu_active = $submenu_parent.hasClass('submenu_active');

                    if (!submenu_active) {
                        $submenu_parent.siblings().removeClass('submenu_active').children('ul').slideUp('200');
                        $submenu_parent.addClass('submenu_active').children('ul').slideDown('200');
                    } else {
                        $submenu_parent.removeClass('submenu_active').children('ul').slideUp('200');
                    }
                }
            });

            $rootScope.createScrollbar = function () {
                $("#main_menu .menu_wrapper").mCustomScrollbar({
                    theme: "minimal-dark",
                    scrollbarPosition: "outside"
                });
            };

            $rootScope.destroyScrollbar = function () {
                $("#main_menu .menu_wrapper").mCustomScrollbar('destroy');
            };

            $timeout(function () {
                if (!$rootScope.sideNavCollapsed && !$rootScope.topMenuAct) {
                    if (!$('#main_menu .has_submenu').hasClass('section_active')) {
                        $('#main_menu .has_submenu .act_nav').closest('.has_submenu').children('a').click();
                    } else {
                        $('#main_menu .has_submenu.section_active').children('ul').show();
                    }
                    // init scrollbar
                    $rootScope.createScrollbar();
                }
            });
        }
    ])
    .controller('loginCtrl', [
        '$scope',
        '$timeout',
        function ($scope, $timeout) {
            $scope.loginForm = true;
            $scope.switchForm = function (form) {
                $scope.loginForm = !$scope.loginForm;
                $('.form_wrapper').removeClass('fadeInUpBig');
                $timeout(function () {
                    $('.form_wrapper').removeClass('fadeOutDownBig').hide();
                    $('#' + form).show().addClass('fadeInUpBig');
                }, 300)
            }
        }
    ])
    .factory( 'DashboardRepository', [ '$http', function( $http ) {
        return({
            get_sales_by_dates : ( d1, d2 ) => $http.get( '/dashboard/sales/?d1=' + d1 + '&d2=' + d2 ),
            get_void_data_by_dates : ( d1, d2 ) => $http.get( '/dashboard/voids/?d1=' + d1 + '&d2=' + d2 )
        });
    }])
    .controller('dashboardCtrl', [
        '$scope',
        'files',
        'AuthRepository',
        'DashboardRepository',
        'LocationRepository',
        function ($scope, files, AuthRepository, DashboardRepository, LocationRepository ) {
            $scope.$on('$stateChangeSuccess', function () {
                if( AuthRepository.viewVerification( ) ) {
                    // run scripts after state load
                    // init dashboard functions
                    $scope.$watch('countries_data', function () {

                        countries_data = $scope.countries_data;

                        var chart_c3_sales = c3.generate({
                            bindto: '#c3_sales',
                            data: {
                                x: 'x',
                                columns: [ ],
                                types: {
                                }
                            },
                            axis: {
                                x: {
                                    type: 'timeseries',
                                    tick: {
                                        culling: false,
                                        fit: true,
                                        format: "%b"
                                    }
                                },
                                y : {
                                    tick: {
                                        format: d3.format("$,")
                                    }
                                }
                            },
                            point: {
                                r: '4',
                                focus: {
                                    expand: {
                                        r: '5'
                                    }
                                }
                            },
                            bar: {
                                width: {
                                    ratio: 0.4 // this makes bar width 50% of length between ticks
                                }
                            },
                            grid: {
                                x: {
                                    show: true
                                },
                                y: {
                                    show: true
                                }
                            },
                            color: {
                                pattern: ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf']
                            }
                        });
            
                        $('.chart_switch').on('click', function() {
                            
                            if($(this).data('chart') == 'line') {
                                chart_c3_sales.transform('area', '2013');
                                chart_c3_sales.transform('line', '2014');
                            } else if($(this).data('chart') == 'bar') {	
                                chart_c3_sales.transform('bar', '2013');
                                chart_c3_sales.transform('line', '2014');
                            }
                            
                            $('.chart_switch').toggleClass('btn-default btn-link');
                            
                        });
            
                        $(window).on("debouncedresize", function() {
                            chart_c3_sales.resize();
                        });

                        var chart_c3_users_age = c3.generate({
                            bindto: '#c3_users_age',
                            data: {
                                columns: [
                                    ['18-24', 18],
                                    ['25-32', 42],
                                    ['33-40', 31],
                                    ['41-57', 9]
                                    
                                ],
                                type : 'donut'
                            },
                            donut: {
                                onclick: function (d, i) { console.log(d, i); },
                                onmouseover: function (d, i) { console.log(d, i); },
                                onmouseout: function (d, i) { console.log(d, i); }
                            }
                        });
                        $(window).on("debouncedresize", function() {
                            chart_c3_users_age.resize();
                        });

                        var chart_c3_orders = c3.generate({
                            bindto: '#c3_orders',
                            data: {
                                columns: [
                                    ['New', 64],
                                    ['In Progrees', 36]
                                    
                                ],
                                type : 'pie'
                            },
                            pie: {
                                onclick: function (d, i) { console.log(d, i); },
                                onmouseover: function (d, i) { console.log(d, i); },
                                onmouseout: function (d, i) { console.log(d, i); }
                            }
                        });
                        
                        $(window).on("debouncedresize", function() {
                            chart_c3_orders.resize();
                        });

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
                        $scope.progress_ban = false; // This is for the loanding simbols or whatever you want to activate
                        $scope.total_sales = 0;
                        $scope.promedy_sales = 0;
                        $scope.orders_completed = 0;
                        $scope.ticket_average = 0;
                        $scope.discounts = 0;
                        $scope.guests = 0;
                        $scope.voids_qty = 0;
                        $scope.voids_total = 0;
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
                        $scope.get_reports = function() {
                            
                            $scope.progress_ban = true;
                            let date_1  = ( $scope.date_range.date_start.getMonth() + 1) + '/' + $scope.date_range.date_start.getDate() + '/' + $scope.date_range.date_start.getFullYear() + ' ' + $scope.date_range.date_start.getHours() + ':' + $scope.date_range.date_start.getMinutes() + ':' + $scope.date_range.date_start.getSeconds(),
                                date_2  = ( $scope.date_range.date_end.getMonth() + 1) + '/' + $scope.date_range.date_end.getDate() + '/' + $scope.date_range.date_end.getFullYear() + ' ' + $scope.date_range.date_end.getHours() + ':' + $scope.date_range.date_end.getMinutes() + ':' + $scope.date_range.date_end.getSeconds();       
                            DashboardRepository.get_sales_by_dates( date_1, date_2 ).success( function( response ) {
                                if( !response.error ) {
                                    $scope.sales = response.data.sale_reports;
                                    $scope.orders_completed = response.data.total_orders[0].completed_orders;
                                    $scope.location_reports = response.data.location_reports;
                                    $scope.guests = response.data.total_guests[0].total_guests;
                                    $scope.discounts = response.data.total_discounts[0].total_discounts;

                                    $scope.total_sales = $scope.sales.map( s => s.total ).reduce( ( a, b ) => ( a + b ), 0 );
                                    $scope.promedy_sales = $scope.total_sales / $scope.sales.length;
                                    $scope.ticket_average = $scope.total_sales / $scope.guests;
                                    $scope.locations_data = [];
                                    $scope.location_reports.forEach( lr => $scope.locations_data.push( [ lr.location_name, lr.total ] ) );
                                    $scope.sales_complete_dates = [];
                                    
                                    let date_start = angular.copy($scope.date_range.date_start),
                                        date_end = angular.copy( $scope.date_range.date_end );
                                    
                                    while( date_start <= date_end ) {
                                        let temp_date_str = date_start.getFullYear() + '-' + ( date_start.getMonth() + 1) + '-' + date_start.getDate(),
                                            temp_obj = $scope.sales.find( s => {
                                                let inter_d = new Date( s.move_date )
                                                inter_d.setDate( inter_d.getDate() + 1 )
                                                if ( DateToString( inter_d ) == DateToString( new Date( temp_date_str ) ) ) {
                                                    return s;
                                                }
                                            });
                                        if( temp_obj ) {
                                            $scope.sales_complete_dates.push( temp_obj );
                                        } else {
                                            $scope.sales_complete_dates.push( { "total" : 0, "move_date" : temp_date_str } );
                                        }
                                        date_start.setDate( date_start.getDate() + 1 );
                                    }
                                    
                                    let total_sales = Array.of( 'Total sales' ),
                                        move_dates = Array.of( 'x' );
                                    
                                    $scope.sales_complete_dates.forEach( s => {
                                        move_dates.push( s.move_date );
                                        total_sales.push( s.total );
                                    })
                                    
                                    chart_c3_sales.destroy();
                                    chart_c3_sales = c3.generate({
                                        bindto: '#c3_sales',
                                        data: {
                                            x: 'x',
                                            columns: [
                                                move_dates,
                                                total_sales    
                                            ],
                                            types: {
                                                'Total sales': 'area'
                                            }
                                        },
                                        zoom: {
                                            enabled: true
                                        },
                                        axis: {
                                            x: {
                                                type: 'timeseries',
                                                tick: {
                                                    culling: false,
                                                    fit: true,
                                                    format: function (x) { return ( x.getMonth() + 1 ) + '-' + x.getDate() } // format string is also available for timeseries data
                                                }
                                            },
                                            y : {
                                                tick: {
                                                    format: d3.format("$,")
                                                }
                                            }
                                        },
                                        point: {
                                            r: '4',
                                            focus: {
                                                expand: {
                                                    r: '5'
                                                }
                                            }
                                        },
                                        bar: {
                                            width: {
                                                ratio: 0.4 // this makes bar width 50% of length between ticks
                                            }
                                        },
                                        grid: {
                                            x: {
                                                show: true
                                            },
                                            y: {
                                                show: true
                                            }
                                        },
                                        color: {
                                            pattern: ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf']
                                        }
                                    });
                                    
                                    chart_c3_orders.destroy();
                                    chart_c3_orders = c3.generate({
                                        bindto: '#c3_orders',
                                        data: {
                                            columns: $scope.locations_data,
                                            type : 'pie'
                                        },
                                        pie: {
                                            onclick: function (d, i) { console.log(d, i); },
                                            onmouseover: function (d, i) { console.log(d, i); },
                                            onmouseout: function (d, i) { console.log(d, i); }
                                        }
                                    });
                                    
                                    $(window).on("debouncedresize", function() {
                                        chart_c3_orders.resize();
                                    });
                                } else {
                                    $scope.errors = response.message;
                                }$scope.progress_ban = false;
                            }).error( function( error ) {
                                $scope.errors = error;
                                $scope.progress_ban = false;
                            });
                            // get void data by default dates
                            $scope.get_void_data();
                        };
                        $scope.get_void_data = function() {
                            let date_1  = ( $scope.date_range.date_start.getMonth() + 1) + '/' + $scope.date_range.date_start.getDate() + '/' + $scope.date_range.date_start.getFullYear() + ' ' + $scope.date_range.date_start.getHours() + ':' + $scope.date_range.date_start.getMinutes() + ':' + $scope.date_range.date_start.getSeconds(),
                                date_2  = ( $scope.date_range.date_end.getMonth() + 1) + '/' + $scope.date_range.date_end.getDate() + '/' + $scope.date_range.date_end.getFullYear() + ' ' + $scope.date_range.date_end.getHours() + ':' + $scope.date_range.date_end.getMinutes() + ':' + $scope.date_range.date_end.getSeconds();       
                            DashboardRepository.get_void_data_by_dates( date_1, date_2 ).success( function( response ) {
                                if( !response.error ) {
                                    $scope.voids_qty = response.data.void_reports[0].qty;
                                    $scope.voids_total = response.data.void_reports[0].total;
                                } else {
                                    $scope.errors = response.message;
                                }
                            }).error( function( error ) {
                                $scope.errors = error;
                            })
                        }
                        $scope.get_location_last_closes = function() {
                            LocationRepository.lastCloses().success( function( response ) {
                                if( !response.error ) {
                                    $scope.last_closes = response.data;
                                } else {
                                    console.log( response.message )                            
                                    $scope.errors = response.message;
                                }
                            }).error( function( error ) {
                                console.log( error )
                                $scope.errors = error;
                            });
                        }
                        // Get location last closes
                        $scope.get_location_last_closes();
                        // Get month reports so far by default
                        $scope.get_reports();
                        // Convert date to a string separated by - - - 
                        function DateToString( d ) {
                            return d.getFullYear() + '-' + ( d.getMonth() + 1) + '-' + d.getDate()
                        }
                    });
                }
            });
        }
    ])
    .controller('formExtendedCtrl', [
        '$scope',
        'files',
        'randomElementsList',
        'countriesList',
        '$timeout',
        function ($scope, files, randomElementsList, countriesList, $timeout) {

            $scope.randomElementsList = randomElementsList;
            $scope.countriesList = countriesList;

            $scope.$on('$stateChangeSuccess', function () {
                $scope.date_range = {
                    today: moment().format('MMMM D, YYYY'),
                    last_month: moment().subtract('M', 1).format('MMMM D, YYYY')
                };
                $timeout(function () {
                    // init form.extended_elements functions
                    yukon_extended_elements.init();
                })
            })
        }
    ])
    .controller('formValidationCtrl', [
        '$scope',
        'files',
        function ($scope, files) {
            $scope.$on('$stateChangeSuccess', function () {
                // init form.validation functions
                yukon_form_validation.init();
            })
        }
    ])
    .controller('formWizardCtrl', [
        '$scope',
        '$timeout',
        function ($scope, $timeout) {
            $scope.$on('$stateChangeSuccess', function () {
                // prism highlight
                Prism.highlightAll();
                // init form.extended_elements functions
                $timeout(function () { yukon_wizard.init(); }, 0);
            })
        }
    ])
    .controller('chatCtrl', [
        '$scope',
        'files',
        function ($scope, files) {
            $scope.$on('$stateChangeSuccess', function () {
                // init chat functions
                yukon_chat.send_msg();
            })
        }
    ])
    .controller('userListCtrl', [
        '$scope',
        'userLists',
        'files',
        '$window',
        function ($scope, userLists, files, $window) {
            $scope.userList = userLists;
            $scope.userListItems = $scope.userList.length;
            $scope.$on('onRepeatLast', function (scope, element, attrs) {
                $('#user_list').listnav({
                    filterSelector: '.ul_lastName',
                    includeNums: false,
                    removeDisabled: true,
                    showCounts: false,
                    onClick: function (letter) {
                        $scope.userListItems = $window.document.getElementsByClassName("listNavShow").length;
                        $scope.$apply();
                    }
                });
            });
        }
    ])
    .controller('userProfileCtrl', [
        '$scope',
        'files',
        function ($scope, files) {
            // run scripts after state change
            $scope.$on('$stateChangeSuccess', function () {
                yukon_user_profile.init();
            })
        }
    ])
    .controller('userProfile2Ctrl', [
        '$scope',
        function ($scope) {
            // run scripts after state change
            $scope.$on('$stateChangeSuccess', function () {
                yukon_user_profile.init();
            })
        }
    ])
    .controller('contactListCtrl', [
        '$scope',
        'contactList',
        'files',
        '$timeout',
        function ($scope, contactList, files, $timeout) {

            $scope.contactList = contactList;

            $scope.$on('onRepeatLast', function (scope, element, attrs) {
                var $grid = $('.contact_list');

                $grid.shuffle({
                    itemSelector: '.contact_item'
                });

                $('#contactList_sort').prop('selectedIndex', 0).on('change', function () {
                    var sort = this.value,
                        opts = {};

                    if (sort === 'company') {
                        opts = {
                            by: function ($el) {
                                return $el.data('company');
                            }
                        };
                    } else if (sort === 'company_desc') {
                        opts = {
                            reverse: true,
                            by: function ($el) {
                                return $el.data('company').toLowerCase();
                            }
                        };
                    } else if (sort === 'name') {
                        opts = {
                            by: function ($el) {
                                return $el.data('name').toLowerCase();
                            }
                        };
                    } else if (sort === 'name_desc') {
                        opts = {
                            reverse: true,
                            by: function ($el) {
                                return $el.data('name').toLowerCase();
                            }
                        };
                    }

                    // Sort elements
                    $grid.shuffle('sort', opts);
                });

                $('#contactList_filter').prop('selectedIndex', 0).on('change', function () {
                    var group = this.value;

                    // Filter elements
                    $grid.shuffle('shuffle', group);
                    $('#contactList_sort').prop('selectedIndex', 0);
                    $('#contactList_search').val('');
                });

                $('#contactList_search').val('').on('keyup', function () {
                    var uName = this.value;
                    if (uName.length > 1) {
                        $('#contactList_filter, #contactList_sort').prop('selectedIndex', 0);
                        // Filter elements
                        $grid.shuffle('shuffle', function ($el, shuffle) {
                            return $el.data('name').toLowerCase().indexOf(uName.toLowerCase()) >= 0;
                        });
                    } else {
                        $grid.shuffle('shuffle', $('#contactList_filter').val());
                    }
                });

            })

        }
    ])
    .controller('helpFaqCtrl', [
        '$scope',
        '$http',
        '$state',
        function ($scope, $http, $state) {
            // get data from json
            $http.get('data/faq_help.json')
                .success(function (data, status, headers, config) {
                    $scope.faq = data;
                    // get curent category id
                    $scope.$state = $state;
                    $scope.stateActive = $state.current.name;
                    angular.forEach($scope.faq, function (value, key) {
                        if (value.link == $scope.stateActive) {
                            $scope.catId = value.id;
                        }
                    });
                }).
                error(function (data, status, headers, config) {
                    console.log(status);
                });

            // get category id
            $scope.categoryId = function (id) {
                $scope.catId = id;
            }
        }
    ])
    .controller('invoicesCtrl', [
        '$scope',
        'files',
        function ($scope, files) {
            // generate qrcode
            $scope.$watch('qr_base_size', function () {
                $('#invoice_qrcode').css({ 'width': $scope.qr_base_size / 2, 'height': $scope.qr_base_size / 2 }).qrcode({
                    render: 'canvas',
                    size: $scope.qr_base_size,
                    text: $scope.qr_text
                }).children('img').prop('title', $scope.qr_text);
            });
        }
    ])
    .controller('mailboxCtrl', [
        '$scope',
        '$http',
        '$state',
        '$stateParams',
        'files',
        'utils',
        function ($scope, $http, $state, $stateParams, files, utils) {

            // get data from json
            $http.get('data/mailbox.json')
                .success(function (data, status, headers, config) {
                    $scope.folders = data;

                    $scope.messageItem = [];
                    // get curent folder id
                    $scope.$state = $state;
                    $scope.stateActive = $state.current.name;
                    angular.forEach($scope.folders, function (value, key) {
                        if (value.link == $scope.stateActive) {
                            $scope.foldId = value.folderId;
                        }
                        if (value.showCount) {
                            $scope.countMessages = function (id) {
                                return $scope.folders[id]['messages'].length;
                            }
                        }
                    });
                }).
                error(function (data, status, headers, config) {
                    //console.log(status);
                });

            $scope.selectAll = [];
            $scope.checkAll = function (id) {
                if ($scope.selectAll[id]) {
                    $scope.selectAll[id] = false;
                } else {
                    $scope.selectAll[id] = true;
                }
                angular.forEach($scope.folders[id]['messages'], function (message) {
                    message.selected = $scope.selectAll[id];
                });
            };

            $scope.$on('onRepeatLast', function (scope, element, attrs) {
                $('#mailbox_table').footable({
                    toggleSelector: " > tbody > tr > td > span.footable-toggle"
                });
            });

            // get folder id
            $scope.folderId = function (id) {
                $scope.foldId = id;
            }

        }
    ])
    .controller('mailDetailsCtrl', [
        '$scope',
        '$state',
        '$stateParams',
        'messageDetails',
        'utils',
        function ($scope, $state, $stateParams, messageDetails, utils) {
            $scope.messages = messageDetails;
            $scope.messageDetails = utils.findById($scope.messages, $stateParams.messageId);
        }
    ])
    .controller('galleryCtrl', [
        '$scope',
        'images',
        'files',
        function ($scope, images, files) {
            $scope.gallery = images;

            $scope.$on('onRepeatLast', function (scope, element, attrs) {
                $('.gallery_grid .img_wrapper').magnificPopup({
                    type: 'image',
                    gallery: {
                        enabled: true,
                        arrowMarkup: '<i title="%title%" class="el-icon-chevron-%dir% mfp-nav"></i>'
                    },
                    image: {
                        titleSrc: function (item) {
                            return item.el.attr('title') + '<small>' + item.el.children(".gallery_image_tags").text() + '</small>';
                        }
                    },
                    removalDelay: 500, //delay removal by X to allow out-animation
                    callbacks: {
                        beforeOpen: function () {
                            $('html').addClass('magnific-popup-open');
                            // just a hack that adds mfp-anim class to markup
                            this.st.image.markup = this.st.image.markup.replace('mfp-figure', 'mfp-figure mfp-with-anim');
                            this.st.mainClass = 'mfp-zoom-in';
                        },
                        close: function () {
                            $('html').removeClass('magnific-popup-open');
                        }
                    },
                    retina: {
                        ratio: 2
                    },
                    closeOnContentClick: true,
                    midClick: true // allow opening popup on middle mouse click. Always set it to true if you don't provide alternative source.
                });
            });

        }
    ])
    .controller('notificationsPopupsCtrl', [
        '$scope',
        '$modal',
        'growl',
        function ($scope, $modal, growl) {

            // bootstrap modals
            $scope.modalOpen = function (size) {
                var modalInstance = $modal.open({
                    templateUrl: 'views/partials/bootstrapModal.html',
                    size: size,
                    controller: function ($scope, $modalInstance) {

                        $scope.modalTitle = 'Modal Title';
                        $scope.modalContent = '<p>Lorem ipsum dolor sit amet, consectetur adipisicing elit.</p><p>Architecto autem, eligendi enim est et illum ipsam laboriosam magni minima molestiae perferendis placeat quae unde&hellip;</p>';

                        $scope.ok = function () {
                            $modalInstance.close();
                        };
                        $scope.cancel = function () {
                            $modalInstance.dismiss('cancel');
                        };

                    }
                });
            };

            // growl
            $scope.basicUsage = function (type) {
                var config = {};
                switch (type) {
                    case "success":
                        growl.success("<b>I'm</b> a success message", config);
                        break;
                    case "info":
                        growl.info("I'm an info message", config);
                        break;
                    case "warning":
                        growl.warning("I'm the warning message", config);
                        break;
                    default:
                        growl.error("Ups, error message here!", config);
                }
            }

            // get comment id
            $scope.getCommentId = function (id) {
                $scope.commentId = id;
            };

            // jBox
            $scope.$on('$stateChangeSuccess', function () {
                new jBox('Modal', {
                    width: 340,
                    height: 180,
                    attach: $('#jbox_modal_drag'),
                    draggable: 'title',
                    closeButton: 'title',
                    title: 'Click here to drag me around',
                    content: 'You can move this modal window'
                });

                new jBox('Confirm', {
                    closeButton: false,
                    confirmButton: 'Yes',
                    cancelButton: 'No',
                    _onOpen: function () {
                        // Set the new action for the submit button
                        this.submitButton
                            .off('click.jBox-Confirm' + this.id)
                            .on('click.jBox-Confirm' + this.id, function () {
                                new jBox('Notice', {
                                    offset: {
                                        y: 36
                                    },
                                    content: 'Comment deleted: id=' + $scope.commentId
                                });
                                this.close();
                            }.bind(this));
                    }
                });

                $scope.jBoxNotice_def = function () {
                    new jBox('Notice', {
                        offset: {
                            y: 36
                        },
                        stack: false,
                        autoClose: 30000,
                        animation: {
                            open: 'slide:top',
                            close: 'slide:right'
                        },
                        onInit: function () {
                            this.options.content = 'Default notification';
                        }
                    })
                };

                $scope.jBoxNotice_audio = function () {
                    new jBox('Notice', {
                        attributes: {
                            x: 'right',
                            y: 'bottom'
                        },
                        theme: 'NoticeBorder',
                        color: 'green',
                        audio: 'assets/lib/jBox-0.3.0/Source/audio/bling2',
                        volume: '100',
                        stack: false,
                        autoClose: 3000,
                        animation: {
                            open: 'slide:bottom',
                            close: 'slide:left'
                        },
                        onInit: function () {
                            this.options.title = 'Title';
                            this.options.content = 'Notification with audio effect';
                        }
                    })
                };

                $scope.jBoxNotice_audio_50 = function () {
                    new jBox('Notice', {
                        attributes: {
                            x: 'right',
                            y: 'top'
                        },
                        offset: {
                            y: 36
                        },
                        theme: 'NoticeBorder',
                        color: 'blue',
                        audio: 'assets/lib/jBox-0.3.0/Source/audio/beep2',
                        volume: '60',
                        stack: false,
                        autoClose: 3000,
                        animation: {
                            open: 'slide:top',
                            close: 'slide:right'
                        },
                        onInit: function () {
                            this.options.title = 'Title';
                            this.options.content = 'Volume set to 60%';
                        }
                    })
                };

            });
        }
    ])
    .controller('bootstrapUICtrl', [
        '$scope',
        '$modal',
        function ($scope, $modal) {
            // accordions
            $scope.oneAtATime = true;

            $scope.groups = [
                {
                    title: 'Dynamic Group Header - 1',
                    content: 'Dynamic Group Body - 1'
                },
                {
                    title: 'Dynamic Group Header - 2',
                    content: 'Dynamic Group Body - 2'
                }
            ];

            $scope.items = ['Item 1', 'Item 2', 'Item 3'];

            $scope.addItem = function () {
                var newItemNo = $scope.items.length + 1;
                $scope.items.push('Item ' + newItemNo);
            };

            $scope.status = {
                isFirstOpen: true,
                isFirstDisabled: false
            };

            // alerts
            $scope.alerts = [
                { type: 'danger', msg: '<strong>Oh snap!</strong> Change a few <a class="alert-link">things</a> up and try submitting again.' },
                { type: 'success', msg: 'Well done! You successfully read this important alert message.' }
            ];

            $scope.addAlert = function () {
                var alertType = ['warning', 'success', 'info', 'danger'];
                $scope.alerts.push({ type: alertType[Math.floor(Math.random() * alertType.length)], msg: 'Another alert!' });
            };

            $scope.closeAlert = function (index) {
                $scope.alerts.splice(index, 1);
            };

            // dropdowns
            $scope.toggled = function (open) {
                console.log('Dropdown is now: ', open);
            };
            $scope.toggleDropdown = function ($event) {
                $event.preventDefault();
                $event.stopPropagation();
                $scope.status.isopen = !$scope.status.isopen;
            };

            // bootstrap modals
            $scope.modalOpen = function (size) {
                var modalInstance = $modal.open({
                    templateUrl: 'views/partials/bootstrapModal.html',
                    size: size,
                    controller: function ($scope, $modalInstance) {

                        $scope.modalTitle = 'Modal Title';
                        $scope.modalContent = '<p>Lorem ipsum dolor sit amet, consectetur adipisicing elit.</p><p>Architecto autem, eligendi enim est et illum ipsam laboriosam magni minima molestiae perferendis placeat quae unde&hellip;</p>';

                        $scope.ok = function () {
                            $modalInstance.close();
                        };
                        $scope.cancel = function () {
                            $modalInstance.dismiss('cancel');
                        };

                    }
                });
            };

            // pagination
            $scope.totalItems = 64;
            $scope.currentPage = 4;

            $scope.setPage = function (pageNo) {
                $scope.currentPage = pageNo;
            };

            $scope.pageChanged = function () {
                console.log('Page changed to: ' + $scope.currentPage);
            };

            $scope.maxSize = 5;
            $scope.bigTotalItems = 175;
            $scope.bigCurrentPage = 1;

            // tooltip
            $scope.dynamicTooltip = 'Hello, World!';
            $scope.dynamicTooltipText = 'dynamic';
            $scope.htmlTooltip = 'I\'ve been made <b>bold</b>!';

            // tabs
            $scope.tabs = [
                { title: 'Dynamic Title 1', content: 'Dynamic content 1' },
                { title: 'Dynamic Title 2', content: 'Dynamic content 2', disabled: true }
            ];
            $scope.alertMe = function () {
                alert('You\'ve selected the alert tab!');
            };

        }
    ])
    .controller('aceEditorCtrl', [
        '$scope',
        function ($scope) {

            $scope.aceThemes = [
                { theme: "chrome", name: "Chrome", group: "Bright" },
                { theme: "clouds", name: "Clouds", group: "Bright", group: "Bright" },
                { theme: "crimson_editor", name: "Crimson Editor", group: "Bright" },
                { theme: "dawn", name: "Dawn", group: "Bright" },
                { theme: "dreamweaver", name: "Dreamweaver", group: "Bright" },
                { theme: "eclipse", name: "Eclipse", group: "Bright" },
                { theme: "github", name: "GitHub", group: "Bright" },
                { theme: "solarized_light", name: "Solarized Light", group: "Bright" },
                { theme: "textmate", name: "TextMate", group: "Bright" },
                { theme: "tomorrow", name: "Tomorrow", group: "Bright" },
                { theme: "xcode", name: "XCode", group: "Bright" },
                { theme: "kuroir", name: "Kuroir", group: "Bright" },
                { theme: "katzenmilch", name: "KatzenMilch", group: "Bright" },
                { theme: "ambiance", name: "Ambiance", group: "Dark" },
                { theme: "chaos", name: "Chaos", group: "Dark" },
                { theme: "clouds_midnight", name: "Clouds Midnight", group: "Dark" },
                { theme: "cobalt", name: "Cobalt", group: "Dark" },
                { theme: "idle_fingers", name: "idle Fingers", group: "Dark" },
                { theme: "kr_theme", name: "krTheme", group: "Dark" },
                { theme: "merbivore", name: "Merbivore", group: "Dark" },
                { theme: "merbivore_soft", name: "Merbivore Soft", group: "Dark" },
                { theme: "mono_industrial", name: "Mono Industrial", group: "Dark" },
                { theme: "monokai", name: "Monokai", group: "Dark" },
                { theme: "pastel_on_dark", name: "Pastel on dark", group: "Dark" },
                { theme: "solarized_dark", name: "Solarized Dark", group: "Dark" },
                { theme: "terminal", name: "Terminal", group: "Dark" },
                { theme: "tomorrow_night", name: "Tomorrow Night", group: "Dark" },
                { theme: "tomorrow_night_blue", name: "Tomorrow Night Blue", group: "Dark" },
                { theme: "tomorrow_night_bright", name: "Tomorrow Night Bright", group: "Dark" },
                { theme: "tomorrow_night_eighties", name: "Tomorrow Night 80s", group: "Dark" },
                { theme: "twilight", name: "Twilight", group: "Dark" },
                { theme: "vibrant_ink", name: "Vibrant Ink", group: "Dark" }
            ];

            $scope.aceFontSize = [
                { fSize: "11", name: "11px" },
                { fSize: "12", name: "12px" },
                { fSize: "13", name: "13px" },
                { fSize: "14", name: "14px" },
                { fSize: "15", name: "15px" },
                { fSize: "16", name: "16px" }
            ];


            var editor = ace.edit("aceEditor");
            $('#aceEditor').data('editor', editor);
            editor.setTheme("ace/theme/monokai");
            document.getElementById('aceEditor').style.fontSize = '14px';
            editor.getSession().setMode("ace/mode/javascript");
            editor.setShowPrintMargin(false);
            editor.setOptions({ maxLines: 32 });
            editor.setAutoScrollEditorIntoView(true);

            // change theme
            $scope.changeTheme = function (theme) {
                $('#aceEditor').data('editor').setTheme("ace/theme/" + theme);
            };

            // change font size
            $scope.changeFontSize = function (fSize) {
                document.getElementById('aceEditor').style.fontSize = fSize + 'px';
            };

        }
    ])
    .controller('calendarBasicCtrl', [
        '$scope',
        function ($scope) {
            var date = new Date();
            var d = date.getDate();
            var m = date.getMonth();
            var y = date.getFullYear();

            $('#calendar').fullCalendar({
                header: {
                    center: 'title',
                    left: 'month,agendaWeek,agendaDay today',
                    right: 'prev,next'
                },
                buttonIcons: {
                    prev: ' el-icon-chevron-left',
                    next: ' el-icon-chevron-right'
                },
                editable: true,
                aspectRatio: 2.2,
                events: [
                    {
                        title: 'All Day Event',
                        start: new Date(y, m, 1)
                    },
                    {
                        title: 'Long Event',
                        start: new Date(y, m, d - 5),
                        end: new Date(y, m, d - 2)
                    },
                    {
                        id: 999,
                        title: 'Repeating Event',
                        start: new Date(y, m, d - 3, 16, 0)
                    },
                    {
                        id: 999,
                        title: 'Repeating Event',
                        start: new Date(y, m, d + 4, 16, 0)
                    },
                    {
                        title: 'Meeting',
                        start: new Date(y, m, d + 1, 19, 0),
                        end: new Date(y, m, d + 1, 22, 30)
                    },
                    {
                        title: 'Lunch',
                        start: new Date(y, m, d - 7)
                    },
                    {
                        title: 'Birthday Party',
                        start: new Date(y, m, d + 10)
                    },
                    {
                        title: 'Click for Google',
                        url: 'http://google.com/',
                        start: new Date(y, m, d + 12)
                    }
                ],
                eventAfterAllRender: function () {
                    $('.fc-header .fc-button-prev').html('<span class="el-icon-chevron-left"></span>');
                    $('.fc-header .fc-button-next').html('<span class="el-icon-chevron-right"></span>');
                }
            });

        }
    ])
    .controller('calendarLunarCtrl', [
        '$scope',
        function ($scope) {

            $('#calendar_phases').fullCalendar({
                header: {
                    center: 'title',
                    left: 'month,agendaWeek,agendaDay today',
                    right: 'prev,next'
                },
                buttonIcons: false,
                aspectRatio: 2.2,
                // Phases of the Moon
                events: 'https://www.google.com/calendar/feeds/ht3jlfaac5lfd6263ulfh4tql8%40group.calendar.google.com/public/basic',
                eventClick: function (event) {
                    // opens events in a popup window
                    window.open(event.url, 'gcalevent', 'width=700,height=600');
                    return false;
                },
                eventAfterAllRender: function () {
                    $('.fc-header .fc-button-prev').html('<span class="el-icon-chevron-left"></span>');
                    $('.fc-header .fc-button-next').html('<span class="el-icon-chevron-right"></span>');
                }
            });

        }
    ])
    .controller('chartsCtrl', [
        '$scope',
        function ($scope) {

            // cobined chart
            var c3_combined_chart = c3.generate({
                bindto: '#c3_combined',
                data: {
                    columns: [
                        ['data1', 30, 20, 50, 40, 60, 50],
                        ['data2', 200, 130, 90, 240, 130, 220],
                        ['data3', 200, 130, 90, 240, 130, 220],
                        ['data4', 130, 120, 150, 140, 160, 150],
                        ['data5', 90, 70, 20, 50, 60, 120],
                    ],
                    type: 'bar',
                    types: {
                        data3: 'line',
                        data5: 'area'
                    },
                    groups: [
                        ['data1', 'data2']
                    ]
                },
                point: {
                    r: '4',
                    focus: {
                        expand: {
                            r: '5'
                        }
                    }
                },
                bar: {
                    width: {
                        ratio: 0.4 // this makes bar width 50% of length between ticks
                    }
                },
                grid: {
                    x: {
                        show: true
                    },
                    y: {
                        show: true
                    }
                },
                color: {
                    pattern: ['#ff7f0e', '#2ca02c', '#9467bd', '#1f77b4', '#d62728']
                }
            });

            // gauge chart
            var chart_gauge = c3.generate({
                bindto: '#c3_gauge',
                data: {
                    columns: [
                        ['data', 91.4]
                    ],
                    type: 'gauge',
                    onclick: function (d, i) { /*console.log("onclick", d, i);*/ },
                    onmouseover: function (d, i) { /*console.log("onmouseover", d, i);*/ },
                    onmouseout: function (d, i) { /*console.log("onmouseout", d, i);*/ }
                },
                gauge: {
                    width: 39
                },
                color: {
                    pattern: ['#ff0000', '#f97600', '#f6c600', '#60b044'],
                    threshold: {
                        values: [30, 60, 90, 100]
                    }
                }
            });

            setTimeout(function () {
                chart_gauge.load({
                    columns: [['data', 10]]
                });
            }, 2000);
            setTimeout(function () {
                chart_gauge.load({
                    columns: [['data', 50]]
                });
            }, 3000);
            setTimeout(function () {
                chart_gauge.load({
                    columns: [['data', 70]]
                });
            }, 4000);
            setTimeout(function () {
                chart_gauge.load({
                    columns: [['data', 0]]
                });
            }, 5000);
            setTimeout(function () {
                chart_gauge.load({
                    columns: [['data', 100]]
                });
            }, 6000);

            // donut chart
            var chart_donut = c3.generate({
                bindto: '#c3_donut',
                data: {
                    columns: [
                        ['data1', 30],
                        ['data2', 120],
                    ],
                    type: 'donut',
                    onclick: function (d, i) { console.log("onclick", d, i); },
                    onmouseover: function (d, i) { console.log("onmouseover", d, i); },
                    onmouseout: function (d, i) { console.log("onmouseout", d, i); }
                },
                donut: {
                    title: "Iris Petal Width"
                }
            });
            setTimeout(function () {
                chart_donut.load({
                    columns: [
                        ["setosa", 0.2, 0.2, 0.2, 0.2, 0.2, 0.4, 0.3, 0.2, 0.2, 0.1, 0.2, 0.2, 0.1, 0.1, 0.2, 0.4, 0.4, 0.3, 0.3, 0.3, 0.2, 0.4, 0.2, 0.5, 0.2, 0.2, 0.4, 0.2, 0.2, 0.2, 0.2, 0.4, 0.1, 0.2, 0.2, 0.2, 0.2, 0.1, 0.2, 0.2, 0.3, 0.3, 0.2, 0.6, 0.4, 0.3, 0.2, 0.2, 0.2, 0.2],
                        ["versicolor", 1.4, 1.5, 1.5, 1.3, 1.5, 1.3, 1.6, 1.0, 1.3, 1.4, 1.0, 1.5, 1.0, 1.4, 1.3, 1.4, 1.5, 1.0, 1.5, 1.1, 1.8, 1.3, 1.5, 1.2, 1.3, 1.4, 1.4, 1.7, 1.5, 1.0, 1.1, 1.0, 1.2, 1.6, 1.5, 1.6, 1.5, 1.3, 1.3, 1.3, 1.2, 1.4, 1.2, 1.0, 1.3, 1.2, 1.3, 1.3, 1.1, 1.3],
                        ["virginica", 2.5, 1.9, 2.1, 1.8, 2.2, 2.1, 1.7, 1.8, 1.8, 2.5, 2.0, 1.9, 2.1, 2.0, 2.4, 2.3, 1.8, 2.2, 2.3, 1.5, 2.3, 2.0, 2.0, 1.8, 2.1, 1.8, 1.8, 1.8, 2.1, 1.6, 1.9, 2.0, 2.2, 1.5, 1.4, 2.3, 2.4, 1.8, 1.8, 2.1, 2.4, 2.3, 1.9, 2.3, 2.5, 2.3, 1.9, 2.0, 2.3, 1.8],
                    ]
                });
            }, 2500);
            setTimeout(function () {
                chart_donut.unload({
                    ids: 'data1'
                });
                chart_donut.unload({
                    ids: 'data2'
                });
            }, 4500);

            // grid lines
            var chart_grid_lines = c3.generate({
                bindto: '#c3_grid_lines',
                data: {
                    columns: [
                        ['sample', 30, 200, 100, 400, 150, 250],
                        ['sample2', 1300, 1200, 1100, 1400, 1500, 1250],
                    ],
                    axes: {
                        sample2: 'y2'
                    }
                },
                axis: {
                    y2: {
                        show: true
                    }
                },
                grid: {
                    y: {
                        lines: [{ value: 50, text: 'Label 50' }, { value: 1300, text: 'Label 1300', axis: 'y2' }]
                    }
                }
            });

            // scatter plot
            var chart_scatter = c3.generate({
                bindto: '#c3_scatter',
                data: {
                    xs: {
                        setosa: 'setosa_x',
                        versicolor: 'versicolor_x'
                    },
                    // iris data from R
                    columns: [
                        ["setosa_x", 3.5, 3.0, 3.2, 3.1, 3.6, 3.9, 3.4, 3.4, 2.9, 3.1, 3.7, 3.4, 3.0, 3.0, 4.0, 4.4, 3.9, 3.5, 3.8, 3.8, 3.4, 3.7, 3.6, 3.3, 3.4, 3.0, 3.4, 3.5, 3.4, 3.2, 3.1, 3.4, 4.1, 4.2, 3.1, 3.2, 3.5, 3.6, 3.0, 3.4, 3.5, 2.3, 3.2, 3.5, 3.8, 3.0, 3.8, 3.2, 3.7, 3.3],
                        ["versicolor_x", 3.2, 3.2, 3.1, 2.3, 2.8, 2.8, 3.3, 2.4, 2.9, 2.7, 2.0, 3.0, 2.2, 2.9, 2.9, 3.1, 3.0, 2.7, 2.2, 2.5, 3.2, 2.8, 2.5, 2.8, 2.9, 3.0, 2.8, 3.0, 2.9, 2.6, 2.4, 2.4, 2.7, 2.7, 3.0, 3.4, 3.1, 2.3, 3.0, 2.5, 2.6, 3.0, 2.6, 2.3, 2.7, 3.0, 2.9, 2.9, 2.5, 2.8],
                        ["setosa", 0.2, 0.2, 0.2, 0.2, 0.2, 0.4, 0.3, 0.2, 0.2, 0.1, 0.2, 0.2, 0.1, 0.1, 0.2, 0.4, 0.4, 0.3, 0.3, 0.3, 0.2, 0.4, 0.2, 0.5, 0.2, 0.2, 0.4, 0.2, 0.2, 0.2, 0.2, 0.4, 0.1, 0.2, 0.2, 0.2, 0.2, 0.1, 0.2, 0.2, 0.3, 0.3, 0.2, 0.6, 0.4, 0.3, 0.2, 0.2, 0.2, 0.2],
                        ["versicolor", 1.4, 1.5, 1.5, 1.3, 1.5, 1.3, 1.6, 1.0, 1.3, 1.4, 1.0, 1.5, 1.0, 1.4, 1.3, 1.4, 1.5, 1.0, 1.5, 1.1, 1.8, 1.3, 1.5, 1.2, 1.3, 1.4, 1.4, 1.7, 1.5, 1.0, 1.1, 1.0, 1.2, 1.6, 1.5, 1.6, 1.5, 1.3, 1.3, 1.3, 1.2, 1.4, 1.2, 1.0, 1.3, 1.2, 1.3, 1.3, 1.1, 1.3],
                    ],
                    type: 'scatter'
                },
                axis: {
                    x: {
                        label: 'Sepal.Width',
                        tick: {
                            fit: false
                        }
                    },
                    y: {
                        label: 'Petal.Width'
                    }
                }
            });

            setTimeout(function () {
                chart_scatter.load({
                    xs: {
                        virginica: 'virginica_x'
                    },
                    columns: [
                        ["virginica_x", 3.3, 2.7, 3.0, 2.9, 3.0, 3.0, 2.5, 2.9, 2.5, 3.6, 3.2, 2.7, 3.0, 2.5, 2.8, 3.2, 3.0, 3.8, 2.6, 2.2, 3.2, 2.8, 2.8, 2.7, 3.3, 3.2, 2.8, 3.0, 2.8, 3.0, 2.8, 3.8, 2.8, 2.8, 2.6, 3.0, 3.4, 3.1, 3.0, 3.1, 3.1, 3.1, 2.7, 3.2, 3.3, 3.0, 2.5, 3.0, 3.4, 3.0],
                        ["virginica", 2.5, 1.9, 2.1, 1.8, 2.2, 2.1, 1.7, 1.8, 1.8, 2.5, 2.0, 1.9, 2.1, 2.0, 2.4, 2.3, 1.8, 2.2, 2.3, 1.5, 2.3, 2.0, 2.0, 1.8, 2.1, 1.8, 1.8, 1.8, 2.1, 1.6, 1.9, 2.0, 2.2, 1.5, 1.4, 2.3, 2.4, 1.8, 1.8, 2.1, 2.4, 2.3, 1.9, 2.3, 2.5, 2.3, 1.9, 2.0, 2.3, 1.8],
                    ]
                });
            }, 1000);

            setTimeout(function () {
                chart_scatter.unload({
                    ids: 'setosa'
                });
            }, 2000);

            setTimeout(function () {
                chart_scatter.load({
                    columns: [
                        ["virginica", 0.2, 0.2, 0.2, 0.2, 0.2, 0.4, 0.3, 0.2, 0.2, 0.1, 0.2, 0.2, 0.1, 0.1, 0.2, 0.4, 0.4, 0.3, 0.3, 0.3, 0.2, 0.4, 0.2, 0.5, 0.2, 0.2, 0.4, 0.2, 0.2, 0.2, 0.2, 0.4, 0.1, 0.2, 0.2, 0.2, 0.2, 0.1, 0.2, 0.2, 0.3, 0.3, 0.2, 0.6, 0.4, 0.3, 0.2, 0.2, 0.2, 0.2],
                    ]
                });
            }, 3000);

            $(window).on("debouncedresize", function () {
                c3_combined_chart.resize();
                chart_gauge.resize();
                chart_donut.resize();
                chart_grid_lines.resize();
                chart_scatter.resize();
            });

        }
    ])
    .controller('ganttChartCtrl', [
        '$scope',
        function ($scope) {

            var ganttData = [
                {
                    id: 1,
                    name: "Concept",
                    color: '#006064',
                    series: [
                        {
                            name: "Brainstorm<span>1 Jan - 3 Jan</span>",
                            start: new Date('01/01/2015'),
                            end: new Date('01/03/2015'),
                            color: "#0097a7"
                        },
                        {
                            name: "Wireframes<span>4 Jan - 7 Jan</span>",
                            start: new Date('01/04/2015'),
                            end: new Date('01/07/2015'),
                            color: "#00bcd4"
                        },
                        {
                            name: "Concept description<span>6 Jan - 10 Jan</span>",
                            start: new Date('01/06/2015'),
                            end: new Date('01/10/2015'),
                            color: "#4dd0e1"
                        }
                    ]
                },
                {
                    id: 2,
                    name: "Design",
                    series: [
                        {
                            name: "Sketching<span>8 Jan - 16 Jan</span>",
                            start: new Date('01/08/2015'),
                            end: new Date('01/16/2015'),
                            color: "#f57c00"
                        },
                        {
                            name: "Photography<span>10 Jan - 16 Jan</span>",
                            start: new Date('01/10/2015'),
                            end: new Date('01/16/2015'),
                            color: "#fb8c00"
                        },
                        {
                            name: "Feedback<span>19 Jan - 21 Jan</span>",
                            start: new Date('01/19/2015'),
                            end: new Date('01/21/2015'),
                            color: "#ff9800"
                        },
                        {
                            name: "Final Design<span>21 Jan - 27 Jan</span>",
                            start: new Date('01/21/2015'),
                            end: new Date('01/27/2015'),
                            color: "#ffa726"
                        }
                    ]
                },
                {
                    id: 3,
                    name: "Implementation",
                    series: [
                        {
                            name: "Specifications<span>26 Jan - 2 Feb</span>",
                            start: new Date('01/26/2015'),
                            end: new Date('02/06/2015'),
                            color: "#689f38"
                        },
                        {
                            name: "Templates<span>4 Feb - 10 Feb</span>",
                            start: new Date('02/04/2015'),
                            end: new Date('02/10/2015'),
                            color: "#7cb342"
                        },
                        {
                            name: "Database<span>5 Feb - 13 Feb</span>",
                            start: new Date('02/05/2015'),
                            end: new Date('02/13/2015'),
                            color: "#8bc34a"
                        },
                        {
                            name: "Integration<span>16 Feb - 10 Mar</span>",
                            start: new Date('02/16/2015'),
                            end: new Date('03/10/2015'),
                            color: "#9ccc65"
                        }
                    ]
                },
                {
                    id: 4,
                    name: "Testing & Delivery",
                    series: [
                        {
                            name: "Focus Group<span>17 Mar - 27 Mar</span>",
                            start: new Date('03/17/2015'),
                            end: new Date('03/27/2015'),
                            color: "#1976d2"
                        },
                        {
                            name: "Stress Test<span>25 Mar - 6 Apr</span>",
                            start: new Date('03/25/2015'),
                            end: new Date('04/06/2015'),
                            color: "#2196f3"
                        },
                        {
                            name: "Delivery<span>7 Apr - 8 Apr</span>",
                            start: new Date('04/07/2015'),
                            end: new Date('04/08/2015'),
                            color: "#64b5f6"
                        }
                    ]
                }
            ];

            $("#ganttChart").ganttView({
                data: ganttData,
                behavior: {
                    onClick: function (data) {
                        var msg = "You clicked on an event: { start: " + data.start.toString("M/d/yyyy") + ", end: " + data.end.toString("M/d/yyyy") + " }";
                        console.log(msg);
                    },
                    onResize: function (data) {
                        var msg = "You resized an event: { start: " + data.start.toString("M/d/yyyy") + ", end: " + data.end.toString("M/d/yyyy") + " }";
                        console.log(msg);
                    },
                    onDrag: function (data) {
                        var msg = "You dragged an event: { start: " + data.start.toString("M/d/yyyy") + ", end: " + data.end.toString("M/d/yyyy") + " }";
                        console.log(msg);
                    }
                }
            });

        }
    ])
    .controller('gmapsCtrl', [
        '$scope',
        function ($scope) {

            // basic google maps
            new GMaps({
                div: '#gmap_basic',
                lat: -12.043333,
                lng: -77.028333
            });

            // with markers
            map_markers = new GMaps({
                el: '#gmap_markers',
                lat: 51.500902,
                lng: -0.124531
            });
            map_markers.addMarker({
                lat: 51.497714,
                lng: -0.12991,
                title: 'Westminster',
                details: {
                    // You can attach additional information, which will be passed to Event object (e) in the events previously defined.
                },
                click: function (e) {
                    alert('You clicked in this marker');
                },
                mouseover: function (e) {
                    if (console.log) console.log(e);
                }
            });
            map_markers.addMarker({
                lat: 51.500891,
                lng: -0.123347,
                title: 'Westminster Bridge',
                infoWindow: {
                    content: '<div class="infoWindow_content"><p>Westminster Bridge is a road and foot traffic bridge over the River Thames...</p><a href="http://en.wikipedia.org/wiki/Westminster_Bridge" target="_blank">wikipedia</a></div>'
                }
            });

            // static map
            if (window.devicePixelRatio >= 2) {
                var img_scale = '&scale=2'
                background_size = 'background-size: 640px 640px;';

            } else {
                var img_scale = '',
                    background_size = '';
            }
            url = GMaps.staticMapURL({
                size: [640, 640],
                lat: -37.824972,
                lng: 144.958735,
                zoom: 10
            });
            $('#gmap_static').append('<span class="gmap-static" style="height:100%;display:block;background: url(' + url + img_scale + ') no-repeat 50% 50%;' + background_size + '"><img src="' + url + '" style="visibility:hidden" alt="" /></span>');

            // geocoding
            map_geocode = new GMaps({
                el: '#gmap_geocoding',
                lat: 55.478853,
                lng: 15.117188,
                zoom: 3
            });
            $('#geocoding_form').submit(function (e) {
                e.preventDefault();
                GMaps.geocode({
                    address: $('#gmaps_address').val().trim(),
                    callback: function (results, status) {
                        if (status == 'OK') {
                            var latlng = results[0].geometry.location;
                            map_geocode.setCenter(latlng.lat(), latlng.lng());
                            map_geocode.addMarker({
                                lat: latlng.lat(),
                                lng: latlng.lng()
                            });
                            map_geocode.map.setZoom(15);
                            $('#gmaps_address').val('');
                        }
                    }
                });
            });

        }
    ])
    .controller('footablesCtrl', [
        '$scope',
        function ($scope) {
            $('#footable_demo').footable({
                toggleSelector: " > tbody > tr > td > span.footable-toggle"
            }).on({
                'footable_filtering': function (e) {
                    var selected = $scope.userStatus;
                    if (selected && selected.length > 0) {
                        e.filter += (e.filter && e.filter.length > 0) ? ' ' + selected : selected;
                        e.clear = !e.filter;
                    }
                }
            });

            $scope.clearFilters = function () {
                $('.filter-status').val('');
                $('#footable_demo').trigger('footable_clear_filter');
            }

            $scope.filterTable = function (userStatus) {
                $('#footable_demo').data('footable-filter').filter($('#textFilter').val());
            }

        }
    ])
    .controller('datatablesCtrl', [
        '$scope',
        '$timeout',
        function ($scope, $timeout) {

            var table = $('#datatable_demo').dataTable({
                "iDisplayLength": 25
            });

            $timeout(function () {
                oFH = new $.fn.dataTable.FixedHeader(table, {
                    "offsetTop": 48
                });
                oFH.fnUpdate();
            }, 2000);

            // please also add "updateFixedHeaders" directive (update fixedHeaders position on window resize) to parent element

        }
    ])
    .controller('vectorMapsCtrl', [
        '$scope',
        function ($scope) {

            // random colors
            var palette = ['#1f77b4', '#3a9add', '#888'];
            generateColors = function () {
                var colors = {},
                    key;
                for (key in map_ca.regions) {
                    colors[key] = palette[Math.floor(Math.random() * palette.length)];
                }
                return colors;
            };
            map_ca = new jvm.WorldMap({
                map: 'ca_mill_en',
                container: $('#vmap_canada'),
                backgroundColor: 'transparent',
                series: {
                    regions: [
                        {
                            attribute: 'fill'
                        }
                    ]
                }
            });
            map_ca.series.regions[0].setValues(generateColors());

            $scope.updateColors = function () {
                map_ca.series.regions[0].setValues(generateColors());
            };

            // markers on the map
            $('#vmap_markers').vectorMap({
                map: 'world_mill_en',
                backgroundColor: 'transparent',
                scaleColors: ['#c8eeff', '#0071a4'],
                normalizeFunction: 'polynomial',
                hoverColor: false,
                regionStyle: {
                    initial: {
                        fill: '#888'
                    },
                    hover: {
                        "fill-opacity": 1
                    }
                },
                markerStyle: {
                    initial: {
                        fill: '#fff',
                        stroke: '#1f77b4'
                    },
                    hover: {
                        fill: '#13476c',
                        stroke: '#13476c'
                    }
                },
                markers: [
                    { latLng: [41.90, 12.45], name: 'Vatican City' },
                    { latLng: [43.73, 7.41], name: 'Monaco' },
                    { latLng: [-0.52, 166.93], name: 'Nauru' },
                    { latLng: [-8.51, 179.21], name: 'Tuvalu' },
                    { latLng: [43.93, 12.46], name: 'San Marino' },
                    { latLng: [47.14, 9.52], name: 'Liechtenstein' },
                    { latLng: [7.11, 171.06], name: 'Marshall Islands' },
                    { latLng: [17.3, -62.73], name: 'Saint Kitts and Nevis' },
                    { latLng: [3.2, 73.22], name: 'Maldives' },
                    { latLng: [35.88, 14.5], name: 'Malta' },
                    { latLng: [12.05, -61.75], name: 'Grenada' },
                    { latLng: [13.16, -61.23], name: 'Saint Vincent and the Grenadines' },
                    { latLng: [13.16, -59.55], name: 'Barbados' },
                    { latLng: [17.11, -61.85], name: 'Antigua and Barbuda' },
                    { latLng: [-4.61, 55.45], name: 'Seychelles' },
                    { latLng: [7.35, 134.46], name: 'Palau' },
                    { latLng: [42.5, 1.51], name: 'Andorra' },
                    { latLng: [14.01, -60.98], name: 'Saint Lucia' },
                    { latLng: [6.91, 158.18], name: 'Federated States of Micronesia' },
                    { latLng: [1.3, 103.8], name: 'Singapore' },
                    { latLng: [1.46, 173.03], name: 'Kiribati' },
                    { latLng: [-21.13, -175.2], name: 'Tonga' },
                    { latLng: [15.3, -61.38], name: 'Dominica' },
                    { latLng: [-20.2, 57.5], name: 'Mauritius' },
                    { latLng: [26.02, 50.55], name: 'Bahrain' },
                    { latLng: [0.33, 6.73], name: 'São Tomé and Príncipe' }
                ]
            });

        }
    ])
    .controller('topSearchCtrl', [
        '$scope',
        function ($scope) {
            $scope.selected = undefined;
            $scope.states = ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Dakota', 'North Carolina', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'];
        }
    ])
    ;




