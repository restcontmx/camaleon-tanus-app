var app = angular.module( 'CAMALEON-REPORTS', [     'ngRoute',
                                                    'ngCookies',
                                                    'ngMaterial',
                                                    'warrior-filters',
                                                    'ui.router',
                                                    'ui.bootstrap',
                                                    'crud-service'] )
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
    .config([ '$routeProvider', '$locationProvider', function( $routeProvider, $locationProvider ) {
        $routeProvider
            .when( '/', {
                templateUrl : '../views/user/dashboard.html'
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
            .when( '/location', {
                templateUrl : '../views/location/list.html'
            })
            // reports
            .when( '/404', {
                templateUrl : '../404.html'
            })
            .otherwise({
                redirectTo : '/404'
            });
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
    .controller( 'menu-cotroller', [ '$scope', '$rootScope', 'AuthRepository', function( $scope, $rootScope, AuthRepository ) {
        AuthRepository.setMenu();
        $scope.set_menu_state = function( element ) {
            AuthRepository.setActiveMenu( element );
        };
    }])
    .controller( 'main-controller', [ '$scope', 'AuthRepository', function( $scope, AuthRepository ) {
        if( AuthRepository.viewVerification() ) {
            $scope.title = "Main View";
            $scope.message = "This is a message!";
        }
    }]);
