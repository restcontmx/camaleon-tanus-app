yukonApp
    .factory('TanusRepository', ['$http', function ($http) {
        return ({
            ticketRefDocs: (ticket_ref, loc_id) => $http.get('/tanus/ticketrefdocs/?ticket_ref=' + ticket_ref + '&loc=' + loc_id),
            ticketRefDocDetail: (move_id, loc_id) => $http.get('/tanus/ticketrefdetail/?move_id=' + move_id + '&loc=' + loc_id)
        })
    }])
    .factory('LocationRepository', ['$http', function ($http) {
        return ({
            getAll: (business_id) => $http.get('/tanus/locations/bybusiness/' + business_id)
        })
    }])
    .controller('ticketref-reports-controller', [   '$scope',
                                                    'TanusRepository',
                                                    'LocationRepository',
                                                    '$rootScope',
                                                    '$stateParams',
                                                    'uiGridConstants',
                                                    'Excel',
                                                    '$timeout',
                                                    'growl',
                                                    'CamaleonTools',
                                                    function (  $scope,
                                                                TanusRepository,
                                                                LocationRepository,
                                                                $rootScope,
                                                                $stateParams,
                                                                uiGridConstants,
                                                                Excel,
                                                                $timeout,
                                                                growl,
                                                                CamaleonTools   ) {
        if( $stateParams.id ) {

            $scope.progress_ban = false; // This is for the loanding simbols or whatever you want to activate
            $scope.locations_options = [] // Location options for the locations select
            $scope.business_id = $stateParams.id

            // generate qrcode
            if ($('#invoice_qrcode').length) {

            }
            console.log($stateParams.id)
            // Get reports
            // Get all the locations
            // Then addthem to the locations select
            // Its on jquery, so be careful!
            LocationRepository.getAll($stateParams.id).success(function (response) {
                if (!response.error) {
                    $("#docu_tye_select").select2({
                        placeholder: "Select Document Type...",
                        data: [
                            { text: "Factura", id: 1 },
                            { text: "Nota de Credito", id: 2 },
                            { text: "Boleta", id: 3 }
                        ]
                    });
                    $('#docu_tye_select').val(0);
                    $scope.locations = response.data;
                    console.log( response )
                    $scope.locations.forEach(t => $scope.locations_options.push({ text: t.location_name, id: t.id }));
                    //console.log($scope.locations_options)
                    $("#locations_select").select2({
                        placeholder: "Select Location...",
                        data: $scope.locations_options
                    });
                    $('#locations_select').val(0);

                } else {
                    growl.error("There was an error; " + response.message, {});
                }
            }).error(function (error) {
                growl.error("There was an error; " + error, {});
            });
            //
            // Get reports
            // Function that sets all the reports by location id and ticket reference
            // Validates there is a location selected and a string on the input
            //
            $scope.get_reports = function () {
                $scope.progress_ban = true; // Activate loanding ...
                // Format dates and get turn according of the selected index
                let loc_id = $('#locations_select').val() ? $('#locations_select').val() : 0;
                let ticket_ref = $('#ticket_ref').val() ? $('#ticket_ref').val() : ''
                if (loc_id > 0 && ticket_ref != '') {
                    TanusRepository.ticketRefDocs(ticket_ref, loc_id).success(function (response) {
                        if (!response.error) {
                            $scope.reports = response.data;
                        } else {
                            growl.error("There was an error; " + response.message, {});
                        } $scope.progress_ban = false;
                    }).error(function (error) {
                        growl.error("There was an error; " + error, {});
                        $scope.progress_ban = false;
                    });
                } else {
                    growl.error("Please select a right location or fill the ticket input.", {});
                    $scope.progress_ban = false;
                }
            };
            // 
            // Print xml document
            // Will take the ticket validates existence then gets xml variable
            // Then just print it on a file with xml extension
            //
            $scope.print_xml_document = function (ticket) {
                if (ticket) {

                    CamaleonTools.dowload_file(ticket.p01_rucventa + "-" + ticket.p01_tipocomp + "-" + ticket.p01_numcompleto + ".xml", ticket.p01_xml)
                } else {
                    growl.warning("Please select a ticket on the list.", {});
                }
            }
            //
            // Print the pdf document
            // This will take a ticket, validates details and existence
            // Then will print the pdf with html2canvas and jsPDF libs
            //
            $scope.print_pdf_document = function (ticket) {
                // if there is a selected ticket
                if (ticket) {

                    // Validates there are details on the ticket
                    if (ticket.details.length > 0) {
                        console.log(ticket)
                        // This will get the detail table element
                        // Then will get the canvas once its rendered
                        html2canvas(document.getElementById('detail_table'), {
                            allowTaint: true,
                            onrendered: function (canvas) {
                                // Instance new document
                                var doc = new jsPDF();
                                // Adds the image on the document
                                // Then saves it
                                doc.addImage(canvas.toDataURL(), 'JPEG', 15, 25, 180, 0);
                                console.log(ticket)
                                doc.save(ticket.p01_rucventa + "-" + ticket.p01_tipocomp + "-" + ticket.p01_numcompleto + '.pdf');
                            }
                        });
                    } else {
                        growl.warning("There are not details on this ticket jet, wait or the ticket is empty on the DB.", {});
                    }
                } else {
                    growl.warning("Please select a ticket on the list.", {});
                }
            }
            //
            // select ticket 
            // this will set the selected ticket 
            // Then will get all the ticket details
            //
            $scope.select_ticket = function (report) {
                // Gets the details
                TanusRepository.ticketRefDocDetail(report.move_id, report.location).success(function (response) {
                    if (!response.error) {
                        // Sets the ticket
                        $scope.selected_report = report;


                        // Sets an empty ticket response on the selected ticket
                        // This will make the validation on the printing functions
                        $scope.selected_report.details = [];
                        // Set the details on the selected report
                        $scope.selected_report.details = response.data;
                        $scope.selected_report.details.forEach(d => {
                            switch (d.unit_id) {
                                case 1:
                                    // Each
                                    d.unit_des = "Each"
                                    break;
                                case 2:
                                    // Lb
                                    d.unit_des = "Lb"
                                    break;
                                case 3:
                                    // Kg
                                    d.unit_des = "Kg"
                                    break;
                                case 4:
                                    // unidad
                                    d.unit_des = "Unidad"
                                    break;
                                case 5:
                                    // Botella
                                    d.unit_des = "Botella"
                                    break;
                            }
                        })
                        console.log($scope.selected_report)
                        $scope.selected_report.total = $scope.selected_report.details.reduce((a, b) => (a + b.total), 0)
                        $scope.selected_report.total_igv = $scope.selected_report.details.reduce((a, b) => (a + (b.tx)), 0)
                        $scope.selected_report.total_rc = $scope.selected_report.details.reduce((a, b) => (a + (b.tx2)), 0)
                        $scope.selected_report.total_tax = $scope.selected_report.details.reduce((a, b) => (a + (b.tx + b.tx2 + b.tx3)), 0)
                        $scope.selected_report.sub_total = $scope.selected_report.total - $scope.selected_report.total_tax;
                        $scope.selected_report.total_discount = $scope.selected_report.details.reduce((a, b) => {
                            if (b.discount_code) {
                                return a + (b.qty * (b.move_reg_price - b.pprice))
                            } else {

                                return a + 0
                            }

                        }, 0);

                        $scope.$watch('qr_base_size', function () {
                            //var child = document.getElementById("canvas");
                            //$('#invoice_qrcode').removeChild(child);         
                            $('#invoice_qrcode').css({ 'width': $scope.qr_base_size / 2, 'height': $scope.qr_base_size / 2 }).qrcode({
                                render: 'canvas',
                                size: $scope.qr_base_size,
                                text: $scope.selected_report.qr_text
                            }).children('img').prop('title', $scope.selected_report.qr_text);
                        });
                    } else {
                        growl.error('There was an error; ' + response.message, {})
                    }
                }).error(function (error) {
                    growl.error('There was an error; ' + error, {})
                });
            }
        }
    }])