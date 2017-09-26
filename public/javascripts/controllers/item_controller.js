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
            revertLog : ( id ) => LogService.revert( model, id ),
            getActiveLogs : () => LogService.getActive( model ),
            getInactiveLogs : () => LogService.getInactive( model ),
            delete_log : ( id ) => LogService.delete_itemchange( id ),
            reportsByDate : ( d1, d2, turn_id ) => $http.get( '/reports/' + model + '/?d1=' + d1 + '&d2=' + d2 + '&turn=' + turn_id ),
            getItemReportsByCategory : ( c_id, c_name, d1, d2, turn_id ) => $http.get( '/reports/' + model + '/bycategory/?d1=' + d1 + '&d2=' + d2 + '&turn=' + turn_id + '&cate_name=' + c_name + '&cate_id=' + c_id )
        });
    }])
    .controller( 'item-controller', [   '$scope',
                                        'LocationRepository',
                                        'AuthRepository',
                                        '$q',
                                        '$log',
                                        'growl',
                                        'ItemRepository',
                                        function(   $scope,
                                                    LocationRepository,
                                                    AuthRepository,
                                                    $q,
                                                    $log,
                                                    growl,
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
                if( $scope.selectedItem ) {
                    $scope.progress_ban = true;
                    var sended_data = {
                        'locations' : $scope.locations_display,
                        'selectedItem' : $scope.selectedItem,
                        'newPrice' : $scope.newPrice == undefined ? 0 : $scope.newPrice,
                        'newPrice2' : $scope.newPrice2 == undefined ? 0 : $scope.newPrice2
                    };
                    ItemRepository.updateWithLog( sended_data ).success( function( data ) {
                        if( !data.error ) {
                            growl.success("ITEM" + $scope.selectedItem.item.item_description + " Log created!", {});
                        } else {
                            growl.warning( data.message, {});
                        }
                        $scope.progress_ban = false;
                    }).error( function( error ) {
                        $scope.progress_ban = false;
                        growl.error(error, {});
                    });
                } else {
                    growl.error("Please select an item first!", {});
                }
            };

            $scope.$on('$stateChangeSuccess', function () {
                new jBox('Confirm', {
                    closeButton: false,
                    confirmButton: 'Yes',
                    cancelButton: 'No',
                    _onOpen: function() {
                        // Set the new action for the submit button
                        this.submitButton
                            .off('click.jBox-Confirm' + this.id)
                            .on('click.jBox-Confirm' + this.id, function() {
                                $scope.saveItem();
                                this.close();
                            }.bind(this));
                    }
                });
                
            });
        }
    }])
    .controller('item-reports-controller', [    '$scope',
                                                'LocationRepository',
                                                'TurnRepository',
                                                'AuthRepository',
                                                'ItemRepository',
                                                '$rootScope',
                                                'uiGridConstants',
                                                function(   $scope,
                                                            LocationRepository,
                                                            TurnRepository,
                                                            AuthRepository,
                                                            ItemRepository,
                                                            $rootScope,
                                                            uiGridConstants ) {
        if( AuthRepository.viewVerification() ) {
            let todays = new Date(),
                locations_combined = c3.generate({
                    bindto: '#locations_combined',
                    data: {
                        columns: [],
                        type: 'bar',
                        types: {
                            data5: 'area'
                        }
                    }
                });
            $scope.date_end = new Date();
            todays.setDate( 1 );
            $scope.date_start = todays;
            $scope.date_start.setHours( "00" );
            $scope.date_start.setMinutes( "00" );
            $scope.date_start.setSeconds( "00" );
            $scope.date_end.setHours( "23" );
            $scope.date_end.setMinutes( "59" );
            $scope.date_end.setSeconds( "59" );
            $scope.progress_ban = true; // This is for the loanding simbols or whatever you want to activate
            $scope.turn_options = Array.of( { text : 'All',  id : 0 } );
            // Table grid options
            $scope.gridOptions = {
                enableRowSelection: true, enableRowHeaderSelection: false,
                enableSorting: true,
                showGridFooter: true,
                enableGridMenu: true,
                enableFiltering: true,
                paginationPageSizes: [25, 50, 75],
                paginationPageSize: 25,
                columnDefs: [
                    { field: 'item_id' },
                    { field: 'item_description' },
                    { field: 'vta_neta' },
                    { field: 'tax1' },
                    { field: 'tax2' },
                    { field: 'tax3' },
                    { field: 'total', enableSorting: true }
                ]
            };
            $scope.gridOptions.multiSelect = false;
            $scope.gridOptions.modifierKeysToMultiSelect = false;
            $scope.gridOptions.noUnselect = true;
            $scope.gridOptions.onRegisterApi = function( gridApi ) {
                $scope.gridApi = gridApi;
                gridApi.selection.on.rowSelectionChanged($scope,function(row){
                    $rootScope.grid_action( row.entity );
                });
            };
            // Grid action for selected rows
            $rootScope.grid_action = function( row ) {
                // Selected row option
            };
            // Date range variable
            // the important ones area start and end which are already conffigured on the scope
            $scope.date_range = {
                today: moment().format('MMMM D, YYYY'),
                last_month: moment().subtract('M', 1).format('MMMM D, YYYY'),
                date_start : $scope.date_start,
                date_end : $scope.date_end
            };
            // Date range picker settings
            if ($("#drp_predefined").length) {
                $('#drp_predefined').daterangepicker(
                    {
                        timePicker: true,
                        timePicker24Hour: true,
                        ranges: {
                            'Today': [moment(), moment()],
                            'Yesterday': [moment().subtract('days', 1), moment().subtract('days', 1)],
                            'Last 7 Days': [moment().subtract('days', 6), moment()],
                            'Last 30 Days': [moment().subtract('days', 29), moment()],
                            'This Month': [moment().startOf('month'), moment().endOf('month')],
                            'Last Month': [moment().subtract('month', 1).startOf('month'), moment().subtract('month', 1).endOf('month')]
                        },
                        startDate: moment().subtract('days', 6),
                        endDate: moment()
                    },
                    function(start, end) {
                        $('#drp_predefined span').html(start.format("MM/DD/YYYY HH:mm:ss") + ' - ' + end.format("MM/DD/YYYY HH:mm:ss"));
                        // When selected the datepicker returns a moment object; this just formats everything to what we need
                        $scope.date_range.date_start = new Date( start.format("MM/DD/YYYY HH:mm:ss") );
                        $scope.date_range.date_end = new Date( end.format("MM/DD/YYYY HH:mm:ss") );
                    }
                );
            }
            // Get all the turns
            // Then addthem to the turns select
            // Its on jquery, so be careful
            TurnRepository.getAll().success( function( response ) {
                if( !response.error ) {
                    $scope.turns = response.data;
                    $scope.turns.forEach( t => $scope.turn_options.push( { text : t.name, id : t.id } ));
                    $("#turns_select").select2({
                        placeholder: "Select Turn...",
                        data : $scope.turn_options
                    });
                    $( '#turns_select' ).val(0);
                } else {
                    $scope.errors = response.message;
                }
            }).error( function( error ) {
                $scope.errors = error;
            });
            // Top ten objects grafic
            var top10_donut_graphic = c3.generate({
                bindto: '#top10_donut',
                data: {
                    columns: [ ],
                    type: 'donut',
                    onclick: function (d, i) { /*console.log("onclick", d, i);*/ },
                    onmouseover: function (d, i) { /*console.log("onmouseover", d, i);*/ },
                    onmouseout: function (d, i) { /*console.log("onmouseout", d, i);*/ }
                },
                donut: {
                    title: "Item Sales"
                }
            });
            // Get reports
            // Function that sets all the reports by date range and turn
            $scope.get_reports = function() {
                $scope.progress_ban = true;

                let date_1  = ( $scope.date_range.date_start.getMonth() + 1) + '/' + $scope.date_range.date_start.getDate() + '/' + $scope.date_range.date_start.getFullYear() + ' ' + $scope.date_range.date_start.getHours() + ':' + $scope.date_range.date_start.getMinutes() + ':' + $scope.date_range.date_start.getSeconds(),
                    date_2  = ( $scope.date_range.date_end.getMonth() + 1) + '/' + $scope.date_range.date_end.getDate() + '/' + $scope.date_range.date_end.getFullYear() + ' ' + $scope.date_range.date_end.getHours() + ':' + $scope.date_range.date_end.getMinutes() + ':' + $scope.date_range.date_end.getSeconds(),
                    turn_id = $( '#turns_select' ).val() ? $( '#turns_select' ).val() : 0;

                ItemRepository.reportsByDate( date_1, date_2, turn_id ).success( function( data ) {
                    if( !data.error ) {
                        $scope.item_reports = data.data.item_reports;
                        $scope.item_reports_all = data.data.item_reports_all;
                        $scope.item_reports_all_table = data.data.item_reports_all;
                        $scope.gridOptions.data = $scope.item_reports_all_table;
                        $scope.top10_donut_data = [];
                        $scope.global_total = $scope.item_reports_all_table.map( r => parseFloat( r.total ) ).reduce( ( a, b ) => ( a + b ), 0 );
                        $scope.item_reports_all_table.slice(0, 10).forEach( r => $scope.top10_donut_data.push( [ r.item_description, r.total ] ) );
                        top10_donut_graphic.destroy();
                        top10_donut_graphic = c3.generate({
                            bindto: '#top10_donut',
                            data: {
                                columns: $scope.top10_donut_data,
                                type: 'donut',
                                onclick: function (d, i) { /*console.log("onclick", d, i);*/ },
                                onmouseover: function (d, i) { /*console.log("onmouseover", d, i);*/ },
                                onmouseout: function (d, i) { /*console.log("onmouseout", d, i);*/ }
                            },
                            donut: {
                                title: "Item Sales"
                            }
                        });
                        // Get locations
                        LocationRepository.getAll().success( function( d1 ) {
                            if( !d1.error ) {
                                let location_names = "";
                                $scope.locations = d1.data;
                                $scope.locations.forEach( l => location_names += (l.location_name + ",") );
                                location_names = location_names.substring( 0, location_names.length-1 );
                                // locations on tokenization field
                                // is just an array with the names
                                // And sets by default all with a string separated by commas
                                $( '#locations_tokenization' ).val( location_names );
                                if($('#locations_tokenization').length) {
                                    $('#locations_tokenization').select2({
                                        placeholder: "Select Locations (all by default)...",
                                        tags: $scope.locations.map( l => l.location_name ),
                                        tokenSeparators: [","]
                                    });
                                }
                                // Sets the locations bar table
                                set_compare_table( $scope.locations );
                            } else {
                                $scope.errors = d1.message;
                            }
                            $scope.progress_ban = false;
                        }).error( function( error ) {
                            $scope.errors = error;
                            $scope.progress_ban = false;
                        });
                    } else {
                        $scope.errors = data.error;
                    }
                }).error( function( error ) {
                    $scope.errors = error;
                });
            };
            // Gets by default all the reports between todays date and the start of the month
            $scope.get_reports();
            // Locations select change
            // When the locations field changes of locations
            $scope.locations_select_change = function() {
                
                let locations_selected = $scope.locations_select.split(','), 
                    locations = [],
                    removal_ids = [];

                locations_selected.forEach( ls => {
                    let temp_location = $scope.locations.find( l => ( l.location_name == ls ) )
                    if( temp_location ) {
                        locations.push( temp_location );
                    }
                });
                
                top10_donut_graphic.destroy();
                
                if ( locations.length == 0 || locations.length == $scope.locations.length ) {
                    $scope.gridOptions.data = $scope.item_reports_all;
                    $scope.global_total = $scope.item_reports_all_table.map(r => parseFloat(r.total)).reduce((a, b) => (a + b), 0);
                    set_compare_table( $scope.locations );
                } else {
                    $scope.gridOptions.data = $scope.item_reports.filter( c => ( locations.find( l => ( c.location == l.id ) ) ) );
                    $scope.global_total = $scope.item_reports_all_table.map(r => parseFloat(r.total)).reduce((a, b) => (a + b), 0);
                    set_compare_table( locations );
                }
                $scope.top10_donut_data = [];
                $scope.gridOptions.data.slice(0, 10).forEach( r => $scope.top10_donut_data.push( [ r.item_description, r.total ] ) );

                top10_donut_graphic = c3.generate({
                    bindto: '#top10_donut',
                    data: {
                        columns: $scope.top10_donut_data,
                        type: 'donut',
                        onclick: function (d, i) { /*console.log("onclick", d, i);*/ },
                        onmouseover: function (d, i) { /*console.log("onmouseover", d, i);*/ },
                        onmouseout: function (d, i) { /*console.log("onmouseout", d, i);*/ }
                    },
                    donut: {
                        title: "Item Sales"
                    }
                });
            };
            // Set compare table
            // This function is for setting the bar graphics comparing all the locaitons
            var set_compare_table = function( locations ) {
                let table_data = Array.of( "Total Sales" ),
                    cate_table_names = [];
                locations.forEach( l => {
                    let reports = $scope.item_reports.filter( r => r.location == l.id );
                    table_data.push( reports.map( r => ( parseFloat( r.total ) ) ).reduce( ( a, b ) => ( a + b ), 0 ) );
                    cate_table_names.push( l.location_name );
                });
                locations_combined.destroy();
                locations_combined = c3.generate({
                    bindto: '#locations_combined',
                    data: {
                        columns: Array.of( table_data ),
                        type: 'bar',
                        types: {
                            data5: 'area'
                        }
                    },
                    axis: {
                        x: {
                            type: 'category',
                            categories: cate_table_names
                        }
                    },
                    point: {
                        r: '4',
                        focus: {
                            expand: {
                                r: '5'
                            }
                        }
                    },
                    bar: {
                        width: {
                            ratio: 0.4 // this makes bar width 50% of length between ticks
                        }
                    },
                    grid: {
                        x: {
                            show: true
                        },
                        y: {
                            show: true
                        }
                    },
                    color: {
                        pattern: ['#ff7f0e', '#2ca02c', '#9467bd', '#1f77b4', '#d62728']
                    }
                });
            };
        }
    }])
    .controller( 'item-logs-controller', [  '$scope',
                                            'ItemRepository',
                                            'growl',
                                            'AuthRepository',
                                            function(   $scope,
                                                        ItemRepository,
                                                        growl,
                                                        AuthRepository  ) {
        if( AuthRepository.viewVerification() ) {
            
            $scope.progress_ban = true;

            $scope.getAllActiveLogs = function() {
                $scope.progress_ban = true;
                ItemRepository.getActiveLogs().success( function( response ) {
                    if( !response.error ) {
                        $scope.logs = response.data;
                    } else {
                        $scope.errors = response.message;
                    } $scope.progress_ban = false;
                }).error( function( error ) {
                    $scope.errors = error;
                    $scope.progress_ban = false;
                });
            };

            $scope.getAllInactiveLogs = function() {
                $scope.progress_ban = true;
                ItemRepository.getInactiveLogs().success( function( response ) {
                    if( !response.error ) {
                        $scope.logs = response.data;
                    } else {
                        $scope.errors = response.message;
                    } $scope.progress_ban = false;
                }).error( function( error ) {
                    $scope.errors = error;
                    $scope.progress_ban = false;
                });
            };

            $scope.deleteLog = function( log ) {
                $scope.progress_ban = true;
                ItemRepository.delete_log( log.id ).success( function( response ) {
                    if( !response.error ) {
                        growl.success("Log successfuly deleted.", {});
                        $scope.getAllActiveLogs();
                    } else {
                        growl.warning(response.message, {});
                    }$scope.progress_ban = false;
                }).error( function( error ) {
                    growl.error("There was an error deleting this log!", {});
                    $scope.progress_ban = false;
                });
            };

            $scope.revertLog = function( log ) {
                $scope.progress_ban = true;

                ItemRepository.revertLog( log.id ).success( function( data ) {
                    if( !data.error ) {
                        growl.success("Log for ITEM: " + log.item_description + " reverted!", {});
                    } else {
                        growl.warning( data.message, {});
                    }
                    $scope.progress_ban = false;
                }).error( function( error ) {
                    $scope.progress_ban = false;
                    growl.error(error, {});
                });
            };

            $scope.$on('$stateChangeSuccess', function () { 
                
            });
        }
    }]);
