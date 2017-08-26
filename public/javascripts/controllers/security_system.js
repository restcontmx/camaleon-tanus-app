app
    .factory( 'AuthRepository', [ '$http', '$cookies', '$location', '$rootScope', function( $http, $cookies, $location, $rootScope ) {
        return {
            login : ( email, password ) => $http.post( 'auth/login/', JSON.stringify( { email : email, password : password } ) ), // Login function that verifies user on the api
            logout : () => $http.post( 'auth/logout' ), // Logs out the user erreasing the cookie
            removeSession : () => { $cookies.remove( 'userdata' ) }, // Removes session from the cookies
            getFullAuthData : () => this.getSession().auth_data, // get full authentication data
            // This verifies if the session is setted on the cookies
            isSessionSet : function() {
                var userCookie = $cookies.get('userdata');
                return ( userCookie == undefined ) ? false : true;
            },
            // This gets the full session object from the cookies
            getSession : function() {
                var userCookie = $cookies.get('userdata');
                return ( userCookie == undefined ) ? undefined : JSON.parse(userCookie);
            },
            // View if the app is verified on the auth module
            viewVerification : function() {
                if( !this.isSessionSet() ) {
                    $rootScope.isLoggedIn.show_app = false;
                    $rootScope.isLoggedIn.show_auth = true;
                    $location.path( '/' );
                    return false;
                } else {
                    $rootScope.isLoggedIn.show_app = true;
                    $rootScope.isLoggedIn.show_auth = false;
                    return true;
                }
            },
            // Sets the menu objects
            setMenu : function() {
                $rootScope.snd_menu_items = {
                    general : [
                        {
                            name : 'Home',
                            icon : 'fa fa-home',
                            status : 'active',
                            link : '#/'
                        },
                        {
                            name : 'Dashboard',
                            icon : 'fa fa-tachometer',
                            status : '',
                            link : '#/dashboard'
                        }
                    ],
                    support : [
                        {
                            name : 'Items',
                            icon : 'fa fa-product-hunt',
                            status : '',
                            link : '#/support/items/'
                        },
                        {
                            name : 'Classes',
                            icon : 'fa fa-tags',
                            status : '',
                            link : '#/support/classes/'
                        },
                        {
                            name : 'Categories',
                            icon : 'fa fa-sitemap',
                            status : '',
                            link : '#/support/categories/'
                        },
                        {
                            name : 'Departments',
                            icon : 'fa fa-th',
                            status : '',
                            link : '#/support/departments/'
                        },
                        {
                            name : 'Families',
                            icon : 'fa fa-object-ungroup',
                            status : '',
                            link : '#/support/families/'
                        },
                        {
                            name : 'Sub Families',
                            icon : 'fa fa-object-group',
                            status : '',
                            link : '#/support/subfamilies/'
                        }
                    ],
                    reports : [
                        {
                            name : 'Categories',
                            icon : 'fa fa-sitemap',
                            status : '',
                            link : '#/reports/categories/'
                        },
                        {
                            name : 'Classes',
                            icon : 'fa fa-tags',
                            status : '',
                            link : '#/reports/classes/'
                        },
                        {
                            name : 'Departments',
                            icon : 'fa fa-th',
                            status : '',
                            link : '#/reports/departments/'
                        },
                        {
                            name : 'Items',
                            icon : 'fa fa-product-hunt',
                            status : '',
                            link : '#/reports/items/'
                        },
                        {
                            name : 'By Employee',
                            icon : 'fa fa-briefcase',
                            status : '',
                            link : '#/reports/employee/'
                        },
                        {
                            name : 'By Turn',
                            icon : 'fa fa-clock-o',
                            status : '',
                            link : '#/reports/turn/'
                        }
                    ],
                    settings : [
                        {
                            name : 'Security Levels',
                            icon : 'fa fa-lock',
                            status : '',
                            link : '#/settings/levels/'
                        },
                        {
                            name : 'Users',
                            icon : 'fa fa-users',
                            status : '',
                            link : '#/settings/users/'
                        }
                    ]
                };
            },
            // Sets the item on the menu active
            setActiveMenu : function( element ) {
                $rootScope.snd_menu_items.general.forEach( e => e.status = '' );
                $rootScope.snd_menu_items.reports.forEach( e => e.status = '' );

                if( $rootScope.snd_menu_items.settings ) {
                    $rootScope.snd_menu_items.settings.forEach( e => e.status = '' );
                }
                if( $rootScope.snd_menu_items.support ) {
                    $rootScope.snd_menu_items.support.forEach( e => e.status = '' );
                }

                element.status = 'active';
            }
        }
    }])
    .controller( 'auth-controller', [ '$scope', '$location', '$rootScope', 'AuthRepository', function( $scope, $location, $rootScope, AuthRepository ) {
        // Auth controller
        // This manages the authentication on the login view
        // Sets a login function that sends email and password
        $scope.login = function() {
            AuthRepository.login( $scope.email, $scope.password ).success( function( data ) {
                if( data.error ) {
                    $scope.errors = data.message;
                } else {
                    $scope.message = data.message;
                    $rootScope.user_info = AuthRepository.getSession();
                    AuthRepository.setMenu();
                    $location.path( '/main' );
                }
            }).error( function( error ) {
                $scope.errors = error;
            });
        };
    }]);
