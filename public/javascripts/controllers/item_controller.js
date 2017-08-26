app
    .factory( 'ItemRepository', [ 'CRUDService', function( CRUDService ) {
        var model = 'it_titem';
        return({
            getAll : () => CRUDService.getAll( model ),
            add : ( data ) => CRUDService.add( model, data ),
            getById : ( id ) => CRUDService.getById( model, id ),
            update : ( data ) => CRUDService.update( model, data ),
            remove : ( id ) => CRUDService.remove( model, data ),
            validateData : function( data, scope ) {
                var ban = false;
                scope.errors = "";
                // Set model validations
                return !ban;
            }
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

            LocationRepository.getAll().success( function( data ) {
                if( !data.error ) {
                    $scope.locations = data.data;
                } else {
                    $scope.errors = data.message;
                }
            }).error( function( error ) {
                $scope.errors = error;
            });

            ItemRepository.getAll().success( function( data ) {
                if( !data.error ) {
                    $scope.items = data.data;
                } else {
                    $scope.errors = data.message;
                }
            }).error( function( error ) {
                $scope.errors = error;
            });

            $scope.querySearch   = querySearch;
            $scope.selectedItemChange = selectedItemChange;
            $scope.searchTextChange   = searchTextChange;

            function querySearch (query) {
                var results = query ? $scope.items.filter( createFilterFor(query) ) : $scope.items, deferred;
                return results;
            }

            function searchTextChange(text) {
                $log.info('Text changed to ' + text);
            }

            function selectedItemChange(item) {
                $log.info('Item changed to ' + JSON.stringify(item));
            }

            function createFilterFor(query) {
                var lowercaseQuery = angular.lowercase(query);

                return function filterFn(item) {
                    return (angular.lowercase(item.ITEM_Description).indexOf(lowercaseQuery) === 0);
                };
            }

            $scope.saveItem = function() {
                $scope.selectedItem.ITEM_Cost = $scope.newPrice;
                console.log($scope.selectedItem);
            };
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

            var promise = LocationRepository.getLocationTodayReports();

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
