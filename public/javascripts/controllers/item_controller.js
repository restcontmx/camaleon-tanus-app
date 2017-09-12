app
    .factory( 'ItemRepository', [ 'CRUDService', 'LogService', '$http', function( CRUDService, LogService, $http ) {
        var model = 'it_titem';
        return({
            getAll : () => CRUDService.getAll( model ),
            add : ( data ) => CRUDService.add( model, data ),
            getById : ( id ) => CRUDService.getById( model, id ),
            update : ( data ) => CRUDService.update( model, data ),
            remove : ( id ) => CRUDService.remove( model, data ),
            getByUser : () => $http.get( '/' + model + '/byuser/' ),
            updateWithLog : ( data ) => LogService.update( model, data )
        });
    }])
    .controller( 'item-controller', [   '$scope',
                                        'LocationRepository',
                                        'AuthRepository',
                                        '$q',
                                        '$log',
                                        'ItemRepository',
                                        '$mdDialog',
                                        function(   $scope,
                                                    LocationRepository,
                                                    AuthRepository,
                                                    $q,
                                                    $log,
                                                    ItemRepository,
                                                    $mdDialog  ) {
        if( AuthRepository.viewVerification() ) {

            $scope.simulateQuery = false;
            $scope.isDisabled    = false;
            $scope.querySearch   = querySearch;
            $scope.selectedItemChange = selectedItemChange;
            $scope.searchTextChange   = searchTextChange;
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

            ItemRepository.getByUser().success( function( data ) {
                if( !data.error ) {
                    $scope.items = data.data;
                    $scope.array_o_items = [];
                    $scope.items.map( i => ( { 'ITEM_Description' : i.ITEM_Description, 'ITEM_ID' : i.ITEM_ID, 'location' : i.location } ) )
                                .forEach( i => {
                                    let temp_item = $scope.array_o_items.find( ( a ) => ( a.item.ITEM_ID === i.ITEM_ID ) );
                                    temp_item == undefined ? $scope.array_o_items.push( { 'item' : i, 'locations' : Array.of( i.location ) } ) : temp_item.locations.push( i.location );
                                });
                } else {
                    $scope.errors = data.message;
                }$scope.progress_ban = false;
            }).error( function( error ) {
                $scope.errors = error;
                $scope.progress_ban = false;
            });

            function querySearch (query) {
                var results = query ? $scope.array_o_items.filter( createFilterFor(query) ) : $scope.array_o_items, deferred;
                return results;
            }

            function searchTextChange(text) {
                $log.info('Text changed to ' + text);
            }

            function selectedItemChange(item) {
                $scope.locations_display = [];
                item.locations.forEach( l => $scope.locations_display.push( $scope.locations.find( loc => ( loc.id === l ) ) ) );
                $scope.locations_display.forEach( l => l.selected = false );
            }

            function createFilterFor(query) {
                var lowercaseQuery = angular.lowercase(query);

                return function filterFn(i) {
                    return (angular.lowercase(i.item.ITEM_Description).indexOf(lowercaseQuery) === 0);
                };
            }

            $scope.saveItem = function( ev ) {
                var confirm = $mdDialog.confirm()
                    .title('Are you sure you want to edit this ITEM?')
                    .textContent('Once you change this ITEM will be reflected in minutes on all selected locations.')
                    .ariaLabel('Lucky day')
                    .targetEvent(ev)
                    .ok('Change ITEM')
                    .cancel('Cancel Transaction');

                $mdDialog.show(confirm).then(function () {
                    $scope.progress_ban = true;
                    var sended_data = {
                        'locations' : $scope.locations_display,
                        'selectedItem' : $scope.selectedItem,
                        'newPrice' : $scope.newPrice == undefined ? 0 : $scope.newPrice,
                        'newPrice2' : $scope.newPrice2 == undefined ? 0 : $scope.newPrice2
                    };
    
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
                }, function () {
                    
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
    }]);
