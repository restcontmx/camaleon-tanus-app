var app = angular.module( 'CAMALEON-REPORTS', [     'ngRoute',
                                                    'ngCookies',
                                                    'ngMaterial',
                                                    'dataGrid',
                                                    'pagination',
                                                    'warrior-filters',
                                                    'ui.router',
                                                    'ui.bootstrap',
                                                    'crud-service',
                                                    'chart.js'  ] )
    .run( [ '$rootScope', '$location', 'AuthRepository', function( $rootScope, $location, AuthRepository ) {
        $rootScope.isLoggedIn = {
            show_app : true,
            show_auth : false
        };
        if( !AuthRepository.isSessionSet() ) {
            $rootScope.isLoggedIn.show_app = false;
            $rootScope.isLoggedIn.show_auth = true;
            $location.path( '/' );
        } else {
            $rootScope.isLoggedIn.show_app = true;
            $rootScope.isLoggedIn.show_auth = false;
        }
    }])
    .config([ '$routeProvider', '$locationProvider', '$mdThemingProvider', function( $routeProvider, $locationProvider, $mdThemingProvider ) {
        $routeProvider
            .when( '/', {
                templateUrl : '../views/main.html'
            })
            .when( '/main', {
                templateUrl : '../views/main.html'
            })
            .when( '/dashboard', {
                templateUrl : '../views/user/dashboard.html'
            })
            .when( '/business', {
                templateUrl : '../views/bussines/list.html'
            })
            .when( '/business/new', {
                templateUrl : '../views/bussines/new.html'
            })
            .when( '/business/location', {
                templateUrl : '../views/bussines/location.html'
            })
            .when( '/business/:id', {
                templateUrl : '../views/bussines/detail.html'
            })
            .when( '/business/edit/:id', {
                templateUrl : '../views/bussines/edit.html'
            })
            // reports
            .when( '/reports/classes', {
                templateUrl : '../views/reports/classes.html'
            })
            .when( '/reports/categories', {
                templateUrl : '../views/reports/categories.html'
            })
            .when( '/reports/departments', {
                templateUrl : '../views/reports/departments.html'
            })
            .when( '/reports/employee', {
                templateUrl : '../views/reports/employee.html'
            })
            .when( '/reports/items', {
                templateUrl : '../views/reports/items.html'
            })
            .when( '/reports/turn', {
                templateUrl : '../views/reports/turn.html'
            })
            // Locations
            .when( '/location', {
                templateUrl : '../views/location/list.html'
            })
            // Support
            .when( '/support/items/', {
                templateUrl : '../views/support/item.html'
            })
            .when( '/support/classes/', {
                templateUrl : '../views/support/itemclass.html'
            })
            .when( '/support/families/', {
                templateUrl : '../views/support/family.html'
            })
            .when( '/support/subfamilies/', {
                templateUrl : '../views/support/subfamily.html'
            })
            .when( '/support/departments/', {
                templateUrl : '../views/support/department.html'
            })
            .when( '/support/categories/', {
                templateUrl : '../views/support/category.html'
            })
            // Settings
            .when( '/settings/levels/', {
                templateUrl : '../views/settings/security_levels.html'
            })
            .when( '/settings/users/', {
                templateUrl : '../views/settings/users.html'
            })
            // reports
            .when( '/404', {
                templateUrl : '../404.html'
            })
            .otherwise({
                redirectTo : '/404'
            });
        (function (ChartJsProvider) {
            ChartJsProvider.setOptions({ colors : [ '#803690', '#00ADF9', '#DCDCDC', '#46BFBD', '#FDB45C', '#949FB1', '#4D5360'] });
        });

        $mdThemingProvider.theme('default').primaryPalette('teal')

    }])
    .controller( 'navbar-controller', [ '$scope', '$rootScope', 'AuthRepository', function( $scope, $rootScope, AuthRepository ) {
        $scope.project_name = "CAMALEON-REPORTS";
        $rootScope.user_info = AuthRepository.getSession();
        $scope.logout = function() {
            AuthRepository.logout().success( function( data ) {
                AuthRepository.viewVerification();
                AuthRepository.setMenu();
            }).error( function( error ) {
                $scope.errors = error;
            });
        };
    }])
    .controller( 'menu-cotroller', [ '$scope', '$rootScope', 'AuthRepository', '$mdSidenav', function( $scope, $rootScope, AuthRepository, $mdSidenav ) {
        AuthRepository.setMenu();
        $scope.set_menu_state = function( element ) {
            AuthRepository.setActiveMenu( element );
        };
    }])
    .controller( 'main-controller', [   '$scope',
                                        'LocationRepository',
                                        'AuthRepository',
                                        function(   $scope,
                                                    LocationRepository,
                                                    AuthRepository  ) {
        if( AuthRepository.viewVerification() ) {

            $scope.title = "Home";

            var promise = LocationRepository.getLocationTodayReports();

            $scope.labels = [];
            $scope.data = [];

            promise.then( function( response ) {
                $scope.reports = response.data.data;
                $scope.reports.forEach( r => {
                    $scope.labels.push( r.location.location_name );
                    $scope.data.push( r.monto );
                });
            });

        }
    }]);