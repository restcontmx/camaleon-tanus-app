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
                        }
                    ],
                    objects : [
                        {
                            name : 'Object',
                            icon : 'fa fa-cube',
                            status : '',
                            link : '#/objectlink'
                        }
                    ],
                    sales : [
                        {
                            name : 'Point of Sale',
                            icon : 'fa fa-credit-card',
                            status : '',
                            link : '#/reservations/cabin/'
                        }
                    ],
                    settings : [
                        {
                            name : 'Settings obj',
                            icon : 'fa fa-gears',
                            status : '',
                            link : '#/settingslink'
                        }
                    ]
                };
            },
            // Sets the item on the menu active
            setActiveMenu : function( element ) {
                $rootScope.snd_menu_items.general.forEach( e => e.status = '' );
                $rootScope.snd_menu_items.sales.forEach( e => e.status = '' );

                if( $rootScope.snd_menu_items.settings ) {
                    $rootScope.snd_menu_items.settings.forEach( e => e.status = '' );
                }
                if( $rootScope.snd_menu_items.objects ) {
                    $rootScope.snd_menu_items.objects.forEach( e => e.status = '' );
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
