yukonApp
    .factory('TanusRepository', ['$http', function ($http) {
        return ({
            ticketRefDocs: (ticket_ref, loc_id) => $http.get('/tanus/ticketrefdocs/?ticket_ref=' + ticket_ref + '&loc=' + loc_id ),
            ticketRefDocDetail: (ticket_ref) => $http.get('/tanus/ticketrefdocdetail/?ticket_ref=' + ticket_ref ),
        })
    }])
    
    .controller( 'ticketref-reports-controller', [  '$scope',
                                                    'TanusRepository',
                                                    'LocationRepository',
                                                    'AuthRepository',
                                                    '$rootScope',
                                                    'uiGridConstants',
                                                    'Excel',
                                                    '$timeout',
                                                    'growl',
                                                    'CamaleonTools',
                                                    function(   $scope,
                                                                TanusRepository,
                                                                LocationRepository,
                                                                AuthRepository,
                                                                $rootScope,
                                                                uiGridConstants,
                                                                Excel,
                                                                $timeout,
                                                                growl,
                                                                CamaleonTools   ) {
        if (AuthRepository.viewVerification()) {
            $scope.progress_ban = false; // This is for the loanding simbols or whatever you want to activate
            $scope.locations_options = []
            // Get reports
            // Get all the locations
            // Then addthem to the turns select
            // Its on jquery, so be careful
            LocationRepository.getAll().success( function( response ) {
                if( !response.error ) {
                    $scope.locations = response.data;
                    $scope.locations.forEach( t => $scope.locations_options.push( { text : t.location_name, id : t.id } ));
                    $("#locations_select").select2({
                        placeholder: "Select Location...",
                        data : $scope.locations_options
                    });
                    $( '#locations_select' ).val(0);
                } else {
                    growl.error( "There was an error; " + response.message, {} );
                }
            }).error( function( error ) {
                growl.error( "There was an error; " + error, {} );
            });
            // Function that sets all the reports by date range and turn
            $scope.get_reports = function () {
                $scope.progress_ban = true;
                // Format dates and get turn according of the selected index
                let loc_id = $('#locations_select').val() ? $('#locations_select').val() : 0;
                let ticket_ref = $( '#ticket_ref' ).val() ? $( '#ticket_ref' ).val() : ''
                if( loc_id > 0 && ticket_ref != '' ) {
                    TanusRepository.ticketRefDocs(ticket_ref, loc_id).success(function (response) {
                        if (!response.error) {
                            $scope.reports = response.data;
                        } else {
                            growl.error( "There was an error; " + response.message, {} );
                        }$scope.progress_ban = false;
                    }).error(function (error) {
                        growl.error( "There was an error; " + error, {} );
                        $scope.progress_ban = false;
                    });
                } else {
                    growl.error( "Please select a right location or fill the ticket input.", {} );
                    $scope.progress_ban = false;
                } 
            };
            $scope.print_xml_document = function( ticket ) {
                if( ticket ) {
                    CamaleonTools.dowload_file( ticket.p01_numcompleto + ".xml", ticket.p01_xml )
                } else {
                    growl.warning( "Please select a ticket on the list.", {} );
                }
            }
            $scope.print_pdf_document = function( ticket ) {
                console.log( "print_pdf_document" )
                if( ticket ) {
                    // format the ticket count to the real number
                    // split by "-" character
                    // remove the first character of the first word
                    // remove the first two 00s of the second word
                    // Concatenate them with an "-" again
                    // Retrieve the data by the detail pettition
                    // After getting data make a table with the details on it as in the document
                    // print all the hmtl with the excel print function
                    html2canvas(document.getElementById( 'detail_table' ), {
                        onrendered: function (canvas) {
                            console.log( canvas.toDataURL() )
                            var doc = new jsPDF();
                            
                            doc.addImage( canvas.toDataURL(), 'JPEG', 15, 25, 180, 0);
                            doc.save();
                        }
                    });
                } else {
                    growl.warning( "Please select a ticket on the list.", {} );
                }
            }

            $scope.select_ticket = function( report ) {
                $scope.selected_report = report;
            }

        }
    }])