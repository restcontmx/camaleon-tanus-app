yukonApp
    .factory( 'ItemRepository', [ 'CRUDService', 'LogService', '$http', function( CRUDService, LogService, $http ) {
        var model = 'it_titem';
        return({
            getAll : () => CRUDService.getAll( model ),
            add : ( data ) => CRUDService.add( model, data ),
            getById : ( id ) => CRUDService.getById( model, id ),
            update : ( data ) => CRUDService.update( model, data ),
            remove : ( id ) => CRUDService.remove( model, data ),
            getByUser : () => $http.get( '/' + model + '/byuser/' ),
            getByUserByFilter : ( text ) => $http.get( '/support/items/filter/?text=' + text  ),
            updateWithLog : ( data ) => LogService.update( model, data ),
            getActiveLogs : () => LogService.getActive( model )
        });
    }])
    .controller( 'item-controller', [   '$scope',
                                        'LocationRepository',
                                        'AuthRepository',
                                        '$q',
                                        '$log',
                                        'ItemRepository',
                                        function(   $scope,
                                                    LocationRepository,
                                                    AuthRepository,
                                                    $q,
                                                    $log,
                                                    ItemRepository  ) {
        if( AuthRepository.viewVerification() ) {

            $scope.simulateQuery = false;
            $scope.isDisabled    = false;
            $scope.locations_display = [];
            $scope.progress_ban = true;

            LocationRepository.getAll().success( function( data ) {
                if( !data.error ) {
                    $scope.locations = data.data;
                } else {
                    $scope.errors = data.message;
                }$scope.progress_ban = false;
            }).error( function( error ) {
                $scope.errors = error;
                $scope.progress_ban = false;
            });

            $scope.searchItem = function() {
                $scope.progress_ban = true;
                ItemRepository.getByUserByFilter( $scope.searchText ).success( function( data ) {
                    if( !data.error ) {
                        $scope.items = data.data;
                        $scope.array_o_items = [];
                        $scope.items.map( i => ( { 'item_description' : i.item_description, 'item_id' : i.item_id, 'location' : i.location } ) )
                                    .forEach( i => {
                                        let temp_item = $scope.array_o_items.find( ( a ) => ( a.item.item_id === i.item_id ) );
                                        temp_item == undefined ? $scope.array_o_items.push( { 'item' : i, 'locations' : Array.of( i.location ) } ) : temp_item.locations.push( i.location );
                                    });
                    } else {
                        $scope.errors = data.message;
                    }$scope.progress_ban = false;
                }).error( function( error ) {
                    $scope.errors = error;
                    $scope.progress_ban = false;
                });
            };
            
            $scope.select_item = function ( item ) {
                $scope.selectedItem = item;
                $scope.locations_display = [];
                item.locations.forEach( l => $scope.locations_display.push( $scope.locations.find( loc => ( loc.id === l ) ) ) );
                $scope.locations_display.forEach( l => l.selected = false );
            };

            $scope.saveItem = function( ev ) {
                $scope.progress_ban = true;
                var sended_data = {
                    'locations' : $scope.locations_display,
                    'selectedItem' : $scope.selectedItem,
                    'newPrice' : $scope.newPrice == undefined ? 0 : $scope.newPrice,
                    'newPrice2' : $scope.newPrice2 == undefined ? 0 : $scope.newPrice2
                };
                console.log( sended_data );
                ItemRepository.updateWithLog( sended_data ).success( function( data ) {
                    if( !data.error ) {
                        $scope.updated_item = data.data;
                    } else {
                        $scope.errors = data.message;
                    }console.log( data );
                    $scope.progress_ban = false;
                }).error( function( error ) {
                    $scope.errors = error;
                    $scope.progress_ban = false;
                });
            }
        }
    }])
    .controller('item-reports-controller', [    '$scope',
                                                'LocationRepository',
                                                'AuthRepository',
                                                'ItemRepository',
                                                function(   $scope,
                                                            LocationRepository,
                                                            AuthRepository,
                                                            ItemRepository  ) {
        if( AuthRepository.viewVerification() ) {

            let promise = LocationRepository.getLocationTodayReports();

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
    }])
    .controller( 'item-logs-controller', [  '$scope',
                                            'ItemRepository',
                                            'AuthRepository',
                                            function(   $scope,
                                                        ItemRepository,
                                                        AuthRepository  ) {
        if( AuthRepository.viewVerification() ) {
            ItemRepository.getActiveLogs().success( function( response ) {
                if( !response.error ) {
                    $scope.logs = response.data;
                } else {
                    $scope.errors = response.message;
                }
            }).error( function( error ) {
                $scope.errors = error;
            });
        }
    }]);
