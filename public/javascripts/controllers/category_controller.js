yukonApp
    .factory( 'CategoryRepository', [ '$http', function( $http ) {
        var model = 'it_tcategory';
        return({
            reportsByDate : ( d1, d2, turn_id ) => $http.get( '/reports/' + model + '/?d1=' + d1 + '&d2=' + d2 + '&turn=' + turn_id )
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
                                                    'CategoryRepository',
                                                    'LocationRepository',
                                                    'TurnRepository',
                                                    'AuthRepository',
                                                    function(   $scope,
                                                                CategoryRepository,
                                                                LocationRepository,
                                                                TurnRepository,
                                                                AuthRepository  ) {
        if( AuthRepository.viewVerification() ) {

            // grid lines
            var chart_grid_lines = c3.generate({
                bindto: '#c3_grid_lines',
                data: {
                    columns: [
                        ['sample', 30, 200, 100, 400, 150, 250],
                        ['sample2', 1300, 1200, 1100, 1400, 1500, 1250],
                    ],
                    axes: {
                        sample2: 'y2'
                    }
                },
                axis: {
                    y2: {
                        show: true
                    }
                },
                grid: {
                    y: {
                        lines: [{ value: 50, text: 'Label 50' }, { value: 1300, text: 'Label 1300', axis: 'y2' }]
                    }
                }
            });

            let todays = new Date();
            $scope.date_end = new Date();
            todays.setDate( 1 );
            $scope.date_start = todays;
            $scope.date_range = {
                today: moment().format('MMMM D, YYYY'),
                last_month: moment().subtract('M', 1).format('MMMM D, YYYY'),
                date_start : $scope.date_start,
                date_end : $scope.date_end
            };
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
                        $('#drp_predefined span').html(start.format('MMMM D, YYYY') + ' - ' + end.format('MMMM D, YYYY'));
                        $scope.date_range.date_start = start.toDate();
                        $scope.date_range.date_end = end.toDate();
                    }
				);
            }
            $scope.selectedIndex = 0;
            
            $scope.gridOptions = {
                data: []
            };
            $scope.reports = [];
            $scope.tabs_grid_options = {
                data : []
            };

            $scope.turn_options = Array.of( { text : 'All',  id : 0 } );
            $scope.selectedTurn = 0;

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

            var top10_donut_donut = c3.generate({
                
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
            
            $scope.get_reports = function() {

                $scope.top10items = {
                    data : [],
                    labels : []
                };
                $scope.labels_compare = [];
                $scope.data_compare = [];
                $scope.series_compare = [];
                $scope.tabs = [];
                $scope.tabs.length = 0;
                
                let date_1  = ( $scope.date_range.date_start.getMonth() + 1) + '/' + $scope.date_range.date_start.getDate() + '/' + $scope.date_range.date_start.getFullYear(),
                    date_2  = ( $scope.date_range.date_end.getMonth() + 1) + '/' + $scope.date_range.date_end.getDate() + '/' + $scope.date_range.date_end.getFullYear(),
                    turn_id = $( '#turns_select' ).val() ? $( '#turns_select' ).val() : 0;

                if( date_1 != undefined && date_2 != undefined  ) {
                    CategoryRepository.reportsByDate( date_1, date_2, turn_id ).success( function( data ) {
                        if( !data.error ) {
                            $scope.category_reports = data.data.category_reports;
                            $scope.item_reports = [];
                            $scope.category_reports_all = data.data.category_reports_all;
                            $scope.category_reports_all_table = data.data.category_reports_all;
                            $scope.top10_donut_data = [];
                            $scope.global_total = $scope.category_reports_all_table.map( r => parseFloat( r.total ) ).reduce( ( a, b ) => ( a + b ), 0 );
                            $scope.category_reports_all_table.slice(0, 10).forEach( r => $scope.top10_donut_data.push( [ r.cate_name, r.total ] ) );
                            top10_donut_donut.destroy();
                            top10_donut_donut = c3.generate({
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
                            setTimeout(function () {
                                top10_donut_donut.load({
                                    columns: $scope.top10_donut_data
                                });
                            }, 2500);
                            // Get locations
                            LocationRepository.getAll().success( function( d1 ) {
                                if( !d1.error ) {
                                    let location_names = "";
                                    $scope.locations = d1.data;
                                    $scope.locations.forEach( l => location_names += (l.location_name + ",") );
                                    location_names = location_names.substring( 0, location_names.length-1 );
                                    $( '#locations_tokenization' ).val( location_names );
                                    if($('#locations_tokenization').length) {
                                        $('#locations_tokenization').select2({
                                            placeholder: "Select Locations (all by default)...",
                                            tags: $scope.locations.map( l => l.location_name ),
                                            tokenSeparators: [","]
                                        });
                                    }
                                    set_compare_table();
                                } else {
                                    $scope.errors = d1.message;
                                }
                            }).error( function( error ) {
                                $scope.errors = error;
                            });
                        } else {
                            $scope.errors = data.error;
                        }
                    }).error( function( error ) {
                        $scope.errors = error;
                    });
                } else {
                    alert( "Please select two dates!" );
                }
            };

            $scope.get_reports();

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
                
                top10_donut_donut.destroy();
                top10_donut_donut = c3.generate({
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
                
                if ( locations.length == 0 || locations.length == $scope.locations.length ) {
                    $scope.category_reports_all_table = $scope.category_reports_all;
                    $scope.global_total = $scope.category_reports_all_table.map(r => parseFloat(r.total)).reduce((a, b) => (a + b), 0);
                } else {
                    $scope.category_reports_all_table = $scope.category_reports.filter( c => ( locations.find( l => ( c.location == l.id ) ) ) );
                    $scope.global_total = $scope.category_reports_all_table.map(r => parseFloat(r.total)).reduce((a, b) => (a + b), 0);
                }
                $scope.top10_donut_data = [];
                $scope.category_reports_all_table.slice(0, 10).forEach( r => $scope.top10_donut_data.push( [ r.cate_name, r.total ] ) );

                setTimeout(function () {
                    top10_donut_donut.load({
                        columns: $scope.top10_donut_data
                    });
                }, 2000);
            }
            
            var set_compare_table = function() {
                let table_data = Array.of( "Total Sales" ),
                    cate_table_names = [];
                $scope.locations.forEach( l => {
                    let reports = $scope.category_reports.filter( r => r.location == l.id );
                    table_data.push( reports.map( r => ( parseFloat( r.total ) ) ).reduce( ( a, b ) => ( a + b ), 0 ) );
                    cate_table_names.push( l.location_name );
                });
                var locations_combined = c3.generate({
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
