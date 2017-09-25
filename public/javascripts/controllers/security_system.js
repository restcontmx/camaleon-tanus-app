yukonApp
    .factory( 'AuthRepository', [ '$http', '$state', '$cookies', '$cookieStore', '$location', '$rootScope', function( $http, $state, $cookies, $cookieStore, $location, $rootScope ) {
        return {
            login : ( email, password ) => $http.post( 'auth/login/', JSON.stringify( { email : email, password : password } ) ), // Login function that verifies user on the api
            logout : () => $http.post( 'auth/logout' ), // Logs out the user erreasing the cookie
            removeSession : () => { $cookieStore.remove( 'userdata' ) }, // Removes session from the cookies
            getFullAuthData : () => this.getSession().auth_data, // get full authentication data
            // This verifies if the session is setted on the cookies
            isSessionSet : function() {
                var currentUser = $cookies["userdata"] || null;
                return currentUser ? true : false;
            },
            // This gets the full session object from the cookies
            getSession : function() {
                var currentUser = $cookies["userdata"] || null;
                return currentUser;
            },
            // View if the app is verified on the auth module
            viewVerification : function( ) {
                var currentUser = $cookies["userdata"] || null;
                if( !currentUser ) {                
                    $state.go( 'login' );
                    return false;
                } else {                  
                    return true;
                }
            },
            setCookie : function( user_data ) {
                $cookies["userdata"] = user_data;
            }
        }
    }])
    .controller( 'auth-controller', [   '$scope', 
                                        '$state', 
                                        '$location', 
                                        '$rootScope', 
                                        '$timeout', 
                                        'growl',
                                        'AuthRepository', function( $scope, 
                                                                    $state, 
                                                                    $location, 
                                                                    $rootScope, 
                                                                    $timeout, 
                                                                    growl,
                                                                    AuthRepository ) {
        // Auth controller
        // This manages the authentication on the login view
        // Sets a login function that sends email and password
        $scope.$on('$stateChangeSuccess', function () { 
            $scope.login = function() {   
                AuthRepository.login( $scope.email, $scope.password ).success( function( data ) {
                    if( data.error ) {
                        growl.error( data.message, {} );
                    } else {
                        $scope.message = data.message;
                        $rootScope.user_info = AuthRepository.getSession();
                        growl.success("Login success.", {});
                        setTimeout(function() {
                            $state.go( 'auth.home' );
                        }, 2000);
                    }
                }).error( function( error ) {
                    growl.error( error, {} );
                });
            };        
        });
    }])
    .controller( 'header-controller', [ '$scope', 
                                        '$state', 
                                        'ItemRepository', 
                                        'AuthRepository', 
                                        function(   $scope, 
                                                    $state, 
                                                    ItemRepository, 
                                                    AuthRepository  ) {
        //if( AuthRepository.viewVerification( $scope, AuthRepository ) ) {
            $scope.logout = function() {
                AuthRepository.logout().success( function( response ) {
                    AuthRepository.removeSession()               
                    $state.go( 'login' );
                }).error( function( error ) {
                    $scope.errors = error;
                });
            };
            ItemRepository.getActiveLogs().success( function( response ) {
                if( !response.error ) {
                    $scope.logs = response.data;
                    $scope.preview_logs = $scope.logs.slice( 0, 5 );
                } else {
                    $scope.errors = response.message;
                }
            }).error( function( error ) {
                $scope.errors = error;
            });
        //}
    }]);
