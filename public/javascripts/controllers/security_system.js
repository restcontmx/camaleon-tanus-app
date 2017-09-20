yukonApp
    .factory( 'AuthRepository', [ '$http', '$cookies', '$cookieStore', '$location', '$rootScope', function( $http, $cookies, $cookieStore, $location, $rootScope ) {
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
            viewVerification : function() {
                console.log( $cookies[ 'userdata' ] )
                if( !this.isSessionSet() ) {
                    $location.path( '/login' );
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
                    $location.path( '/' );
                }
            }).error( function( error ) {
                $scope.errors = error;
                console.log( error );
            });
        };
        
    }])
    .controller( 'header-controller', [ '$scope', 'AuthRepository', function( $scope, AuthRepository ) {
        $scope.logout = function() {
            AuthRepository.logout().success( function( response ) {
                if( !response.error ) {
                    AuthRepository.setCookie( response.auth_data );
                    AuthRepository.viewVerification();
                } else {
                    $scope.errors = response.message;
                }
            }).error( function( error ) {
                $scope.errors = error;
            });
        };
    }]);
