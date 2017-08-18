angular.module( 'warrior-filters', [])
    .filter( 'getValueName', function() {
        return function( value ) {
            var values = new Array();
            values[1] = "importante";
            values[2] = "Normal";
            values[3] = "No importante";
            return values[value];
        };
    })
    .filter( 'dateFilter', function() {
        return function( date ) {
            var d = new Date( date );
            var month = new Array();
            month[0] = "Enero";
            month[1] = "Febrero";
            month[2] = "Marzo";
            month[3] = "Abril";
            month[4] = "Mayo";
            month[5] = "Junio";
            month[6] = "Julio";
            month[7] = "Agosto";
            month[8] = "Septiembre";
            month[9] = "Octubre";
            month[10] = "Noviembre";
            month[11] = "Diciembre";
            return ( d.getDate() + 1 ) + " " + month[d.getMonth()] + " " + d.getFullYear();
        };
    })
    .filter( 'dateTimeFilter', function() {
        return function( date ) {
            var d = new Date( date );
            var month = new Array();
            month[0] = "Enero";
            month[1] = "Febrero";
            month[2] = "Marzo";
            month[3] = "Abril";
            month[4] = "Mayo";
            month[5] = "Junio";
            month[6] = "Julio";
            month[7] = "Agosto";
            month[8] = "Septiembre";
            month[9] = "Octubre";
            month[10] = "Noviembre";
            month[11] = "Diciembre";
            return d.getDate() + " " + month[d.getMonth()] + " " + d.getFullYear() + " " + ( d.getHours() < 10 ? ("0" + d.getHours()) : d.getHours() ) + ":" + ( d.getMinutes() < 10 ? ( "0" + d.getMinutes() ) : d.getMinutes() );
        };
    })
    .directive('stringToNumber', function() {
        return {
            require: 'ngModel',
            link: function(scope, element, attrs, ngModel) {
                ngModel.$parsers.push(function(value) {
                    return '' + value;
                });
                ngModel.$formatters.push(function(value) {
                    return parseFloat(value);
                });
            }
        };
    });
