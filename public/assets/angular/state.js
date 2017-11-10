/* States */
yukonApp
    .config(['$stateProvider', '$urlRouterProvider',
        function ($stateProvider, $urlRouterProvider) {

            // Use $urlRouterProvider to configure any redirects (when) and invalid urls (otherwise).
            $urlRouterProvider
                .when('/home', '/')
                .otherwise('/');

            // State Configurations
            $stateProvider
                // Login Page
                .state("login", {
                    page_title: 'Camaleon Reports - Login',
                    url: "/login",
                    templateUrl: 'views/login.html',
                    controller: 'auth-controller'
                })
                // Login Page
                .state("login2", {
                    page_title: 'Yukon Admin - Login Page 2',
                    url: "/login2",
                    templateUrl: 'views/login2.html'
                })
                // Errors
                .state("error", {
                    url: "/error",
                    abstract: true,
                    template: '<div ui-view autoscroll="false" class="mainView-animate"></div>'
                })
                // Errors > 404
                .state("error.404", {
                    page_title: 'Yukon Admin - Error 404',
                    url: "/404",
                    templateUrl: 'views/error.404.html'
                })

                // Authenticated
                .state("auth", {
                    abstract: true,
                    ncyBreadcrumb: {
                        skip: true
                    },
                    // this state url
                    url: "",
                    templateUrl: 'views/authenticated.html'
                })
                // Dashboard
                .state("auth.home", {
                    // this state page title
                    page_title: 'Camaleon Reports - Dashboard',
                    // this state url
                    url: "/",
                    templateUrl: 'views/dashboard.html',
                    // load state specific js/css
                    resolve: {
                        files: [
                            'uiLoad',
                            function (uiLoad) {
                                return uiLoad.load([
                                    // c3 charts
                                    'assets/lib/d3/d3.min.js',
                                    'assets/lib/c3/c3.min.js',
                                    // vector maps
                                    'assets/lib/jvectormap/jquery-jvectormap-1.2.2.min.js',
                                    'assets/lib/jvectormap/maps/jquery-jvectormap-world-mill-en.js',
                                    // countUp animation
                                    'assets/js/countUp.min.js',
                                    // easePie chart
                                    'assets/lib/easy-pie-chart/dist/jquery.easypiechart.min.js',
                                    // dashboard functions
                                    'assets/angular/states_jquery/yukon_dashboard.min.js',
                                    // datepicker
                                    'assets/lib/bootstrap-datepicker/css/datepicker3.css',
                                    'assets/lib/bootstrap-datepicker/js/bootstrap-datepicker.js',
                                    // date range picker
                                    'assets/lib/bootstrap-daterangepicker/daterangepicker-bs3.css',
                                    'assets/lib/bootstrap-daterangepicker/daterangepicker.js'
                                ]);
                            }
                        ]
                    },
                    controller: 'dashboardCtrl',
                    ncyBreadcrumb: {
                        label: 'Home'
                    }
                })
                // Forms (parent state)
                .state('auth.forms', {
                    // With abstract set to true, that means this state can not be explicitly activated.
                    abstract: true,
                    url: '/forms',
                    template: '<div ui-view autoscroll="false" class="mainView-animate"></div>',
                    ncyBreadcrumb: {
                        label: 'Forms'
                    }
                })
                // Forms > Regular Elements
                .state('auth.forms.regular_elements', {
                    page_title: 'Yukon Admin - Forms Regular Elements',
                    // this url is appended to parent url (/forms/regular_elements)
                    url: '/regular_elements',
                    templateUrl: 'views/forms.regular_elements.html',
                    ncyBreadcrumb: {
                        label: 'Regular Elements'
                    }
                })
                // Forms > Extended Elements
                .state('auth.forms.extended_elements', {
                    page_title: 'Yukon Admin - Forms Extended Elements',
                    url: '/extended_elements',
                    templateUrl: 'views/forms.extended_elements.html',
                    resolve: {
                        randomElementsList: function ($http) {
                            return $http({ method: 'GET', url: 'data/random_elements_500.json' })
                                .then(function (data) {
                                    return data.data;
                                });
                        },
                        countriesList: function ($http) {
                            return $http({ method: 'GET', url: 'data/countries_codes.json' })
                                .then(function (data) {
                                    return data.data;
                                });
                        },
                        files: [
                            'uiLoad',
                            function (uiLoad) {
                                return uiLoad.load([
                                    // select2
                                    'assets/lib/select2/select2.css',
                                    'assets/lib/select2/select2.min.js',
                                    // datepicker
                                    'assets/lib/bootstrap-datepicker/css/datepicker3.css',
                                    'assets/lib/bootstrap-datepicker/js/bootstrap-datepicker.js',
                                    // date range picker
                                    'assets/lib/bootstrap-daterangepicker/daterangepicker-bs3.css',
                                    'assets/lib/bootstrap-daterangepicker/daterangepicker.js',
                                    // rangeSlider
                                    'assets/lib/ion.rangeSlider/css/ion.rangeSlider.css',
                                    'assets/lib/ion.rangeSlider/css/ion.rangeSlider.skinFlat.css',
                                    'assets/lib/ion.rangeSlider/js/ion-rangeSlider/ion.rangeSlider.min.js',
                                    // autosize
                                    'assets/lib/autosize/jquery.autosize.min.js',
                                    // inputmask
                                    'assets/lib/jquery.inputmask/jquery.inputmask.bundle.min.js',
                                    // maxlength for textareas
                                    'assets/lib/stopVerbosity/stopVerbosity.min.js',
                                    // uplaoder
                                    'assets/lib/plupload/js/jquery.plupload.queue/css/jquery.plupload.queue.css',
                                    'assets/lib/plupload/js/plupload.full.min.js',
                                    'assets/lib/plupload/js/jquery.plupload.queue/jquery.plupload.queue.min.js',
                                    // wysiwg editor
                                    'assets/lib/ckeditor/ckeditor.js',
                                    'assets/lib/ckeditor/adapters/jquery.js',
                                    // 2col multiselect
                                    'assets/lib/lou-multi-select/js/jquery.multi-select.js',
                                    // quicksearch
                                    'assets/lib/quicksearch/jquery.quicksearch.min.js',
                                    // clock picker
                                    'assets/lib/clock-picker/bootstrap-clockpicker.min.js',
                                    // chained selects
                                    'assets/lib/jquery_chained/jquery.chained.min.js',
                                    // show/hide passwords
                                    'assets/lib/hideShowPassword/hideShowPassword.min.js',
                                    // password strength meter
                                    'assets/lib/jquery.pwstrength.bootstrap/pwstrength-bootstrap-1.2.2.min.js',
                                    // icheck
                                    'assets/lib/iCheck/skins/minimal/blue.css',
                                    'assets/lib/iCheck/icheck.min.js',
                                    // selectize.js
                                    'assets/lib/selectize-js/css/selectize.css',
                                    'assets/lib/selectize-js/js/standalone/selectize.min.js',
                                    // forms extended elements
                                    'assets/angular/states_jquery/yukon_extended_elements.min.js'
                                ]);
                            }
                        ]
                    },
                    controller: 'formExtendedCtrl',
                    ncyBreadcrumb: {
                        label: 'Extended Elements'
                    }
                })
                // Forms > Gridform
                .state('auth.forms.gridform', {
                    page_title: 'Yukon Admin - Gridform',
                    url: '/gridform',
                    templateUrl: 'views/forms.gridform.html',
                    resolve: {
                        files: [
                            'uiLoad',
                            function (uiLoad) {
                                return uiLoad.load([
                                    // gridforms
                                    'assets/lib/gridforms/gf-forms.min.css',
                                    'assets/lib/gridforms/gf-forms.min.js'
                                ])
                            }
                        ]
                    },
                    ncyBreadcrumb: {
                        label: 'Gridform'
                    }
                })
                // Forms > Validation
                .state('auth.forms.validation', {
                    page_title: 'Yukon Admin - Form Validation',
                    url: '/validation',
                    templateUrl: 'views/forms.validation.html',
                    resolve: {
                        files: [
                            'uiLoad',
                            function (uiLoad) {
                                return uiLoad.load([
                                    // validation
                                    'assets/js/parsley.config.js',
                                    'assets/lib/parsley/dist/parsley.min.js',
                                    // select2
                                    'assets/lib/select2/select2.css',
                                    'assets/lib/select2/select2.min.js',
                                    // wysiwg editor
                                    'assets/lib/ckeditor/ckeditor.js',
                                    'assets/lib/ckeditor/adapters/jquery.js',
                                    // form validation functions
                                    'assets/angular/states_jquery/yukon_validation.min.js'
                                ])
                            }
                        ]
                    },
                    controller: 'formValidationCtrl',
                    ncyBreadcrumb: {
                        label: 'Validation'
                    }
                })
                // Forms > Wizard
                .state('auth.forms.wizard', {
                    page_title: 'Yukon Admin - Wizard',
                    url: '/wizard',
                    templateUrl: 'views/forms.wizard.html',
                    resolve: {
                        files: [
                            'uiLoad',
                            function (uiLoad) {
                                return uiLoad.load([
                                    //  prism highlight
                                    'assets/lib/prism/prism_default.css',
                                    'assets/lib/prism/line_numbers.css',
                                    'assets/lib/prism/prism.min.js',
                                    // select2
                                    'assets/lib/select2/select2.css',
                                    'assets/lib/select2/select2.min.js',
                                    // jquery steps
                                    'assets/js/jquery.steps.custom.min.js',
                                    // validation
                                    'assets/js/parsley.config.js',
                                    'assets/lib/parsley/dist/parsley.min.js',
                                    // form wizard functions
                                    'assets/angular/states_jquery/yukon_wizard.min.js'
                                ])
                            }
                        ]
                    },
                    controller: 'formWizardCtrl',
                    ncyBreadcrumb: {
                        label: 'Wizard'
                    }
                })
                // Pages (parent state)
                .state('auth.pages', {
                    abstract: true,
                    template: '<div ui-view autoscroll="false" class="mainView-animate"></div>',
                    ncyBreadcrumb: {
                        label: 'Pages'
                    }
                })
                // Pages > Chat
                .state('auth.pages.chat', {
                    page_title: 'Yukon Admin - Chat',
                    url: '/chat',
                    templateUrl: 'views/pages.chat.html',
                    resolve: {
                        files: [
                            'uiLoad',
                            function (uiLoad) {
                                return uiLoad.load([
                                    //  chat functions
                                    'assets/angular/states_jquery/yukon_chat.min.js'
                                ])
                            }
                        ]
                    },
                    controller: 'chatCtrl',
                    ncyBreadcrumb: {
                        label: 'Chat'
                    }
                })
                // Pages > Contact List
                .state('auth.pages.contactList', {
                    page_title: 'Yukon Admin - Contact List',
                    ncyBreadcrumb: {
                        label: 'Contact List'
                    },
                    url: '/contact_list',
                    templateUrl: 'views/pages.contact_list.html',
                    resolve: {
                        contactList: function ($http) {
                            return $http({ method: 'GET', url: 'data/contact_list.json' })
                                .then(function (data) {
                                    return data.data;
                                });
                        },
                        files: [
                            'uiLoad',
                            function (uiLoad) {
                                return uiLoad.load([
                                    // shuffle.js
                                    'assets/lib/shuffle/jquery.shuffle.modernizr.min.js'
                                ])
                            }
                        ]
                    },
                    controller: 'contactListCtrl'
                })
                // Pages > Faq/Help
                .state('auth.pages.helpFaq', {
                    page_title: 'Yukon Admin - Help/Faq',
                    abstract: true,
                    ncyBreadcrumb: {
                        label: 'Help/Faq'
                    },
                    url: '/help_faq',
                    templateUrl: 'views/pages.helpFaq.html',
                    controller: 'helpFaqCtrl'
                })
                // Pages > Faq/Help > Categories
                .state('auth.pages.helpFaq.all', {
                    page_title: 'Yukon Admin - Help/Faq (All)',
                    ncyBreadcrumb: {
                        label: 'All',
                        parent: 'auth.pages.helpFaq'
                    },
                    url: '',
                    templateUrl: 'views/pages.helpFaq.items.html'
                })
                .state('auth.pages.helpFaq.customerService', {
                    page_title: 'Yukon Admin - Help/Faq (Customer Service)',
                    ncyBreadcrumb: {
                        label: 'Customer Service'
                    },
                    url: '/customer_service',
                    templateUrl: 'views/pages.helpFaq.items.html'
                })
                .state('auth.pages.helpFaq.configurationDataManagement', {
                    page_title: 'Yukon Admin - Help/Faq (Configuration & Data Management)',
                    ncyBreadcrumb: {
                        label: 'Configuration & Data Management'
                    },
                    url: '/configuration_data_management',
                    templateUrl: 'views/pages.helpFaq.items.html'
                })
                .state('auth.pages.helpFaq.mobile', {
                    page_title: 'Yukon Admin - Help/Faq (Mobile)',
                    ncyBreadcrumb: {
                        label: 'Mobile'
                    },
                    url: '/mobile',
                    templateUrl: 'views/pages.helpFaq.items.html'
                })
                .state('auth.pages.helpFaq.reportsDashboard', {
                    page_title: 'Yukon Admin - Help/Faq (Reports & Dashboards)',
                    ncyBreadcrumb: {
                        label: 'Reports & Dashboards'
                    },
                    url: '/reports_dashboard',
                    templateUrl: 'views/pages.helpFaq.items.html'
                })
                .state('auth.pages.helpFaq.salesMarketing', {
                    page_title: 'Yukon Admin - Help/Faq (Sales & Marketing)',
                    ncyBreadcrumb: {
                        label: 'Sales & Marketing'
                    },
                    url: '/sales_marketing',
                    templateUrl: 'views/pages.helpFaq.items.html'
                })
                // Pages > Invoices
                .state('auth.pages.invoices', {
                    page_title: 'Yukon Admin - Invoices',
                    ncyBreadcrumb: {
                        label: 'Invoices'
                    },
                    url: '/invoices',
                    templateUrl: 'views/pages.invoices.html',
                    resolve: {
                        files: [
                            'uiLoad',
                            function (uiLoad) {
                                return uiLoad.load([
                                    //  qrCode
                                    'assets/lib/jquery-qrcode-0.10.1/jquery.qrcode-0.10.1.min.js'
                                ])
                            }
                        ]
                    },
                    controller: 'invoicesCtrl'
                })
                // Pages > Mail
                .state('auth.pages.mail', {
                    ncyBreadcrumb: {
                        label: 'Mailbox'
                    },
                    abstract: true,
                    url: '/mail',
                    templateUrl: 'views/pages.mail.html',
                    resolve: {
                        files: [
                            'uiLoad',
                            function (uiLoad) {
                                return uiLoad.load([
                                    //  footable
                                    'assets/lib/footable/css/footable.core.min.css',
                                    'assets/lib/footable/footable.min.js',
                                    'assets/lib/footable/footable.paginate.min.js',
                                    'assets/lib/footable/footable.filter.min.js'
                                ])
                            }
                        ]
                    },
                    controller: 'mailboxCtrl'
                })
                // Pages > Mail > Inbox
                .state('auth.pages.mail.inbox', {
                    page_title: 'Yukon Admin - Inbox',
                    ncyBreadcrumb: {
                        label: 'Inbox'
                    },
                    url: '',
                    templateUrl: 'views/pages.mail.messages.html'
                })
                // Pages > Mail > Sent
                .state('auth.pages.mail.sent', {
                    page_title: 'Yukon Admin - Inbox',
                    ncyBreadcrumb: {
                        label: 'Sent'
                    },
                    url: '/sent',
                    templateUrl: 'views/pages.mail.messages.html'
                })
                // Pages > Mail > Spam
                .state('auth.pages.mail.spam', {
                    page_title: 'Yukon Admin - Inbox',
                    ncyBreadcrumb: {
                        label: 'Spam'
                    },
                    url: '/spam',
                    templateUrl: 'views/pages.mail.messages.html'
                })
                // Pages > Mail > Drafts
                .state('auth.pages.mail.drafts', {
                    page_title: 'Yukon Admin - Drafts',
                    ncyBreadcrumb: {
                        label: 'Drafts'
                    },
                    url: '/drafts',
                    templateUrl: 'views/pages.mail.messages.html'
                })
                // Pages > Mail > Spam
                .state('auth.pages.mail.trash', {
                    page_title: 'Yukon Admin - Trash',
                    ncyBreadcrumb: {
                        label: 'Trash'
                    },
                    url: '/trash',
                    templateUrl: 'views/pages.mail.messages.html'
                })
                // Pages > Mail > Details
                .state('auth.pages.mail.details', {
                    page_title: 'Yukon Admin - Message',
                    ncyBreadcrumb: {
                        label: 'Message'
                    },
                    url: '/details/{messageId:[0-9]{1,4}}',
                    templateUrl: 'views/pages.mail.details.html',
                    resolve: {
                        messageDetails: function ($http) {
                            return $http({ method: 'GET', url: 'data/mailbox.json' })
                                .then(function (data) {
                                    var messages = [],
                                        dataArr = data.data,
                                        dataLen = dataArr.length;
                                    for (var i = 0; i < dataLen; i++) {
                                        messages.push.apply(messages, dataArr[i]['messages']);
                                    }
                                    return messages;
                                });
                        }
                    },
                    controller: 'mailDetailsCtrl'
                })
                // Pages > Mail > Compose
                .state('auth.pages.mail.compose', {
                    page_title: 'Yukon Admin - Compose Mail',
                    ncyBreadcrumb: {
                        label: 'Compose'
                    },
                    url: '/compose',
                    templateUrl: 'views/pages.mail.compose.html'
                })
                // Pages > Search
                .state('auth.pages.search', {
                    page_title: 'Yukon Admin - Search Page',
                    ncyBreadcrumb: {
                        label: 'Search Page'
                    },
                    url: '/search',
                    templateUrl: 'views/pages.search.html'
                })
                // Pages > User List
                .state('auth.pages.userList', {
                    page_title: 'Yukon Admin - User List',
                    ncyBreadcrumb: {
                        label: 'User List'
                    },
                    url: '/user_list',
                    templateUrl: 'views/pages.user_list.html',
                    resolve: {
                        userLists: function ($http) {
                            return $http({ method: 'GET', url: 'data/user_list.json' })
                                .then(function (data) {
                                    return data.data;
                                });
                        },
                        files: [
                            'uiLoad',
                            function (uiLoad) {
                                return uiLoad.load([
                                    //  iOS list
                                    'assets/lib/jquery-listnav/dist/js/jquery-listnav-2.4.0.min.js'
                                ])
                            }
                        ]
                    },
                    controller: 'userListCtrl'
                })
                // Pages > User Profile
                .state('auth.pages.userProfile', {
                    page_title: 'Camelon Reports - User Profile',
                    ncyBreadcrumb: {
                        label: 'User Profile'
                    },
                    url: '/user_profile',
                    templateUrl: 'views/profile.html',
                    // load state specific js/css
                    resolve: {
                        files: [
                            'uiLoad',
                            function (uiLoad) {
                                return uiLoad.load([
                                ]);
                            }
                        ]
                    },
                    controller: 'userProfileCtrl'
                })
                // Pages > User Profile 2
                .state('auth.pages.userProfile2', {
                    page_title: 'Yukon Admin - User Profile 2',
                    ncyBreadcrumb: {
                        label: 'User Profile 2'
                    },
                    url: '/user_profile2',
                    templateUrl: 'views/pages.user_profile2.html',
                    // load state specific js/css
                    resolve: {
                        files: [
                            'uiLoad',
                            function (uiLoad) {
                                return uiLoad.load([
                                    // easePie chart
                                    'assets/lib/easy-pie-chart/dist/jquery.easypiechart.min.js',
                                    // dashboard functions
                                    'assets/angular/states_jquery/yukon_user_profile.min.js'
                                ]);
                            }
                        ]
                    },
                    controller: 'userProfile2Ctrl'
                })
                // Components
                .state('auth.components', {
                    abstract: true,
                    url: '/components',
                    template: '<div ui-view autoscroll="false" class="mainView-animate"></div>',
                    ncyBreadcrumb: {
                        label: 'Components'
                    }
                })
                // Components > Gallery
                .state('auth.components.gallery', {
                    page_title: 'Yukon Admin - Gallery',
                    ncyBreadcrumb: {
                        label: 'Gallery'
                    },
                    url: '/gallery',
                    templateUrl: 'views/components.gallery.html',
                    resolve: {
                        files: [
                            'uiLoad',
                            function (uiLoad) {
                                return uiLoad.load([
                                    // magnific popup
                                    'assets/lib/magnific-popup/magnific-popup.css',
                                    'assets/lib/magnific-popup/jquery.magnific-popup.min.js'
                                ]);
                            }
                        ],
                        images: function ($http) {
                            return $http({
                                method: 'GET', url: 'data/gallery_images.json'
                            })
                                .then(function (data) {
                                    return data.data;
                                });
                        }
                    },
                    controller: 'galleryCtrl'
                })
                // Components > Grid
                .state('auth.components.grid', {
                    page_title: 'Yukon Admin - Grid',
                    ncyBreadcrumb: {
                        label: 'Grid'
                    },
                    url: '/grid',
                    templateUrl: 'views/components.grid.html'
                })
                // Components > Icons
                .state('auth.components.icons', {
                    page_title: 'Yukon Admin - Icons',
                    ncyBreadcrumb: {
                        label: 'Icons'
                    },
                    url: '/icons',
                    templateUrl: 'views/components.icons.html',
                    resolve: {
                        icons: function ($http) {
                            return $http({ method: 'GET', url: 'data/icons.json' })
                                .then(function (data) {
                                    return data.data;
                                });
                        }
                    },
                    controller: function ($scope, $timeout, icons) {
                        $scope.icons = icons;
                    }
                })
                // Components > Notifications
                .state('auth.components.notificationsPopups', {
                    page_title: 'Yukon Admin - Notifications/Popups',
                    ncyBreadcrumb: {
                        label: 'Notifications/Popups'
                    },
                    url: '/notifications',
                    templateUrl: 'views/components.notifications_popups.html',
                    resolve: {
                        files: [
                            'uiLoad',
                            function (uiLoad) {
                                return uiLoad.load([
                                    // jBox
                                    'assets/lib/jBox-0.3.0/Source/jBox.css',
                                    'assets/lib/jBox-0.3.0/Source/themes/NoticeBorder.css',
                                    'assets/lib/jBox-0.3.0/Source/jBox.min.js'
                                ]);
                            }
                        ]
                    },
                    controller: 'notificationsPopupsCtrl'
                })
                // Components > Bootstrap UI
                .state('auth.components.bootstrapUI', {
                    page_title: 'Yukon Admin - UI Bootstrap',
                    ncyBreadcrumb: {
                        label: 'UI Bootstrap'
                    },
                    url: '/ui_bootstrap',
                    templateUrl: 'views/components.bootstrapUI.html',
                    controller: 'bootstrapUICtrl'
                })
                // Components > Typography
                .state('auth.components.typography', {
                    page_title: 'Yukon Admin - Typography',
                    ncyBreadcrumb: {
                        label: 'Typography'
                    },
                    url: '/typography',
                    templateUrl: 'views/components.typography.html'
                })
                // Plugins > calendar
                .state('auth.plugins', {
                    abstract: true,
                    url: '/plugins',
                    template: '<div ui-view autoscroll="false" class="mainView-animate"></div>',
                    ncyBreadcrumb: {
                        label: 'Plugins'
                    }
                })
                // Plugins > Ace Editor
                .state('auth.plugins.aceEditor', {
                    page_title: 'Yukon Admin - Ace Editor',
                    ncyBreadcrumb: {
                        label: 'Ace Editor'
                    },
                    url: '/ace_editor',
                    templateUrl: 'views/plugins.ace_editor.html',
                    resolve: {
                        files: [
                            'uiLoad',
                            function (uiLoad) {
                                return uiLoad.load([
                                    // Ace Editor
                                    'assets/lib/ace/src-min-noconflict/ace.js'
                                ]);
                            }
                        ]
                    },
                    controller: 'aceEditorCtrl'
                })
                // Plugins > calendar
                .state('auth.plugins.calendar', {
                    abstract: true,
                    url: '/calendar',
                    resolve: {
                        files: [
                            'uiLoad',
                            function (uiLoad) {
                                return uiLoad.load([
                                    // full calendar
                                    'assets/lib/fullcalendar/lib/jquery-ui.custom.min.js',
                                    'assets/lib/fullcalendar/fullcalendar.css',
                                    'assets/lib/fullcalendar/fullcalendar.min.js',
                                    'assets/lib/fullcalendar/gcal.js'
                                ]);
                            }
                        ]
                    },
                    templateUrl: 'views/plugins.calendar.html',
                    ncyBreadcrumb: {
                        label: 'Calendar'
                    }
                })
                // Plugins > calendar > basic
                .state('auth.plugins.calendar.basic', {
                    page_title: 'Yukon Admin - Basic Calendar',
                    ncyBreadcrumb: {
                        label: 'Basic Calendar'
                    },
                    url: '',
                    template: '<div class="row"> <div class="col-md-12"> <div id="calendar"></div> </div> </div>',
                    controller: 'calendarBasicCtrl'
                })
                // Plugins > calendar > lunar phases
                .state('auth.plugins.calendar.lunar', {
                    page_title: 'Yukon Admin - Phases of the Moon',
                    ncyBreadcrumb: {
                        label: 'Phases of the Moon'
                    },
                    url: '/lunar_phases',
                    template: '<div class="row"> <div class="col-md-12"> <div id="calendar_phases"></div> </div> </div>',
                    controller: 'calendarLunarCtrl'
                })
                // Plugins > charts
                .state('auth.plugins.charts', {
                    page_title: 'Yukon Admin - Charts',
                    ncyBreadcrumb: {
                        label: 'Charts'
                    },
                    url: '/charts',
                    templateUrl: 'views/plugins.charts.html',
                    resolve: {
                        files: [
                            'uiLoad',
                            function (uiLoad) {
                                return uiLoad.load([
                                    // c3 charts
                                    'assets/lib/d3/d3.min.js',
                                    'assets/lib/c3/c3.min.js'
                                ]);
                            }
                        ]
                    },
                    controller: 'chartsCtrl'
                })
                // Plugins > gantt chart
                .state('auth.plugins.ganttChart', {
                    page_title: 'Yukon Admin - Gantt Chart',
                    ncyBreadcrumb: {
                        label: 'Gantt Chart'
                    },
                    url: '/gantt_chart',
                    templateUrl: 'views/plugins.gantt_chart.html',
                    resolve: {
                        files: [
                            'uiLoad',
                            function (uiLoad) {
                                return uiLoad.load([
                                    // gantt chart
                                    'assets/lib/jquery.ganttView/jquery-ui.min.js',
                                    'assets/lib/jquery.ganttView/date.js',
                                    'assets/lib/jquery.ganttView/jquery.ganttView.js'
                                ]);
                            }
                        ]
                    },
                    controller: 'ganttChartCtrl'
                })
                // Plugins > google maps
                .state('auth.plugins.googleMaps', {
                    page_title: 'Yukon Admin - Google Maps',
                    ncyBreadcrumb: {
                        label: 'Google Maps '
                    },
                    url: '/google_maps',
                    templateUrl: 'views/plugins.gmaps.html',
                    resolve: {
                        files: [
                            'uiLoad',
                            function (uiLoad) {
                                return uiLoad.load([
                                    // gmaps
                                    'assets/lib/gmaps/gmaps.js'
                                ]);
                            }
                        ]
                    },
                    controller: 'gmapsCtrl'
                })
                // Plugins > tables
                .state('auth.plugins.tables', {
                    abstract: true,
                    url: '/tables',
                    templateUrl: 'views/plugins.tables.html',  
                    ncyBreadcrumb: {
                        label: 'Tables'
                    }
                })
                .state( 'auth.support', {
                    abstract : true,
                    url : 'Support',
                    template : '<div ui-view autoscroll="false" class="mainView-animate"></div>',
                    ncyBreadcrumb : {
                        label : 'Support'
                    }
                })
                // Items
                .state('auth.support.items', {
                    abstract: true,
                    url: '/items',
                    templateUrl: 'views/support/items/mainview.items.html',
                    ncyBreadcrumb: {
                        label: 'Items'
                    }
                })
                .state('auth.support.items.activelogs', {
                    page_title: 'Items Active Logs',
                    ncyBreadcrumb: {
                        label: 'Items Acive Logs'
                    },
                    url: '/logs/active',
                    templateUrl: 'views/support/items/logs.active.html',
                    resolve: {
                        files: [
                            'uiLoad',
                            function (uiLoad) {
                                return uiLoad.load([
                                    // jBox
                                    'assets/lib/jBox-0.3.0/Source/jBox.css',
                                    'assets/lib/jBox-0.3.0/Source/themes/NoticeBorder.css',
                                    'assets/lib/jBox-0.3.0/Source/jBox.min.js'
                                ]);
                            }
                        ]
                    },
                    controller: 'item-logs-controller'
                })
                .state('auth.support.items.stocks', {
                    page_title: 'Items Stock',
                    ncyBreadcrumb: {
                        label: 'Items Stock'
                    },
                    url: '/stock',
                    templateUrl: 'views/support/items/stock.html',
                    resolve: {
                        files: [
                            'uiLoad',
                            function (uiLoad) {
                                return uiLoad.load([
                                ]);
                            }
                        ]
                    },
                    controller: 'item-stocks-controller'
                })
                .state('auth.support.items.inactivelogs', {
                    page_title: 'Items Inactive Logs',
                    ncyBreadcrumb: {
                        label: 'Items Inacive Logs'
                    },
                    url: '/logs/inactive',
                    templateUrl: 'views/support/items/logs.inactive.html',
                    resolve: {
                        files: [
                            'uiLoad',
                            function (uiLoad) {
                                return uiLoad.load([
                                    // jBox
                                    'assets/lib/jBox-0.3.0/Source/jBox.css',
                                    'assets/lib/jBox-0.3.0/Source/themes/NoticeBorder.css',
                                    'assets/lib/jBox-0.3.0/Source/jBox.min.js'
                                ]);
                            }
                        ]
                    },
                    controller: 'item-logs-controller'
                })
                .state('auth.support.items.edit', {
                    page_title: 'Edit ITEMS',
                    ncyBreadcrumb: {
                        label: 'Edit ITEMS'
                    },
                    url: '/edit',
                    templateUrl: 'views/support/items/edit.html',
                    resolve: {
                        files: [
                            'uiLoad',
                            function (uiLoad) {
                                return uiLoad.load([
                                    //  datatables
                                    'assets/lib/gridforms/gf-forms.min.css',
                                    'assets/lib/gridforms/gf-forms.min.js',
                                    'assets/lib/jBox-0.3.0/Source/jBox.css',
                                    'assets/lib/jBox-0.3.0/Source/themes/NoticeBorder.css',
                                    'assets/lib/jBox-0.3.0/Source/jBox.min.js'
                                ]);
                            }
                        ]
                    },
                    controller: 'item-controller'
                })
                .state( 'auth.reports', {
                    abstract : true,
                    url : 'reports',
                    template : '<div ui-view autoscroll="false" class="mainView-animate"></div>',
                    ncyBreadcrumb : {
                        label : 'Reports'
                    }
                })
                .state('auth.reports.categories', {
                    page_title: 'Reports - Categories',
                    url: '/categories',
                    templateUrl: 'views/reports/reports.categories.html',
                    resolve: {
                        files: [
                            'uiLoad',
                            function (uiLoad) {
                                return uiLoad.load([
                                    // c3 charts
                                    'assets/lib/d3/d3.min.js',
                                    'assets/lib/c3/c3.min.js',
                                    // select2
                                    'assets/lib/select2/select2.css',
                                    'assets/lib/select2/select2.min.js',
                                    // datepicker
                                    'assets/lib/bootstrap-datepicker/css/datepicker3.css',
                                    'assets/lib/bootstrap-datepicker/js/bootstrap-datepicker.js',
                                    // date range picker
                                    'assets/lib/bootstrap-daterangepicker/daterangepicker-bs3.css',
                                    'assets/lib/bootstrap-daterangepicker/daterangepicker.js',
                                    // rangeSlider
                                    'assets/lib/ion.rangeSlider/css/ion.rangeSlider.css',
                                    'assets/lib/ion.rangeSlider/css/ion.rangeSlider.skinFlat.css',
                                    'assets/lib/ion.rangeSlider/js/ion-rangeSlider/ion.rangeSlider.min.js',
                                    // autosize
                                    'assets/lib/autosize/jquery.autosize.min.js',
                                    // inputmask
                                    'assets/lib/jquery.inputmask/jquery.inputmask.bundle.min.js',
                                    // maxlength for textareas
                                    'assets/lib/stopVerbosity/stopVerbosity.min.js',
                                    // uplaoder
                                    'assets/lib/plupload/js/jquery.plupload.queue/css/jquery.plupload.queue.css',
                                    'assets/lib/plupload/js/plupload.full.min.js',
                                    'assets/lib/plupload/js/jquery.plupload.queue/jquery.plupload.queue.min.js',
                                    // wysiwg editor
                                    'assets/lib/ckeditor/ckeditor.js',
                                    'assets/lib/ckeditor/adapters/jquery.js',
                                    // 2col multiselect
                                    'assets/lib/lou-multi-select/js/jquery.multi-select.js',
                                    // quicksearch
                                    'assets/lib/quicksearch/jquery.quicksearch.min.js',
                                    // clock picker
                                    'assets/lib/clock-picker/bootstrap-clockpicker.min.js',
                                    // chained selects
                                    'assets/lib/jquery_chained/jquery.chained.min.js',
                                    // show/hide passwords
                                    'assets/lib/hideShowPassword/hideShowPassword.min.js',
                                    // password strength meter
                                    'assets/lib/jquery.pwstrength.bootstrap/pwstrength-bootstrap-1.2.2.min.js',
                                    // icheck
                                    'assets/lib/iCheck/skins/minimal/blue.css',
                                    'assets/lib/iCheck/icheck.min.js',
                                    // selectize.js
                                    'assets/lib/selectize-js/css/selectize.css',
                                    'assets/lib/selectize-js/js/standalone/selectize.min.js'
                                ])
                            }
                        ]
                    },
                    controller: 'category-reports-controller',
                    ncyBreadcrumb: {
                        label: 'Categories'
                    }
                })
                .state('auth.reports.classes', {
                    page_title: 'Reports - Classes',
                    ncyBreadcrumb: {
                        label: 'Classes'
                    },
                    url: '/classes',
                    templateUrl: 'views/reports/reports.classes.html',
                    resolve: {
                        files: [
                            'uiLoad',
                            function (uiLoad) {
                                return uiLoad.load([
                                    // c3 charts
                                    'assets/lib/d3/d3.min.js',
                                    'assets/lib/c3/c3.min.js',
                                    // select2
                                    'assets/lib/select2/select2.css',
                                    'assets/lib/select2/select2.min.js',
                                    // datepicker
                                    'assets/lib/bootstrap-datepicker/css/datepicker3.css',
                                    'assets/lib/bootstrap-datepicker/js/bootstrap-datepicker.js',
                                    // date range picker
                                    'assets/lib/bootstrap-daterangepicker/daterangepicker-bs3.css',
                                    'assets/lib/bootstrap-daterangepicker/daterangepicker.js',
                                    // rangeSlider
                                    'assets/lib/ion.rangeSlider/css/ion.rangeSlider.css',
                                    'assets/lib/ion.rangeSlider/css/ion.rangeSlider.skinFlat.css',
                                    'assets/lib/ion.rangeSlider/js/ion-rangeSlider/ion.rangeSlider.min.js',
                                    // autosize
                                    'assets/lib/autosize/jquery.autosize.min.js',
                                    // inputmask
                                    'assets/lib/jquery.inputmask/jquery.inputmask.bundle.min.js',
                                    // maxlength for textareas
                                    'assets/lib/stopVerbosity/stopVerbosity.min.js',
                                    // uplaoder
                                    'assets/lib/plupload/js/jquery.plupload.queue/css/jquery.plupload.queue.css',
                                    'assets/lib/plupload/js/plupload.full.min.js',
                                    'assets/lib/plupload/js/jquery.plupload.queue/jquery.plupload.queue.min.js',
                                    // wysiwg editor
                                    'assets/lib/ckeditor/ckeditor.js',
                                    'assets/lib/ckeditor/adapters/jquery.js',
                                    // 2col multiselect
                                    'assets/lib/lou-multi-select/js/jquery.multi-select.js',
                                    // quicksearch
                                    'assets/lib/quicksearch/jquery.quicksearch.min.js',
                                    // clock picker
                                    'assets/lib/clock-picker/bootstrap-clockpicker.min.js',
                                    // chained selects
                                    'assets/lib/jquery_chained/jquery.chained.min.js',
                                    // show/hide passwords
                                    'assets/lib/hideShowPassword/hideShowPassword.min.js',
                                    // password strength meter
                                    'assets/lib/jquery.pwstrength.bootstrap/pwstrength-bootstrap-1.2.2.min.js',
                                    // icheck
                                    'assets/lib/iCheck/skins/minimal/blue.css',
                                    'assets/lib/iCheck/icheck.min.js',
                                    // selectize.js
                                    'assets/lib/selectize-js/css/selectize.css',
                                    'assets/lib/selectize-js/js/standalone/selectize.min.js'
                                ])
                            }
                        ]
                    },
                    controller: 'itemclass-reports-controller'
                })
                .state('auth.reports.departments', {
                    page_title: 'Reports - Departments',
                    ncyBreadcrumb: {
                        label: 'Departments'
                    },
                    url: '/departments',
                    templateUrl: 'views/reports/reports.departments.html',
                    resolve: {
                        files: [
                            'uiLoad',
                            function (uiLoad) {
                                return uiLoad.load([
                                    // c3 charts
                                    'assets/lib/d3/d3.min.js',
                                    'assets/lib/c3/c3.min.js',
                                    // select2
                                    'assets/lib/select2/select2.css',
                                    'assets/lib/select2/select2.min.js',
                                    // datepicker
                                    'assets/lib/bootstrap-datepicker/css/datepicker3.css',
                                    'assets/lib/bootstrap-datepicker/js/bootstrap-datepicker.js',
                                    // date range picker
                                    'assets/lib/bootstrap-daterangepicker/daterangepicker-bs3.css',
                                    'assets/lib/bootstrap-daterangepicker/daterangepicker.js',
                                    // rangeSlider
                                    'assets/lib/ion.rangeSlider/css/ion.rangeSlider.css',
                                    'assets/lib/ion.rangeSlider/css/ion.rangeSlider.skinFlat.css',
                                    'assets/lib/ion.rangeSlider/js/ion-rangeSlider/ion.rangeSlider.min.js',
                                    // autosize
                                    'assets/lib/autosize/jquery.autosize.min.js',
                                    // inputmask
                                    'assets/lib/jquery.inputmask/jquery.inputmask.bundle.min.js',
                                    // maxlength for textareas
                                    'assets/lib/stopVerbosity/stopVerbosity.min.js',
                                    // uplaoder
                                    'assets/lib/plupload/js/jquery.plupload.queue/css/jquery.plupload.queue.css',
                                    'assets/lib/plupload/js/plupload.full.min.js',
                                    'assets/lib/plupload/js/jquery.plupload.queue/jquery.plupload.queue.min.js',
                                    // wysiwg editor
                                    'assets/lib/ckeditor/ckeditor.js',
                                    'assets/lib/ckeditor/adapters/jquery.js',
                                    // 2col multiselect
                                    'assets/lib/lou-multi-select/js/jquery.multi-select.js',
                                    // quicksearch
                                    'assets/lib/quicksearch/jquery.quicksearch.min.js',
                                    // clock picker
                                    'assets/lib/clock-picker/bootstrap-clockpicker.min.js',
                                    // chained selects
                                    'assets/lib/jquery_chained/jquery.chained.min.js',
                                    // show/hide passwords
                                    'assets/lib/hideShowPassword/hideShowPassword.min.js',
                                    // password strength meter
                                    'assets/lib/jquery.pwstrength.bootstrap/pwstrength-bootstrap-1.2.2.min.js',
                                    // icheck
                                    'assets/lib/iCheck/skins/minimal/blue.css',
                                    'assets/lib/iCheck/icheck.min.js',
                                    // selectize.js
                                    'assets/lib/selectize-js/css/selectize.css',
                                    'assets/lib/selectize-js/js/standalone/selectize.min.js'
                                ])
                            }
                        ]
                    },
                    controller: 'department-reports-controller'
                })
                .state('auth.reports.close', {
                    page_title: 'Reports - Close',
                    ncyBreadcrumb: {
                        label: 'Close'
                    },
                    url: '/close',
                    templateUrl: 'views/reports/reports.close.html',
                    resolve: {
                        files: [
                            'uiLoad',
                            function (uiLoad) {
                                return uiLoad.load([
                                    // c3 charts
                                    'assets/lib/d3/d3.min.js',
                                    'assets/lib/c3/c3.min.js',
                                    // select2
                                    'assets/lib/select2/select2.css',
                                    'assets/lib/select2/select2.min.js',
                                    // datepicker
                                    'assets/lib/bootstrap-datepicker/css/datepicker3.css',
                                    'assets/lib/bootstrap-datepicker/js/bootstrap-datepicker.js',
                                    // date range picker
                                    'assets/lib/bootstrap-daterangepicker/daterangepicker-bs3.css',
                                    'assets/lib/bootstrap-daterangepicker/daterangepicker.js',
                                    // rangeSlider
                                    'assets/lib/ion.rangeSlider/css/ion.rangeSlider.css',
                                    'assets/lib/ion.rangeSlider/css/ion.rangeSlider.skinFlat.css',
                                    'assets/lib/ion.rangeSlider/js/ion-rangeSlider/ion.rangeSlider.min.js',
                                    // autosize
                                    'assets/lib/autosize/jquery.autosize.min.js',
                                    // inputmask
                                    'assets/lib/jquery.inputmask/jquery.inputmask.bundle.min.js',
                                    // maxlength for textareas
                                    'assets/lib/stopVerbosity/stopVerbosity.min.js',
                                    // uplaoder
                                    'assets/lib/plupload/js/jquery.plupload.queue/css/jquery.plupload.queue.css',
                                    'assets/lib/plupload/js/plupload.full.min.js',
                                    'assets/lib/plupload/js/jquery.plupload.queue/jquery.plupload.queue.min.js',
                                    // wysiwg editor
                                    'assets/lib/ckeditor/ckeditor.js',
                                    'assets/lib/ckeditor/adapters/jquery.js',
                                    // 2col multiselect
                                    'assets/lib/lou-multi-select/js/jquery.multi-select.js',
                                    // quicksearch
                                    'assets/lib/quicksearch/jquery.quicksearch.min.js',
                                    // clock picker
                                    'assets/lib/clock-picker/bootstrap-clockpicker.min.js',
                                    // chained selects
                                    'assets/lib/jquery_chained/jquery.chained.min.js',
                                    // show/hide passwords
                                    'assets/lib/hideShowPassword/hideShowPassword.min.js',
                                    // password strength meter
                                    'assets/lib/jquery.pwstrength.bootstrap/pwstrength-bootstrap-1.2.2.min.js',
                                    // icheck
                                    'assets/lib/iCheck/skins/minimal/blue.css',
                                    'assets/lib/iCheck/icheck.min.js',
                                    // selectize.js
                                    'assets/lib/selectize-js/css/selectize.css',
                                    'assets/lib/selectize-js/js/standalone/selectize.min.js'
                                ])
                            }
                        ]
                    },
                    controller: 'close-reports-controller'
                })
                .state('auth.reports.closedetail', {
                    page_title: 'Reports Detail - Close',
                    ncyBreadcrumb: {
                        label: 'Close'
                    },
                    url: '/close/:id/:loc',
                    templateUrl: 'views/reports/reports.close.detail.html',
                    resolve: {
                        files: [
                            'uiLoad',
                            function (uiLoad) {
                                return uiLoad.load([
                                    // selectize.js
                                    'assets/lib/selectize-js/css/selectize.css',
                                    'assets/lib/selectize-js/js/standalone/selectize.min.js'
                                ])
                            }
                        ]
                    },
                    controller: 'close-detail-reports-controller'
                })
                .state('auth.reports.discount', {
                    page_title: 'Reports - Discount',
                    ncyBreadcrumb: {
                        label: 'Discount'
                    },
                    url: '/discount',
                    templateUrl: 'views/reports/reports.discount.html',
                    resolve: {
                        files: [
                            'uiLoad',
                            function (uiLoad) {
                                return uiLoad.load([
                                    // c3 charts
                                    'assets/lib/d3/d3.min.js',
                                    'assets/lib/c3/c3.min.js',
                                    // select2
                                    'assets/lib/select2/select2.css',
                                    'assets/lib/select2/select2.min.js',
                                    // datepicker
                                    'assets/lib/bootstrap-datepicker/css/datepicker3.css',
                                    'assets/lib/bootstrap-datepicker/js/bootstrap-datepicker.js',
                                    // date range picker
                                    'assets/lib/bootstrap-daterangepicker/daterangepicker-bs3.css',
                                    'assets/lib/bootstrap-daterangepicker/daterangepicker.js',
                                    // rangeSlider
                                    'assets/lib/ion.rangeSlider/css/ion.rangeSlider.css',
                                    'assets/lib/ion.rangeSlider/css/ion.rangeSlider.skinFlat.css',
                                    'assets/lib/ion.rangeSlider/js/ion-rangeSlider/ion.rangeSlider.min.js',
                                    // autosize
                                    'assets/lib/autosize/jquery.autosize.min.js',
                                    // inputmask
                                    'assets/lib/jquery.inputmask/jquery.inputmask.bundle.min.js',
                                    // maxlength for textareas
                                    'assets/lib/stopVerbosity/stopVerbosity.min.js',
                                    // uplaoder
                                    'assets/lib/plupload/js/jquery.plupload.queue/css/jquery.plupload.queue.css',
                                    'assets/lib/plupload/js/plupload.full.min.js',
                                    'assets/lib/plupload/js/jquery.plupload.queue/jquery.plupload.queue.min.js',
                                    // wysiwg editor
                                    'assets/lib/ckeditor/ckeditor.js',
                                    'assets/lib/ckeditor/adapters/jquery.js',
                                    // 2col multiselect
                                    'assets/lib/lou-multi-select/js/jquery.multi-select.js',
                                    // quicksearch
                                    'assets/lib/quicksearch/jquery.quicksearch.min.js',
                                    // clock picker
                                    'assets/lib/clock-picker/bootstrap-clockpicker.min.js',
                                    // chained selects
                                    'assets/lib/jquery_chained/jquery.chained.min.js',
                                    // show/hide passwords
                                    'assets/lib/hideShowPassword/hideShowPassword.min.js',
                                    // password strength meter
                                    'assets/lib/jquery.pwstrength.bootstrap/pwstrength-bootstrap-1.2.2.min.js',
                                    // icheck
                                    'assets/lib/iCheck/skins/minimal/blue.css',
                                    'assets/lib/iCheck/icheck.min.js',
                                    // selectize.js
                                    'assets/lib/selectize-js/css/selectize.css',
                                    'assets/lib/selectize-js/js/standalone/selectize.min.js'
                                ])
                            }
                        ]
                    },
                    controller: 'discount-reports-controller'
                })
                .state('auth.reports.void', {
                    page_title: 'Reports - Void',
                    ncyBreadcrumb: {
                        label: 'Void'
                    },
                    url: '/void',
                    templateUrl: 'views/reports/reports.void.html',
                    resolve: {
                        files: [
                            'uiLoad',
                            function (uiLoad) {
                                return uiLoad.load([
                                    // c3 charts
                                    'assets/lib/d3/d3.min.js',
                                    'assets/lib/c3/c3.min.js',
                                    // select2
                                    'assets/lib/select2/select2.css',
                                    'assets/lib/select2/select2.min.js',
                                    // datepicker
                                    'assets/lib/bootstrap-datepicker/css/datepicker3.css',
                                    'assets/lib/bootstrap-datepicker/js/bootstrap-datepicker.js',
                                    // date range picker
                                    'assets/lib/bootstrap-daterangepicker/daterangepicker-bs3.css',
                                    'assets/lib/bootstrap-daterangepicker/daterangepicker.js',
                                    // rangeSlider
                                    'assets/lib/ion.rangeSlider/css/ion.rangeSlider.css',
                                    'assets/lib/ion.rangeSlider/css/ion.rangeSlider.skinFlat.css',
                                    'assets/lib/ion.rangeSlider/js/ion-rangeSlider/ion.rangeSlider.min.js',
                                    // autosize
                                    'assets/lib/autosize/jquery.autosize.min.js',
                                    // inputmask
                                    'assets/lib/jquery.inputmask/jquery.inputmask.bundle.min.js',
                                    // maxlength for textareas
                                    'assets/lib/stopVerbosity/stopVerbosity.min.js',
                                    // uplaoder
                                    'assets/lib/plupload/js/jquery.plupload.queue/css/jquery.plupload.queue.css',
                                    'assets/lib/plupload/js/plupload.full.min.js',
                                    'assets/lib/plupload/js/jquery.plupload.queue/jquery.plupload.queue.min.js',
                                    // wysiwg editor
                                    'assets/lib/ckeditor/ckeditor.js',
                                    'assets/lib/ckeditor/adapters/jquery.js',
                                    // 2col multiselect
                                    'assets/lib/lou-multi-select/js/jquery.multi-select.js',
                                    // quicksearch
                                    'assets/lib/quicksearch/jquery.quicksearch.min.js',
                                    // clock picker
                                    'assets/lib/clock-picker/bootstrap-clockpicker.min.js',
                                    // chained selects
                                    'assets/lib/jquery_chained/jquery.chained.min.js',
                                    // show/hide passwords
                                    'assets/lib/hideShowPassword/hideShowPassword.min.js',
                                    // password strength meter
                                    'assets/lib/jquery.pwstrength.bootstrap/pwstrength-bootstrap-1.2.2.min.js',
                                    // icheck
                                    'assets/lib/iCheck/skins/minimal/blue.css',
                                    'assets/lib/iCheck/icheck.min.js',
                                    // selectize.js
                                    'assets/lib/selectize-js/css/selectize.css',
                                    'assets/lib/selectize-js/js/standalone/selectize.min.js'
                                ])
                            }
                        ]
                    },
                    controller: 'void-reports-controller'
                })
                .state('auth.reports.pettycash', {
                    page_title: 'Reports - Petty Cash',
                    ncyBreadcrumb: {
                        label: 'Petty Cash'
                    },
                    url: '/pettycash',
                    templateUrl: 'views/reports/reports.pettycash.html',
                    resolve: {
                        files: [
                            'uiLoad',
                            function (uiLoad) {
                                return uiLoad.load([
                                    // c3 charts
                                    'assets/lib/d3/d3.min.js',
                                    'assets/lib/c3/c3.min.js',
                                    // select2
                                    'assets/lib/select2/select2.css',
                                    'assets/lib/select2/select2.min.js',
                                    // datepicker
                                    'assets/lib/bootstrap-datepicker/css/datepicker3.css',
                                    'assets/lib/bootstrap-datepicker/js/bootstrap-datepicker.js',
                                    // date range picker
                                    'assets/lib/bootstrap-daterangepicker/daterangepicker-bs3.css',
                                    'assets/lib/bootstrap-daterangepicker/daterangepicker.js',
                                    // rangeSlider
                                    'assets/lib/ion.rangeSlider/css/ion.rangeSlider.css',
                                    'assets/lib/ion.rangeSlider/css/ion.rangeSlider.skinFlat.css',
                                    'assets/lib/ion.rangeSlider/js/ion-rangeSlider/ion.rangeSlider.min.js',
                                    // autosize
                                    'assets/lib/autosize/jquery.autosize.min.js',
                                    // inputmask
                                    'assets/lib/jquery.inputmask/jquery.inputmask.bundle.min.js',
                                    // maxlength for textareas
                                    'assets/lib/stopVerbosity/stopVerbosity.min.js',
                                    // uplaoder
                                    'assets/lib/plupload/js/jquery.plupload.queue/css/jquery.plupload.queue.css',
                                    'assets/lib/plupload/js/plupload.full.min.js',
                                    'assets/lib/plupload/js/jquery.plupload.queue/jquery.plupload.queue.min.js',
                                    // wysiwg editor
                                    'assets/lib/ckeditor/ckeditor.js',
                                    'assets/lib/ckeditor/adapters/jquery.js',
                                    // 2col multiselect
                                    'assets/lib/lou-multi-select/js/jquery.multi-select.js',
                                    // quicksearch
                                    'assets/lib/quicksearch/jquery.quicksearch.min.js',
                                    // clock picker
                                    'assets/lib/clock-picker/bootstrap-clockpicker.min.js',
                                    // chained selects
                                    'assets/lib/jquery_chained/jquery.chained.min.js',
                                    // show/hide passwords
                                    'assets/lib/hideShowPassword/hideShowPassword.min.js',
                                    // password strength meter
                                    'assets/lib/jquery.pwstrength.bootstrap/pwstrength-bootstrap-1.2.2.min.js',
                                    // icheck
                                    'assets/lib/iCheck/skins/minimal/blue.css',
                                    'assets/lib/iCheck/icheck.min.js',
                                    // selectize.js
                                    'assets/lib/selectize-js/css/selectize.css',
                                    'assets/lib/selectize-js/js/standalone/selectize.min.js'
                                ])
                            }
                        ]
                    },
                    controller: 'pettycash-reports-controller'
                })
                .state('auth.reports.creditcards', {
                    page_title: 'Reports - Credit Cards',
                    ncyBreadcrumb: {
                        label: 'Credit Cards'
                    },
                    url: '/creditcard',
                    templateUrl: 'views/reports/reports.creditcards\.html',
                    resolve: {
                        files: [
                            'uiLoad',
                            function (uiLoad) {
                                return uiLoad.load([
                                    // c3 charts
                                    'assets/lib/d3/d3.min.js',
                                    'assets/lib/c3/c3.min.js',
                                    // select2
                                    'assets/lib/select2/select2.css',
                                    'assets/lib/select2/select2.min.js',
                                    // datepicker
                                    'assets/lib/bootstrap-datepicker/css/datepicker3.css',
                                    'assets/lib/bootstrap-datepicker/js/bootstrap-datepicker.js',
                                    // date range picker
                                    'assets/lib/bootstrap-daterangepicker/daterangepicker-bs3.css',
                                    'assets/lib/bootstrap-daterangepicker/daterangepicker.js',
                                    // rangeSlider
                                    'assets/lib/ion.rangeSlider/css/ion.rangeSlider.css',
                                    'assets/lib/ion.rangeSlider/css/ion.rangeSlider.skinFlat.css',
                                    'assets/lib/ion.rangeSlider/js/ion-rangeSlider/ion.rangeSlider.min.js',
                                    // autosize
                                    'assets/lib/autosize/jquery.autosize.min.js',
                                    // inputmask
                                    'assets/lib/jquery.inputmask/jquery.inputmask.bundle.min.js',
                                    // maxlength for textareas
                                    'assets/lib/stopVerbosity/stopVerbosity.min.js',
                                    // uplaoder
                                    'assets/lib/plupload/js/jquery.plupload.queue/css/jquery.plupload.queue.css',
                                    'assets/lib/plupload/js/plupload.full.min.js',
                                    'assets/lib/plupload/js/jquery.plupload.queue/jquery.plupload.queue.min.js',
                                    // wysiwg editor
                                    'assets/lib/ckeditor/ckeditor.js',
                                    'assets/lib/ckeditor/adapters/jquery.js',
                                    // 2col multiselect
                                    'assets/lib/lou-multi-select/js/jquery.multi-select.js',
                                    // quicksearch
                                    'assets/lib/quicksearch/jquery.quicksearch.min.js',
                                    // clock picker
                                    'assets/lib/clock-picker/bootstrap-clockpicker.min.js',
                                    // chained selects
                                    'assets/lib/jquery_chained/jquery.chained.min.js',
                                    // show/hide passwords
                                    'assets/lib/hideShowPassword/hideShowPassword.min.js',
                                    // password strength meter
                                    'assets/lib/jquery.pwstrength.bootstrap/pwstrength-bootstrap-1.2.2.min.js',
                                    // icheck
                                    'assets/lib/iCheck/skins/minimal/blue.css',
                                    'assets/lib/iCheck/icheck.min.js',
                                    // selectize.js
                                    'assets/lib/selectize-js/css/selectize.css',
                                    'assets/lib/selectize-js/js/standalone/selectize.min.js'
                                ])
                            }
                        ]
                    },
                    controller: 'creditcard-reports-controller'
                })
                .state('auth.reports.employee', {
                    page_title: 'Reports - Employee',
                    ncyBreadcrumb: {
                        label: 'Employee'
                    },
                    url: '/employee',
                    templateUrl: 'views/reports/reports.employees.html',
                    resolve: {
                        files: [
                            'uiLoad',
                            function (uiLoad) {
                                return uiLoad.load([
                                    // c3 charts
                                    'assets/lib/d3/d3.min.js',
                                    'assets/lib/c3/c3.min.js',
                                    // select2
                                    'assets/lib/select2/select2.css',
                                    'assets/lib/select2/select2.min.js',
                                    // datepicker
                                    'assets/lib/bootstrap-datepicker/css/datepicker3.css',
                                    'assets/lib/bootstrap-datepicker/js/bootstrap-datepicker.js',
                                    // date range picker
                                    'assets/lib/bootstrap-daterangepicker/daterangepicker-bs3.css',
                                    'assets/lib/bootstrap-daterangepicker/daterangepicker.js',
                                    // rangeSlider
                                    'assets/lib/ion.rangeSlider/css/ion.rangeSlider.css',
                                    'assets/lib/ion.rangeSlider/css/ion.rangeSlider.skinFlat.css',
                                    'assets/lib/ion.rangeSlider/js/ion-rangeSlider/ion.rangeSlider.min.js',
                                    // autosize
                                    'assets/lib/autosize/jquery.autosize.min.js',
                                    // inputmask
                                    'assets/lib/jquery.inputmask/jquery.inputmask.bundle.min.js',
                                    // maxlength for textareas
                                    'assets/lib/stopVerbosity/stopVerbosity.min.js',
                                    // uplaoder
                                    'assets/lib/plupload/js/jquery.plupload.queue/css/jquery.plupload.queue.css',
                                    'assets/lib/plupload/js/plupload.full.min.js',
                                    'assets/lib/plupload/js/jquery.plupload.queue/jquery.plupload.queue.min.js',
                                    // wysiwg editor
                                    'assets/lib/ckeditor/ckeditor.js',
                                    'assets/lib/ckeditor/adapters/jquery.js',
                                    // 2col multiselect
                                    'assets/lib/lou-multi-select/js/jquery.multi-select.js',
                                    // quicksearch
                                    'assets/lib/quicksearch/jquery.quicksearch.min.js',
                                    // clock picker
                                    'assets/lib/clock-picker/bootstrap-clockpicker.min.js',
                                    // chained selects
                                    'assets/lib/jquery_chained/jquery.chained.min.js',
                                    // show/hide passwords
                                    'assets/lib/hideShowPassword/hideShowPassword.min.js',
                                    // password strength meter
                                    'assets/lib/jquery.pwstrength.bootstrap/pwstrength-bootstrap-1.2.2.min.js',
                                    // icheck
                                    'assets/lib/iCheck/skins/minimal/blue.css',
                                    'assets/lib/iCheck/icheck.min.js',
                                    // selectize.js
                                    'assets/lib/selectize-js/css/selectize.css',
                                    'assets/lib/selectize-js/js/standalone/selectize.min.js'
                                ])
                            }
                        ]
                    },
                    controller: 'employee-reports-controller'
                })
                .state('auth.reports.tickets', {
                    page_title: 'Reports - Tickets Search',
                    ncyBreadcrumb: {
                        label: 'Tickets Search'
                    },
                    url: '/tickets_search',
                    templateUrl: 'views/reports/reports.tickets.html',
                    resolve: {
                        files: [
                            'uiLoad',
                            function (uiLoad) {
                                return uiLoad.load([
                                    //  datatables
                                    'assets/lib/DataTables/media/js/jquery.dataTables.min.js',
                                    'assets/lib/DataTables/extensions/FixedHeader/js/dataTables.fixedHeader.min.js',
                                    'assets/lib/DataTables/media/js/dataTables.bootstrap.js',
                                    // datepicker
                                    'assets/lib/bootstrap-datepicker/css/datepicker3.css',
                                    'assets/lib/bootstrap-datepicker/js/bootstrap-datepicker.js',
                                    // date range picker
                                    'assets/lib/bootstrap-daterangepicker/daterangepicker-bs3.css',
                                    'assets/lib/bootstrap-daterangepicker/daterangepicker.js',
                                    // select2
                                    'assets/lib/select2/select2.css',
                                    'assets/lib/select2/select2.min.js'
                                ])
                            }
                        ]
                    },
                    controller: 'ticket-reports-controller'
                })
                .state('auth.reports.items', {
                    page_title: 'Reports - Items',
                    ncyBreadcrumb: {
                        label: 'Items'
                    },
                    url: '/items',
                    templateUrl: 'views/reports/reports.items.html',
                    resolve: {
                        files: [
                            'uiLoad',
                            function (uiLoad) {
                                return uiLoad.load([
                                    // c3 charts
                                    'assets/lib/d3/d3.min.js',
                                    'assets/lib/c3/c3.min.js',
                                    // select2
                                    'assets/lib/select2/select2.css',
                                    'assets/lib/select2/select2.min.js',
                                    // datepicker
                                    'assets/lib/bootstrap-datepicker/css/datepicker3.css',
                                    'assets/lib/bootstrap-datepicker/js/bootstrap-datepicker.js',
                                    // date range picker
                                    'assets/lib/bootstrap-daterangepicker/daterangepicker-bs3.css',
                                    'assets/lib/bootstrap-daterangepicker/daterangepicker.js',
                                    // rangeSlider
                                    'assets/lib/ion.rangeSlider/css/ion.rangeSlider.css',
                                    'assets/lib/ion.rangeSlider/css/ion.rangeSlider.skinFlat.css',
                                    'assets/lib/ion.rangeSlider/js/ion-rangeSlider/ion.rangeSlider.min.js',
                                    // autosize
                                    'assets/lib/autosize/jquery.autosize.min.js',
                                    // inputmask
                                    'assets/lib/jquery.inputmask/jquery.inputmask.bundle.min.js',
                                    // maxlength for textareas
                                    'assets/lib/stopVerbosity/stopVerbosity.min.js',
                                    // uplaoder
                                    'assets/lib/plupload/js/jquery.plupload.queue/css/jquery.plupload.queue.css',
                                    'assets/lib/plupload/js/plupload.full.min.js',
                                    'assets/lib/plupload/js/jquery.plupload.queue/jquery.plupload.queue.min.js',
                                    // wysiwg editor
                                    'assets/lib/ckeditor/ckeditor.js',
                                    'assets/lib/ckeditor/adapters/jquery.js',
                                    // 2col multiselect
                                    'assets/lib/lou-multi-select/js/jquery.multi-select.js',
                                    // quicksearch
                                    'assets/lib/quicksearch/jquery.quicksearch.min.js',
                                    // clock picker
                                    'assets/lib/clock-picker/bootstrap-clockpicker.min.js',
                                    // chained selects
                                    'assets/lib/jquery_chained/jquery.chained.min.js',
                                    // show/hide passwords
                                    'assets/lib/hideShowPassword/hideShowPassword.min.js',
                                    // password strength meter
                                    'assets/lib/jquery.pwstrength.bootstrap/pwstrength-bootstrap-1.2.2.min.js',
                                    // icheck
                                    'assets/lib/iCheck/skins/minimal/blue.css',
                                    'assets/lib/iCheck/icheck.min.js',
                                    // selectize.js
                                    'assets/lib/selectize-js/css/selectize.css',
                                    'assets/lib/selectize-js/js/standalone/selectize.min.js'
                                ])
                            }
                        ]
                    },
                    controller: 'item-reports-controller'
                })
                .state('auth.settings', {
                    abstract: true,
                    url: '/settings',
                    template: '<div ui-view autoscroll="false" class="mainView-animate"></div>',
                    ncyBreadcrumb: {
                        label: 'Settings'
                    }
                })
                .state('auth.settings.security', {
                    abstract: true,
                    page_title: 'Security Levels',
                    url: '/security',
                    templateUrl: 'views/settings/security.html',
                    ncyBreadcrumb: {
                        label: 'Security Levels'
                    }
                })
                .state('auth.settings.security.users', {
                    page_title: 'Users',
                    url: '/users',
                    templateUrl: 'views/settings/security.users.html',
                    resolve: {
                        locationsList:  function(LocationRepository){
                            return LocationRepository.getAll()
                                .then (function (data) {
                                    return data.data.data;
                                });
                        },
                        files: [
                            'uiLoad',
                            function (uiLoad) {
                                return uiLoad.load([
                                    //  prism highlight
                                    'assets/lib/prism/prism_default.css',
                                    'assets/lib/prism/line_numbers.css',
                                    'assets/lib/prism/prism.min.js',
                                    // select2
                                    'assets/lib/select2/select2.css',
                                    'assets/lib/select2/select2.min.js',
                                    // jquery steps
                                    'assets/js/jquery.steps.custom.min.js',
                                    // 2col multiselect
                                    'assets/lib/lou-multi-select/js/jquery.multi-select.js',
                                    // validation
                                    'assets/js/parsley.config.js',
                                    'assets/lib/parsley/dist/parsley.min.js',
                                    // form wizard functions
                                    'assets/angular/states_jquery/yukon_wizard.min.js',
                                    // selectize.js
                                    'assets/lib/selectize-js/css/selectize.css',
                                    'assets/lib/selectize-js/js/standalone/selectize.min.js',
                                ])
                            }
                        ]
                    },
                    controller: 'security-users-controller',
                    ncyBreadcrumb: {
                        label: 'Users'
                    }
                })
                .state('auth.settings.security.profiles', {
                    page_title: 'Profiles',
                    url: '/profiles',
                    templateUrl: 'views/settings/security.profiles.html',
                    resolve: {
                        permissionsList:  function(PermissionRepository){
                            return PermissionRepository.getAll()
                                .then (function (data) {
                                    return data.data.data;
                                });
                        },
                        files: [
                            'uiLoad',
                            function (uiLoad) {
                                return uiLoad.load([
                                    // select2
                                    'assets/lib/select2/select2.css',
                                    'assets/lib/select2/select2.min.js',
                                    // autosize
                                    'assets/lib/autosize/jquery.autosize.min.js',
                                    // inputmask
                                    'assets/lib/jquery.inputmask/jquery.inputmask.bundle.min.js',
                                    // 2col multiselect
                                    'assets/lib/lou-multi-select/js/jquery.multi-select.js',
                                    // quicksearch
                                    'assets/lib/quicksearch/jquery.quicksearch.min.js',
                                    // icheck
                                    'assets/lib/iCheck/skins/minimal/blue.css',
                                    'assets/lib/iCheck/icheck.min.js',
                                    // selectize.js
                                    'assets/lib/selectize-js/css/selectize.css',
                                    'assets/lib/selectize-js/js/standalone/selectize.min.js'
                                ])
                            }
                        ]
                    },
                    controller: 'security-profile-controller',
                    ncyBreadcrumb: {
                        label: 'Profiles'
                    }
                })
                // Turns
                .state('auth.settings.turns', {
                    abstract: true,
                    url: '/turns',
                    templateUrl: 'views/turns/turns.html',
                    ncyBreadcrumb: {
                        label: 'Turns'
                    }
                })
                .state('auth.settings.turns.list', {
                    page_title: 'Turns List',
                    ncyBreadcrumb: {
                        label: 'Turns List'
                    },
                    url: '/list',
                    templateUrl: 'views/turns/turns.list.html',
                    resolve: {
                        files: [
                            'uiLoad',
                            function (uiLoad) {
                                return uiLoad.load([
                                    //  datatables
                                    'assets/lib/DataTables/media/js/jquery.dataTables.min.js',
                                    'assets/lib/DataTables/extensions/FixedHeader/js/dataTables.fixedHeader.min.js',
                                    'assets/lib/DataTables/media/js/dataTables.bootstrap.js'
                                ]);
                            }
                        ]
                    },
                    controller: 'TurnController'
                })
                .state('auth.settings.turns.new', {
                    page_title: 'Turns New',
                    ncyBreadcrumb: {
                        label: 'Turns New'
                    },
                    url: '/new',
                    templateUrl: 'views/turns/turns.new.html',
                    resolve: {
                        files: [
                            'uiLoad',
                            function (uiLoad) {
                                return uiLoad.load([
                                    // clock picker
                                    'assets/lib/clock-picker/bootstrap-clockpicker.min.js',
                                ]);
                            }
                        ]
                    },
                    controller: 'TurnController'
                })
                // Plugins > tables > footables
                .state('auth.plugins.tables.footable', {
                    page_title: 'Yukon Admin - Footable',
                    ncyBreadcrumb: {
                        label: 'Footable'
                    },
                    url: '',
                    templateUrl: 'views/plugins.tables.footable.html',
                    resolve: {
                        files: [
                            'uiLoad',
                            function (uiLoad) {
                                return uiLoad.load([
                                    //  footable
                                    'assets/lib/footable/css/footable.core.min.css',
                                    'assets/lib/footable/footable.min.js',
                                    'assets/lib/footable/footable.paginate.min.js',
                                    'assets/lib/footable/footable.filter.min.js'
                                ]);
                            }
                        ]
                    },
                    controller: 'footablesCtrl'
                })
                // Plugins > tables > datatables
                .state('auth.plugins.tables.datatable', {
                    page_title: 'Yukon Admin - Datatables',
                    ncyBreadcrumb: {
                        label: 'Datatables '
                    },
                    url: '/datatables',
                    templateUrl: 'views/plugins.tables.datatable.html',
                    resolve: {
                        files: [
                            'uiLoad',
                            function (uiLoad) {
                                return uiLoad.load([
                                    //  datatables
                                    'assets/lib/DataTables/media/js/jquery.dataTables.min.js',
                                    'assets/lib/DataTables/extensions/FixedHeader/js/dataTables.fixedHeader.min.js',
                                    'assets/lib/DataTables/media/js/dataTables.bootstrap.js'
                                ]);
                            }
                        ]
                    },
                    controller: 'datatablesCtrl'
                })
                // Plugins > vector maps
                .state('auth.plugins.vectorMaps', {
                    page_title: 'Yukon Admin - Vector Maps',
                    ncyBreadcrumb: {
                        label: 'Vector Maps '
                    },
                    url: '/vector_maps',
                    templateUrl: 'views/plugins.vector_maps.html',
                    resolve: {
                        files: [
                            'uiLoad',
                            function (uiLoad) {
                                return uiLoad.load([
                                    // vector maps
                                    'assets/lib/jvectormap/jquery-jvectormap-1.2.2.min.js',
                                    'assets/lib/jvectormap/maps/jquery-jvectormap-world-mill-en.js',
                                    'assets/lib/jvectormap/maps/jquery-jvectormap-ca-mill-en.js'
                                ]);
                            }
                        ]
                    },
                    controller: 'vectorMapsCtrl'
                })
        }
    ]);