app
    .factory( 'TicketRepository', [ '$http', function( $http ) {
        return({
            getReports : ( d1, d2, p, loc ) => $http.get( '/reports/ticket/?d1=' + d1 + '&d2=' + d2 + '&p=' + p + '&loc=' + loc )
        })
    }])
    .controller( 'ticket-reports-controller', [ '$scope',
                                                'TicketRepository',
                                                'LocationRepository',
                                                'AuthRepository',
                                                '$rootScope',
                                                function(   $scope,
                                                            TicketRepository,
                                                            LocationRepository,
                                                            AuthRepository,
                                                            $rootScope  ) {
        if( AuthRepository.viewVerification() ) {
            $scope.progress_ban = false;
            $scope.gridOptions = {
                data: []
            };
            $rootScope.p = 0;
            $rootScope.loc = 0;
            $scope.locations_options = [];
            $scope.locations_options.push( { 'name' : 'ALL', 'location' : { 'id' : 0 } } );
            LocationRepository.getAll().success( function( data ) {
                if( !data.error ) {
                    $scope.locations = data.data;
                    $scope.locations.forEach( l => $scope.locations_options.push( { 'name' : l.location_name, 'location' : l  } ) );
                } else {
                    $scope.errors = data.message;
                }
            }).error( function( error ) {
                $scope.errors = error;
            });

            $scope.get_reports = function() {
                $scope.progress_ban = true;
                let date_1 = ( $scope.date_start.getMonth() + 1) + '/' + $scope.date_start.getDate() + '/' + $scope.date_start.getFullYear(),
                    date_2 = ( $scope.date_end.getMonth() + 1) + '/' + $scope.date_end.getDate() + '/' + $scope.date_end.getFullYear();
                if( date_1 != undefined && date_2 != undefined ) {
                    TicketRepository.getReports( date_1,  date_2, $rootScope.p, $rootScope.loc ).success( function( data ) {
                        if( !data.error ) {
                            $rootScope.count = data.data.count;
                            $scope.tickets = data.data.tickets;
                            $scope.gridOptions.data = $scope.tickets;
                        } else {
                            $scope.errors = data.message;
                        } $scope.progress_ban = false;
                    }).error( function( error ) {
                        $scope.errors = error;
                    });
                }
            };
            $scope.customActions = { };
            $scope.customActions.refresh = $scope.reload_table;

            $scope.reload_table = function() {
                console.log( "Da da da quiero pepsi mamá" );
                console.log( $scope.paginationOptions.currentPage );
            }

            $scope.back = function() {
                console.log("back");
                if( $rootScope.p > 0 ) {
                    $rootScope.p--;
                    $scope.get_reports();
                }
            };

            $rootScope.next = function() {
                console.log("next");
                if( $rootScope.p < ( $rootScope.count / 20 ) ) {
                    $rootScope.p++;
                    $scope.get_reports();
                }
            };

            $rootScope.grid_action = function( item ) {
                $rootScope.selected_item = item;
            };

            $scope.$watch( 'selectedLocation', angular.bind( this, function(locationIndex) {
                if( locationIndex != undefined ) {
                    $rootScope.loc = $scope.locations_options[locationIndex].location.id;
                }
            }));
        }
    }]);
