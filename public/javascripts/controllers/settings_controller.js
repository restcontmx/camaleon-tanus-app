yukonApp
    .factory( 'SettingsRepository', [ '$http', function( $http ) {
        return({
            getSettings : ( id ) => $http.get( '/reports/settings/' + id ),
            updateSettings : ( data ) => $http.put( '/reports/settings/' + data.id, data ),
        });
    }])
    .controller( 'settings-controller', [   '$scope',
                                            '$rootScope',
                                            'SettingsRepository',
                                            'AuthRepository',
                                            'growl',
                                            function(   $scope,
                                                        $rootScope,
                                                        SettingsRepository, 
                                                        AuthRepository,
                                                        growl   ) {
        if( AuthRepository.viewVerification() ) {
            $scope.currencies = [ '$', 'S/.', '€' ]
            SettingsRepository.getSettings( $rootScope.user_info.s ).success( function( response ) {
                if( !response.error ) {
                    $scope.settings = response.data
                } else {
                    growl.error( "There was an error; " + response.message, {} );
                }
            }).error( function( error ) {
                growl.error( "There was an error; " + error, {} );
            });

            $scope.save_settings = function() {
                SettingsRepository.updateSettings( $scope.settings ).success( function( response ) {
                    if( !response.error ) {
                        $rootScope.settings = response.data
                        growl.success( "Settings successfuly updated.", {} );
                    } else {
                        growl.error( "There was an error; " + response.message, {} );
                    }
                }).error( function( error ) {
                    growl.error( "There was an error; " + error, {} );
                });
    
            }
        }
    }])