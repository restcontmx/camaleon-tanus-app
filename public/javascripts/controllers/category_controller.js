yukonApp
    .factory( 'CategoryRepository', [ '$http', function( $http ) {
        var model = 'it_tcategory';
        return({
            reportsByDate : ( d1, d2, turn_id ) => $http.get( '/reports/' + model + '/?d1=' + d1 + '&d2=' + d2 + '&turn=' + turn_id ),
            allReportsByDate : ( d1, d2, turn_id ) => $http.get( '/reports/' + model + '/all/?d1=' + d1 + '&d2=' + d2 + '&turn=' + turn_id )
        });
    }])
    .controller( 'category-controller', [   '$scope',
                                            'LocationRepository',
                                            'AuthRepository',
                                            function(   $scope,
                                                        LocationRepository,
                                                        AuthRepository  ) {
        if( AuthRepository.viewVerification() ) {
            LocationRepository.getAll().success( function( data ) {
                if( !data.error ) {
                    $scope.locations = data.data;
                } else {
                    $scope.errors = data.message;
                }
            }).error( function( error ) {
                $scope.errors = error;
            });
        }
    }])
    .controller('category-reports-controller', [    '$scope',
                                                    '$rootScope',
                                                    '$timeout',
                                                    'CategoryRepository',
                                                    'LocationRepository',
                                                    'TurnRepository',
                                                    'AuthRepository',
                                                    'ItemRepository',
                                                    'uiGridConstants',
                                                    'Excel',
                                                    function(   $scope,
                                                                $rootScope,
                                                                $timeout,
                                                                CategoryRepository,
                                                                LocationRepository,
                                                                TurnRepository,
                                                                AuthRepository,
                                                                ItemRepository,
                                                                uiGridConstants,
                                                                Excel   ) {
        if( AuthRepository.viewVerification() ) {

            $scope.currency = 'S/.'

            $scope.exportToExcel = function( tableId ){ // ex: '#my-table'
                var exportHref = Excel.tableToExcel( tableId, 'WireWorkbenchDataExport' );
                $timeout( function() { 
                    location.href = exportHref; 
                }, 100);
            }

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
            $scope.report_status = {
                category : true,
                items : false
            };
            $scope.date_end = new Date();
            todays.setDate( 1 );
            $scope.date_start = todays;
            $scope.date_start.setHours( "00" );
            $scope.date_start.setMinutes( "00" );
            $scope.date_start.setSeconds( "00" );
            $scope.date_end.setHours( "23" );
            $scope.date_end.setMinutes( "59" );
            $scope.date_end.setSeconds( "59" );
            $scope.full_table_display = true;
            $scope.progress_ban = true; // This is for the loanding simbols or whatever you want to activate
            $scope.detail_progress = false;
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
                    { field: 'location_name', name : 'Location' },
                    { field: 'cate_name', name : 'Category' },
                    { field: 'qty', name : 'Qty' },
                    { field: 'vta_neta', name : 'Sale' },
                    { field: 'tax1', displayName : 'IGV' },
                    { field: 'tax2', displayName : 'RC' },
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
                //if( $scope.report_status.category ) {
                  //  $scope.get_item_detail_table_on_table( row );
                //}
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
                    title: "Category Sales"
                }
            });
            // Get reports
            // Function that sets all the reports by date range and turn
            $scope.get_reports = function() {
                $scope.progress_ban = true;

                let date_1  = ( $scope.date_range.date_start.getMonth() + 1) + '/' + $scope.date_range.date_start.getDate() + '/' + $scope.date_range.date_start.getFullYear() + ' ' + $scope.date_range.date_start.getHours() + ':' + $scope.date_range.date_start.getMinutes() + ':' + $scope.date_range.date_start.getSeconds(),
                    date_2  = ( $scope.date_range.date_end.getMonth() + 1) + '/' + $scope.date_range.date_end.getDate() + '/' + $scope.date_range.date_end.getFullYear() + ' ' + $scope.date_range.date_end.getHours() + ':' + $scope.date_range.date_end.getMinutes() + ':' + $scope.date_range.date_end.getSeconds(),
                    turn_id = $( '#turns_select' ).val() ? $( '#turns_select' ).val() : 0;

                CategoryRepository.reportsByDate( date_1, date_2, turn_id ).success( function( data ) {
                    if( !data.error ) { 
                        $scope.gridOptions.columnDefs = [
                            { field: 'location_name', name : 'Location' },
                            { field: 'cate_name', name : 'Category' },
                            { field: 'qty', name : 'Qty' },
                            { field: 'vta_neta', name : 'Sale' },
                            { field: 'tax1', displayName : 'IGV' },
                            { field: 'tax2', displayName : 'RC' },
                            { field: 'total', enableSorting: true } ];
                        $scope.category_reports_all = data.data.category_reports_all;
                        $scope.category_reports_all_table = data.data.category_reports_all;
                        $scope.gridOptions.data = data.data.category_reports_all;
                        $scope.category_reports = data.data.category_reports;
                        $scope.top10_donut_data = [];
                        $scope.global_total = $scope.category_reports_all_table.map( r => parseFloat( r.total ) ).reduce( ( a, b ) => ( a + b ), 0 );
                        $scope.category_reports_all_table.slice(0, 10).forEach( r => $scope.top10_donut_data.push( [ r.cate_name, r.total ] ) );
                        top10_donut_graphic.destroy();
                        top10_donut_graphic = c3.generate({
                            bindto: '#top10_donut',
                            data: {
                                columns: $scope.top10_donut_data,
                                type: 'donut',
                                onclick: function (d, i) { /*$scope.get_item_detail_table_on_chart( d, i )*/ },
                                onmouseover: function (d, i) { /*console.log("onmouseover", d, i);*/ },
                                onmouseout: function (d, i) { /*console.log("onmouseout", d, i);*/ }
                            },
                            donut: {
                                title: "Category Sales"
                            }
                        });
                        // Set category status
                        $scope.report_status.items = false;
                        $scope.report_status.category = true;
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
                                $scope.locations_select = location_names;
                                // Sets the locations bar table
                                set_compare_table( $scope.locations );
                            } else {
                                $scope.errors = d1.message;
                            }
                            $scope.progress_ban = false;
                            $scope.hideGrid = true;
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

                $scope.gridOptions.columnDefs = [
                    { field: 'location_name', name : 'Location' },
                    { field: 'cate_name', name : 'Category' },
                    { field: 'qty', name : 'Qty' },
                    { field: 'vta_neta', name : 'Sale' },
                    { field: 'tax1', displayName : 'IGV' },
                    { field: 'tax2', displayName : 'RC' },
                    { field: 'total', enableSorting: true } ];
                
                $scope.top10_donut_data = [];

                if ( locations.length == 0 || locations.length == $scope.locations.length ) {
                    $scope.gridOptions.data = $scope.category_reports_all;
                    $scope.global_total = $scope.category_reports_all_table.map(r => parseFloat(r.total)).reduce((a, b) => (a + b), 0);
                    set_compare_table( $scope.locations );
                    $scope.category_reports_all_table.slice(0, 10).forEach( r => $scope.top10_donut_data.push( [ r.cate_name, r.total ] ) );
                } else {
                    $scope.gridOptions.data = $scope.category_reports.filter( c => ( locations.find( l => ( c.location == l.id ) ) ) );
                    $scope.global_total = $scope.category_reports_all_table.map(r => parseFloat(r.total)).reduce((a, b) => (a + b), 0);
                    set_compare_table( locations );
                    $scope.gridOptions.data.slice( 0, 10 ).forEach( r => $scope.top10_donut_data.push( [ r.cate_name, r.total ] ) );
                }

                top10_donut_graphic = c3.generate({
                    bindto: '#top10_donut',
                    data: {
                        columns: $scope.top10_donut_data,
                        type: 'donut',
                        onclick: function (d, i) { $scope.get_item_detail_table_on_chart( d, i ) },
                        onmouseover: function (d, i) { /*console.log("onmouseover", d, i);*/ },
                        onmouseout: function (d, i) { /*console.log("onmouseout", d, i);*/ }
                    },
                    donut: {
                        title: "Category Sales"
                    }
                });
                // Set category status
                $scope.report_status.items = false;
                $scope.report_status.category = true;
            };
            // Get item reports by category and dates
            // This will go to the factory and return all the category items with number reports
            $scope.get_item_reports_by_category = function( category, date1, date2, turn_id ) {
                $scope.progress_ban = true;
                $scope.selected_category = category.cate_name;
                ItemRepository.getItemReportsByCategory( category.cate_id, category.cate_name, date1, date2, turn_id ).success( function( response ) {
                    if( !response.error ) {
                        $scope.item_reports_all_table = response.data.item_reports_all;
                        $scope.global_total = $scope.item_reports_all_table.map( ir => ir.total ).reduce( ( a, b ) => ( a + b ), 0 );
                        $scope.gridOptions.columnDefs = [
                            { field: 'item_id' },
                            { field: 'item_description' },
                            { field: 'vta_neta' },
                            { field: 'tax1' },
                            { field: 'tax2' },
                            { field: 'tax3' },
                            { field: 'total', enableSorting: true } ];
                        $scope.gridOptions.data = $scope.item_reports_all_table;
                        $scope.report_status.category = false;
                        $scope.report_status.items = true;
                    } else {
                        $scope.errors = response.message;
                    }$scope.progress_ban = false;
                }).error( function( error ) {
                    $scope.errors = error;
                    $scope.progress_ban = false;
                });
            }
            // Get item detail table
            // This will get the items detailing the selected item on the chart
            $scope.get_item_detail_table_on_chart = function( d, i ) {
                let category = $scope.category_reports_all_table.slice(0, 10).find( r => r.cate_name === d.name ),
                    date_1  = ( $scope.date_range.date_start.getMonth() + 1) + '/' + $scope.date_range.date_start.getDate() + '/' + $scope.date_range.date_start.getFullYear() + ' ' + $scope.date_range.date_start.getHours() + ':' + $scope.date_range.date_start.getMinutes() + ':' + $scope.date_range.date_start.getSeconds(),
                    date_2  = ( $scope.date_range.date_end.getMonth() + 1) + '/' + $scope.date_range.date_end.getDate() + '/' + $scope.date_range.date_end.getFullYear() + ' ' + $scope.date_range.date_end.getHours() + ':' + $scope.date_range.date_end.getMinutes() + ':' + $scope.date_range.date_end.getSeconds(),
                    turn_id = $( '#turns_select' ).val() ? $( '#turns_select' ).val() : 0;
                $scope.get_item_reports_by_category( category, date_1, date_2, turn_id );
            };
            // Get item detail table
            // This will get the items detailing the selected item on the chart
            $scope.get_item_detail_table_on_table = function( category ) {
                let date_1  = ( $scope.date_range.date_start.getMonth() + 1) + '/' + $scope.date_range.date_start.getDate() + '/' + $scope.date_range.date_start.getFullYear() + ' ' + $scope.date_range.date_start.getHours() + ':' + $scope.date_range.date_start.getMinutes() + ':' + $scope.date_range.date_start.getSeconds(),
                    date_2  = ( $scope.date_range.date_end.getMonth() + 1) + '/' + $scope.date_range.date_end.getDate() + '/' + $scope.date_range.date_end.getFullYear() + ' ' + $scope.date_range.date_end.getHours() + ':' + $scope.date_range.date_end.getMinutes() + ':' + $scope.date_range.date_end.getSeconds(),
                    turn_id = $( '#turns_select' ).val() ? $( '#turns_select' ).val() : 0;
                $scope.get_item_reports_by_category( category, date_1, date_2, turn_id );
            };
            // Set compare table
            // This function is for setting the bar graphics comparing all the locaitons
            var set_compare_table = function( locations ) {
                let table_data = Array.of( "Total Sales" ),
                    cate_table_names = [];
                locations.forEach( l => {
                    let reports = $scope.category_reports.filter( r => r.location == l.id );
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
    }]);
