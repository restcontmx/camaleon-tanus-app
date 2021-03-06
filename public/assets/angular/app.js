/*
 *   yukon admin angular app.js
 *   author: tzd-themes
 *
 * */

"use strict";
var yukonApp = angular.module('yukonApp', [ 'ui.router', 
                                            'ngRoute', 
                                            'ngAnimate', 
                                            'ui.load', 
                                            'ngAria',
                                            'ngSanitize', 
                                            'ngCookies', 
                                            'ui.bootstrap', 
                                            'ncy-angular-breadcrumb', 
                                            'ngRetina', 
                                            'angular-growl', 
                                            'NgSwitchery', 
                                            'textAngular', 
                                            'crud-service', 
                                            'log-service',
                                            'vcRecaptcha',
                                            'ui.grid',
                                            'ui.grid.pagination',
                                            'ui.grid.selection',
                                            'ui.grid.treeView' ]);

/* Run Block */
yukonApp.run(
    [ '$rootScope', '$state', '$stateParams',
        function ($rootScope, $state, $stateParams ) {

            $rootScope.$state = $state;
            $rootScope.$stateParams = $stateParams;

            $rootScope.$on('$stateChangeSuccess', function () {
                $("html, body").animate({ scrollTop: 0 }, 200);
                // fastclick (eliminate the 300ms delay between a physical tap and the firing of a click event on mobile browsers)
                FastClick.attach(document.body);
            });

            $rootScope.$on('$stateChangeStart', function () {
                // remove datatables fixedHeader from DOM
                if($(".FixedHeader_Cloned").length) {
                    $(".FixedHeader_Cloned").remove();
                }
                // remove daterangepicker element from DOM
                if($(".daterangepicker").length) {
                    $(".daterangepicker").remove();
                }
                // remove autosize element from DOM
                if($("#autosizejs").length) {
                    $("#autosizejs").remove();
                }
                // remove select2-hidden-accessible
                if($(".select2-hidden-accessible").length) {
                    $('.select2-hidden-accessible').remove();
                }
            });

            $rootScope.isTouchDevice = !!('ontouchstart' in window);
            $rootScope.isHighDensity = function () {
                return ((window.matchMedia && (window.matchMedia('only screen and (min-resolution: 124dpi), only screen and (min-resolution: 1.3dppx), only screen and (min-resolution: 48.8dpcm)').matches || window.matchMedia('only screen and (-webkit-min-device-pixel-ratio: 1.3), only screen and (-o-min-device-pixel-ratio: 2.6/2), only screen and (min--moz-device-pixel-ratio: 1.3), only screen and (min-device-pixel-ratio: 1.3)').matches)) || (window.devicePixelRatio && window.devicePixelRatio > 1.3));
            };

            $rootScope.appVer = 'v0.1';

            // main menu
            $rootScope.sideMenuAct = true;
            $rootScope.topMenuAct = !$rootScope.sideMenuAct;
            
        }
    ]
);

yukonApp
   
    /* bootstrap-ui tooltips */
    .config(function($tooltipProvider ) {
        $tooltipProvider.options({
            appendToBody: true
        });
    })
    .config([
        'growlProvider',
        '$httpProvider',
        function (growlProvider, $httpProvider) {
            growlProvider.globalReversedOrder(true);
            growlProvider.globalDisableIcons(true);
            growlProvider.globalTimeToLive(5000);
            $httpProvider.interceptors.push(growlProvider.serverMessagesInterceptor);
        }
    ]);

/* filters */
yukonApp
    // https://github.com/angular-ui/ui-utils
    .filter('unique', ['$parse', function ($parse) {
        return function (items, filterOn) {
            if (filterOn === false) {
                return items;
            }
            if ((filterOn || angular.isUndefined(filterOn)) && angular.isArray(items)) {
                var newItems = [],
                    get = angular.isString(filterOn) ? $parse(filterOn) : function (item) {
                        return item;
                    };
                var extractValueToCompare = function (item) {
                    return angular.isObject(item) ? get(item) : item;
                };
                angular.forEach(items, function (item) {
                    var isDuplicate = false;
                    for (var i = 0; i < newItems.length; i++) {
                        if (angular.equals(extractValueToCompare(newItems[i]), extractValueToCompare(item))) {
                            isDuplicate = true;
                            break;
                        }
                    }
                    if (!isDuplicate) {
                        newItems.push(item);
                    }
                });
                items = newItems;
            }
            return items;
        };
    }]);