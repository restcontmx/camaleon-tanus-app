yukonApp
    .controller( 'dashboard-controller', [ '$scope', 'AuthRepository', function( $scope, AuthRepository ) {
        if (AuthRepository.viewVerification()) {
            $scope.title = "Dashboard";
            AuthRepository.logout().success(function(data){
                console.log( data );
                AuthRepository.removeSession();
            }).error(function(error){
                console.log( error );
            });
            console.log("This is dashboard controller");
        }
    }]);