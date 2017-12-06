yukonApp
    .factory( 'FamilyRepository', [ '$http', function( $http ) {
        var model = 'it_tfamily';
        return({
            reportsByDate : ( d1, d2, turn_id ) => $http.get( '/reports/' + model + '/?d1=' + d1 + '&d2=' + d2 + '&turn=' + turn_id )
        });
    }])
    .controller( 'family-controller', [ '$scope',
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
    .controller('family-reports-controller', [  '$scope',
                                                'LocationRepository',
                                                'FamilyRepository',
                                                'TurnRepository',
                                                'AuthRepository',
                                                function(   $scope,
                                                            LocationRepository,
                                                            FamilyRepository,
                                                            TurnRepository,
                                                            AuthRepository  ) {
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
                    title: "Family Sales"
                }
            });
            // Get reports
            // Function that sets all the reports by date range and turn
            $scope.get_reports = function() {
                $scope.progress_ban = true;
                // Format dates and get turn according of the selected index
                let date_1  = ( $scope.date_range.date_start.getMonth() + 1) + '/' + $scope.date_range.date_start.getDate() + '/' + $scope.date_range.date_start.getFullYear() + ' ' + $scope.date_range.date_start.getHours() + ':' + $scope.date_range.date_start.getMinutes() + ':' + $scope.date_range.date_start.getSeconds(),
                    date_2  = ( $scope.date_range.date_end.getMonth() + 1) + '/' + $scope.date_range.date_end.getDate() + '/' + $scope.date_range.date_end.getFullYear() + ' ' + $scope.date_range.date_end.getHours() + ':' + $scope.date_range.date_end.getMinutes() + ':' + $scope.date_range.date_end.getSeconds(),
                    turn_id = $( '#turns_select' ).val() ? $( '#turns_select' ).val() : 0;
                
                FamilyRepository.reportsByDate( date_1, date_2, turn_id ).success( function( data ) {
                    if( !data.error ) {
                        $scope.family_reports = data.data.family_reports;
                        $scope.family_reports_all = data.data.family_reports_all;
                        $scope.family_reports_all_table = data.data.family_reports_all;
                        $scope.top10_donut_data = [];
                        $scope.global_total = $scope.family_reports_all_table.map( r => parseFloat( r.total ) ).reduce( ( a, b ) => ( a + b ), 0 );
                        $scope.family_reports_all_table.slice(0, 10).forEach( r => $scope.top10_donut_data.push( [ r.fam_name, r.total ] ) );
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
                                title: "Family Sales"
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
                                // Set the locations bar table
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
                $scope.top10_donut_data = [];

                if ( locations.length == 0 || locations.length == $scope.locations.length ) {
                    $scope.family_reports_all_table = $scope.family_reports_all;
                    $scope.global_total = $scope.family_reports_all_table.map(r => parseFloat(r.total)).reduce((a, b) => (a + b), 0);
                    set_compare_table( $scope.locations );
                    $scope.family_reports_all_table.slice(0, 10).forEach( r => $scope.top10_donut_data.push( [ r.fam_name, r.total ] ) );                
                } else {
                    $scope.family_reports_all_table = $scope.family_reports.filter( c => ( locations.find( l => ( c.location == l.id ) ) ) );
                    $scope.global_total = $scope.family_reports_all_table.map(r => parseFloat(r.total)).reduce((a, b) => (a + b), 0);
                    set_compare_table( locations );
                    $scope.family_reports_all_table.slice(0, 10).forEach( r => $scope.top10_donut_data.push( [ r.fam_name, r.total ] ) );                                    
                }

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
                        title: "Family Sales"
                    }
                });
            };
            // Set compare table
            // This function is for setting the bar graphics comparing all the locaitons
            var set_compare_table = function( locations ) {
                let table_data = Array.of( "Total Sales" ),
                    cate_table_names = [];
                locations.forEach( l => {
                    let reports = $scope.family_reports.filter( r => r.location == l.id );
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

