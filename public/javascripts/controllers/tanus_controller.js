yukonApp
    .factory('TanusRepository', ['$http', function ($http) {
        return ({
            ticketRefDocs: (ticket_ref, docu_type, ruc_emisor, date_docu, monto_total,moneda) => $http.get('/tanus/publicticketrefdocs/?ticket_ref=' + ticket_ref
                + '&docu=' + docu_type + '&ruc_emisor=' + ruc_emisor + '&date_docu=' + date_docu + '&monto_total=' + monto_total + '&moneda=' + moneda),
            ticketRefDocDetail: (move_id, loc_id) => $http.get('/tanus/ticketrefdetail/?move_id=' + move_id + '&loc=' + loc_id)
        })
    }])
    .factory('LocationRepository', ['$http', function ($http) {
        return ({
            getAll: (business_id) => $http.get('/tanus/locations/bybusiness/' + business_id)
        })
    }])
    .controller('ticketref-reports-controller', ['$scope',
        'TanusRepository',
        'LocationRepository',
        '$rootScope',
        '$stateParams',
        'uiGridConstants',
        'Excel',
        '$timeout',
        'growl',
        'CamaleonTools',
        function ($scope,
            TanusRepository,
            LocationRepository,
            $rootScope,
            $stateParams,
            uiGridConstants,
            Excel,
            $timeout,
            growl,
            CamaleonTools) {

            $scope.captcha_checked = true;


            $scope.progress_ban = false; // This is for the loanding simbols or whatever you want to activate
            $scope.locations_options = [] // Location options for the locations select
            $scope.business_id = $stateParams.id

            $("#docu_tye_select").select2({
                placeholder: "Selecciona Tipo de Documento ...",
                data: [
                    { text: "Factura", id: "01" },
                    { text: "Nota de Credito", id: "09" },
                    { text: "Boleta", id: "03" }
                ]
            });

            $('#docu_tye_select').val(0);


            $("#currency_select").select2({
                placeholder: "Selecciona Moneda ...",
                data: [
                    { text: "S/ PEN", id: "1" },
                    { text: "$  USD", id: "2" }
                ]
            });

            $('#currency_select').val(0);


            //  date picker cofnig
            //
            if ($("#date_docu").length) {
                $("#date_docu").datepicker({
                    autoclose: true,
                    format: 'yyyy-mm-dd'
                });
            }



            // generate qrcode
            if ($('#invoice_qrcode').length) {

            }
            // CorrectCaptcha 
            // callback to correct captcha response
            // @param response : a response object from recaptcha google api
            // @returns none

            $scope.correctCaptcha = function (response) {
                //console.log( response )
                $scope.captcha_checked = true;
                //console.log($scope.captcha_checked)

            }



            //
            // Get reports
            // Function that sets all the reports by location id and ticket reference
            // Validates there is a location selected and a string on the input
            //
            $scope.get_reports = function () {
                if ($scope.captcha_checked) {
                    $scope.progress_ban = true; // Activate loanding ...
                    // Format dates and get turn according of the selected index
                    //let loc_id = $('#locations_select').val() ? $('#locations_select').val() : 0;
                    let docu_type = $('#docu_tye_select').val() ? $('#docu_tye_select').val() : 0;

                    let ruc_emisor = $('#ruc_emisor').val() ? $('#ruc_emisor').val() : ''
                    let date_docu = $('#date_docu').val() ? $('#date_docu').val() : ''
                    let monto_total = $('#monto_total').val() ? $('#monto_total').val() : 0
                    let moneda_id = $('#currency_select').val() ? $('#currency_select').val() : ''
                    $scope.moneda_id = moneda_id
                    let ticket_ref_serie = $('#ticket_ref_serie').val() ? $('#ticket_ref_serie').val() : ''
                    let ticket_ref_correlativo = $('#ticket_ref_correlativo').val() ? $('#ticket_ref_correlativo').val() : ''
                    //let ticket_ref = $('#ticket_ref').val() ? $('#ticket_ref').val() : ''

                    if ( docu_type > 0 && ruc_emisor != '' && date_docu != '' && monto_total >'' && moneda_id != 0 && ticket_ref_serie != '' && ticket_ref_correlativo != '' ) {
                        let moneda = (moneda_id==1)? 'PEN':'USD'
                        
                        let first_serie = ticket_ref_serie.charAt(0)
                        let rest_rest = ("000" + ticket_ref_serie.substr(1)).substr(-3,3);
                        let serie = first_serie+rest_rest
                        let correlativo = ("00000000" + ticket_ref_correlativo).substr(-8,8);
                        let ticket_ref  = serie+'-'+correlativo
                        
                        TanusRepository.ticketRefDocs(ticket_ref, docu_type, ruc_emisor, date_docu, monto_total,moneda).success(function (response) {
                            if (!response.error) {
                                console.log(response.data)
                                if(response.length != 0){
                                    $scope.reports = response.data;

                                }else{
                                    growl.error("No se encontraron documentos; " + response.message, {});
                                }
                            } else {
                                growl.error("Hubo un error al procesar la solicitud: " + response.message, {});
                            } $scope.progress_ban = false;
                        }).error(function (error) {
                            growl.error("Hubo un error al procesar la solicitud: " + error, {});
                            $scope.progress_ban = false;
                        });
                    } else {
                        growl.error("Porfavor llena todos los campos de la forma.", {});
                        $scope.progress_ban = false;
                    }
                } else {
                    growl.error("Valida el reCAPTCHA primero.", {});

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
                    growl.warning("Porfavor selecciona un ticket de la lista.", {});
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
                                
                                doc.save(ticket.p01_rucventa + "-" + ticket.p01_tipocomp + "-" + ticket.p01_numcompleto + '.pdf');
                            }
                        });
                    } else {
                        growl.warning("No hay detalles en el ticket aun o el ticket esta vacio en la base de datos.", {});
                    }
                } else {
                    growl.warning("Porfavor selecciona un ticket de la lista.", {});
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
                        
                        
                        if($scope.moneda_id == 1){
                            $scope.selected_report.numToText = numeroALetras($scope.selected_report.total, {
                                plural: 'SOLES PERUANOS',
                                singular: 'SOL PERUANO',
                                centPlural: 'CENTAVOS',
                                centSingular: 'CENTAVO'
                            }) 

                        }else{
                            $scope.selected_report.numToText = numeroALetras($scope.selected_report.total, {
                                plural: 'DOLARES',
                                singular: 'DOLAR',
                                centPlural: 'CENTAVOS',
                                centSingular: 'CENTAVO'
                            }) 

                        }

                        

                        $scope.selected_report.numToText 
                        console.log($scope.selected_report.numToText)

                        $scope.$watch('qr_base_size', function () {
                            $('#invoice_qrcode').html('');
                            $('#invoice_qrcode').css({ 'width': $scope.qr_base_size / 2, 'height': $scope.qr_base_size / 2 }).qrcode({
                                render: 'canvas',
                                size: $scope.qr_base_size,
                                text: $scope.selected_report.qr_text
                            }).children('img').prop('title', $scope.selected_report.qr_text);
                        });
                    } else {
                        growl.error('Hubo un error al procesar la solicitud: ' + response.message, {})
                    }
                }).error(function (error) {
                    growl.error('Hubo un error al procesar la solicitud: ' + error, {})
                });
            }

        }])