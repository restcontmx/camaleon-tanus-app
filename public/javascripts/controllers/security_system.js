yukonApp
    .factory( 'PermissionRepository', [ 'CRUDService', function( CRUDService ) {
        var model = 'permission';
        return({
            getAll : () => CRUDService.getAll( model ),
            add : ( data ) => CRUDService.add( model, data ),
            getById : ( id ) => CRUDService.getById( model, id ),
            update : ( data ) => CRUDService.update( model, data ),
            remove : ( id ) => CRUDService.remove( model, data )
        });
    }])
    .factory( 'AuthRepository', [   '$http', 
                                    '$state', 
                                    '$cookies', 
                                    '$cookieStore', 
                                    '$location', 
                                    '$rootScope',
                                    'PermissionRepository', 
                                    function(   $http, 
                                                $state, 
                                                $cookies, 
                                                $cookieStore, 
                                                $location, 
                                                $rootScope,
                                                PermissionRepository ) {
        return {
            login : ( email, password ) => $http.post( 'auth/login/', JSON.stringify( { email : email, password : password } ) ), // Login function that verifies user on the api
            logout : () => $http.post( 'auth/logout' ), // Logs out the user erreasing the cookie
            removeSession : () => { $cookieStore.remove( 'userdata' ) }, // Removes session from the cookies
            getFullAuthData : () => this.getSession().auth_data, // get full authentication data
            // This verifies if the session is setted on the cookies
            isSessionSet : function() {
                var currentUser = $cookies["userdata"] || null;
                return currentUser ? true : false;
            },
            // This gets the full session object from the cookies
            getSession : function() {
                var currentUser = $cookies["userdata"] || null;
                return currentUser;
            },
            // View if the app is verified on the auth module
            viewVerification : function( ) {
                var currentUser = $cookies["userdata"] || null;
                if( !currentUser ) {                
                    $state.go( 'login' );
                    return false;
                } else {        
                    let user_info = JSON.parse( currentUser ).user_data;
                    if( user_info.s ) {
                        $rootScope.user_info = user_info
                        return true;
                    } else {
                        $state.go( 'login' );
                        return false;
                    }
                }
            },
            setCookie : function( user_data ) {
                $cookies["userdata"] = user_data;
            }
        }
    }])
    .factory( 'ProfileRepository', [ 'CRUDService', function( CRUDService ) {
        var model = 'profile';
        return({
            getAll : () => CRUDService.getAll( model ),
            add : ( data ) => CRUDService.add( model, data ),
            getById : ( id ) => CRUDService.getById( model, id ),
            update : ( data ) => CRUDService.update( model, data ),
            remove : ( id ) => CRUDService.remove( model, data )
        });
    }])
    .factory( 'UserReportsRepository', [ 'CRUDService', function( CRUDService ) {
        var model = 'userreports';
        return({
            getAll : () => CRUDService.getAll( model ),
            add : ( data ) => CRUDService.add( model, data ),
            getById : ( id ) => CRUDService.getById( model, id ),
            update : ( data ) => CRUDService.update( model, data ),
            remove : ( id ) => CRUDService.remove( model, data )
        });
    }])
    .controller( 'auth-controller', [   '$scope', 
                                        '$state', 
                                        '$location', 
                                        '$rootScope', 
                                        '$timeout', 
                                        'growl',
                                        'AuthRepository', function( $scope, 
                                                                    $state, 
                                                                    $location, 
                                                                    $rootScope, 
                                                                    $timeout, 
                                                                    growl,
                                                                    AuthRepository ) {
        // Auth controller
        // This manages the authentication on the login view
        // Sets a login function that sends email and password
        $scope.$on('$stateChangeSuccess', function () { 
            $scope.login = function() {   
                AuthRepository.login( $scope.email, $scope.password ).success( function( data ) {
                    if( data.error ) {
                        growl.error( data.message, {} );
                    } else {
                        $scope.message = data.message;
                        $rootScope.user_info = data.user_data;
                        growl.success("Login success.", {});
                        setTimeout(function() {
                            $state.go( 'auth.home' );
                        }, 2000);
                    }
                }).error( function( error ) {
                    growl.error( error, {} );
                });
            };        
        });
    }])
    .controller( 'header-controller', [ '$scope', 
                                        '$rootScope',
                                        '$state', 
                                        'ItemRepository', 
                                        'AuthRepository',
                                        'BusinessRepository',
                                        function(   $scope, 
                                                    $rootScope,
                                                    $state, 
                                                    ItemRepository, 
                                                    AuthRepository,
                                                    BusinessRepository  ) {
        if( $rootScope.user_info ) {
            
            $scope.logout = function() {
                AuthRepository.logout().success( function( response ) {
                    AuthRepository.removeSession()               
                    $state.go( 'login' );
                }).error( function( error ) {
                    $scope.errors = error;
                });
            };
            
            ItemRepository.getActiveLogs().success( function( response ) {
                if( !response.error ) {
                    $scope.logs = response.data;
                    $scope.preview_logs = $scope.logs.slice( 0, 5 );
                } else {
                    $scope.errors = response.message;
                }
            }).error( function( error ) {
                $scope.errors = error;
            });

            BusinessRepository.getById( $rootScope.user_info.business.id ).success( function( response ) {
                if( response.error ) {
                    $scope.errors = response.message
                } else {
                    $scope.business = response.data
                }
            }).error( function( error ) {
                $scope.errors = error;
            });
        }
    }])
    .controller( 'security-users-controller', [     '$scope',
                                                    '$state',
                                                    '$timeout',
                                                    '$rootScope',
                                                    'AuthRepository',
                                                    'ProfileRepository',
                                                    'UserReportsRepository',
                                                    'locationsList',
                                                    'growl',
                                                    function(   $scope,
                                                                $state,
                                                                $timeout,
                                                                $rootScope,
                                                                AuthRepository,
                                                                ProfileRepository,
                                                                UserReportsRepository,
                                                                locationsList,
                                                                growl   ) {
        if( AuthRepository.viewVerification() ) {
            $scope.locationsList = locationsList
            // Get all profiles from service
            function getAllProfiles() {
                ProfileRepository.getAll().success( function( response ) {
                    if( !response.error ) {
                        $scope.profiles = response.data;
                    } else {
                        growl.error("There was an error;" + response.message, {});
                    }
                }).error( function( error ) {
                    growl.error("There was an error;" + error, {});
                });
            }
            // Get all user reports from service
            function getAllUsers() {
                UserReportsRepository.getAll().success( function( response ) {
                    if( !response.error ) {
                        $scope.users = response.data;
                    } else {
                        growl.error("There was an error;" + response.message, {});  
                    }
                }).error( function( error ) {
                    growl.error("There was an error;" + error, {});
                });
            }
            // Init user function
            function initUser() {
                $scope.user = {
                    first_name : "",
                    last_name : "",
                    email : "",
                    password : "",
                    bussines_id : $rootScope.user_info.business.id,
                    profile : 0
                }
            }
            getAllProfiles(); // Get all profiles
            getAllUsers(); // Get all users
            initUser();
            // Add new user
            // Add user then clean user then refresh all users
            $scope.new_user = function() {
                if( $scope.user.profile > 0 ) {
                    $scope.user.profile_id = $scope.user.profile;
                    $scope.user.allowed_locations = $scope.location_list.map( l => l.id );
                    UserReportsRepository.add( $scope.user ).success( function( response ) {
                        if( !response.error ) {
                            growl.success( "User successfuly created.", {});
                            getAllUsers();
                            initUser();
                        } else {
                            growl.error( "There was an error;" + response.message, {});
                        }
                    }).error( function( error ) {
                        growl.error( "There was an error;" + error, {});
                    });
                } else {
                    growl.warning( "Please select a valid profile.", {});
                }
            }
            // locations input
            $scope.$on('$stateChangeSuccess', function () {
                $timeout(function() {
                    // init form.extended_elements functions
                    col_multiselect = {
                        init: function() {
                            if($('#2col_ms_default').length) {
                                var $msListDefault = $('#2col_ms_default');
                                $msListDefault.multiSelect({
                                    keepOrder: true,
                                    selectableHeader: '<div class="ms-header">Selectable items</div>',
                                    selectionHeader: '<div class="ms-header">Selection items</div>',
                                    selectableFooter: '<div class="ms-footer">Selectable footer</div>',
                                    selectionFooter: '<div class="ms-footer">Selection footer</div>'
                                });
                                $msListDefault.closest('.ms-wrapper').find('.ms_select_all').click(function (e) {
                                    e.preventDefault();
                                    $msListDefault.multiSelect('select_all');
                                });
                                $msListDefault.closest('.ms-wrapper').find('.ms_deselect_all').click(function (e) {
                                    e.preventDefault();
                                    $msListDefault.multiSelect('deselect_all');
                                });
                            }
                            if($('#2col_ms_search').length) {
                                var $msListSearch = $('#2col_ms_search');
                                $msListSearch.multiSelect({
                                    keepOrder: true,
                                    selectableHeader: '<div class="ms-header-search"><input class="form-control input-sm" type="text" placeholder="Search in selectable..."/></div>',
                                    selectionHeader: '<div class="ms-header-search"><input class="form-control input-sm" type="text" placeholder="Search in selection..."/></div>',
                                    afterInit: function(ms){
                                        ms.find('.ms-list li').each(function() {
                                            var thisText = $(this).children('span').text(),
                                                flag = thisText.substr(2, 2),
                                                flag_remove = thisText.substr(0, 6);
                                            $(this).children('span').html( '<i class="flag-'+ flag +'"></i>'+ thisText.replace(flag_remove,'') );
                                        });
                                        var that = this,
                                            $selectableSearch = that.$selectableUl.prev().children(),
                                            $selectionSearch = that.$selectionUl.prev().children(),
                                            selectableSearchString = '#' + that.$container.attr('id') + ' .ms-elem-selectable:not(.ms-selected)',
                                            selectionSearchString = '#' + that.$container.attr('id') + ' .ms-elem-selection.ms-selected';
                
                                        that.qs1 = $selectableSearch.quicksearch(selectableSearchString).on('keydown', function (e) {
                                            if (e.which === 40) {
                                                that.$selectableUl.focus();
                                                return false;
                                            }
                                        });
                
                                        that.qs2 = $selectionSearch.quicksearch(selectionSearchString).on('keydown', function (e) {
                                            if (e.which == 40) {
                                                that.$selectionUl.focus();
                                                return false;
                                            }
                                        });
                                    },
                                    afterSelect: function () {
                                        this.qs1.cache();
                                        this.qs2.cache();
                                    },
                                    afterDeselect: function () {
                                        this.qs1.cache();
                                        this.qs2.cache();
                                    }
                                });
                                $msListSearch.closest('.ms-wrapper').find('.ms_select_all').click(function (e) {
                                    e.preventDefault();
                                    $msListSearch.multiSelect('select_all');
                                });
                                $msListSearch.closest('.ms-wrapper').find('.ms_deselect_all').click(function (e) {
                                    e.preventDefault();
                                    $msListSearch.multiSelect('deselect_all');
                                });
                            }
                        }
                    };
                    col_multiselect.init();
                })
            })
            // Go to edit user view
            $scope.goEdit = function( id ) {
                $state.go( 'auth.settings.security.usersedit', { 'id' : id } )
            }
            // change user state to active or inactive
            $scope.changeUserState = function( id ) {
                // update to change state to active or inactive
            }
        }
    }])
    .controller( 'security-users-edit-controller', [    '$scope',
                                                        '$state',
                                                        '$timeout',
                                                        '$rootScope',
                                                        'AuthRepository',
                                                        'UserReportsRepository',
                                                        'locationsList',
                                                        'profilesList',
                                                        'userObj',
                                                        'growl',
                                                        function(   $scope,
                                                                    $state,
                                                                    $timeout,
                                                                    $rootScope,
                                                                    AuthRepository,
                                                                    UserReportsRepository,
                                                                    locationsList,
                                                                    profilesList,
                                                                    userObj,
                                                                    growl   ) {
        if( AuthRepository.viewVerification() ) {
            $scope.locationsList = locationsList
            $scope.user = userObj
            $scope.profiles = profilesList
            // update new user
            // updates user
            $scope.update_user = function() {
                if( $scope.user.profile.id > 0 ) {
                    $scope.user.profile_id = $scope.user.profile.id;
                    $scope.user.user = {
                        username : $scope.user.user.email,
                        first_name : $scope.user.user.first_name,
                        last_name : $scope.user.user.last_name,
                        email : $scope.user.user.email
                    }
                    $scope.user.allowed_locations = $scope.user.allowed_locations.map( l => l.id );
                    UserReportsRepository.update( $scope.user ).success( function( response ) {
                        if( !response.error ) {
                            growl.success( "User successfuly updated.", {});
                            $state.go( 'auth.settings.security.users' )
                        } else {
                            growl.error( "There was an error;" + response.message, {});
                        }
                    }).error( function( error ) {
                        growl.error( "There was an error;" + error, {});
                    });
                } else {
                    growl.warning( "Please select a valid profile.", {});
                }
            }
            // locations input
            $scope.$on('$stateChangeSuccess', function () {
                $timeout(function() {
                    // init form.extended_elements functions
                    col_multiselect = {
                        init: function() {
                            if($('#2col_ms_default').length) {
                                var $msListDefault = $('#2col_ms_default');
                                $msListDefault.multiSelect({
                                    keepOrder: true,
                                    selectableHeader: '<div class="ms-header">Selectable items</div>',
                                    selectionHeader: '<div class="ms-header">Selection items</div>',
                                    selectableFooter: '<div class="ms-footer">Selectable footer</div>',
                                    selectionFooter: '<div class="ms-footer">Selection footer</div>'
                                });
                                $msListDefault.closest('.ms-wrapper').find('.ms_select_all').click(function (e) {
                                    e.preventDefault();
                                    $msListDefault.multiSelect('select_all');
                                });
                                $msListDefault.closest('.ms-wrapper').find('.ms_deselect_all').click(function (e) {
                                    e.preventDefault();
                                    $msListDefault.multiSelect('deselect_all');
                                });
                            }
                            if($('#2col_ms_search').length) {
                                var $msListSearch = $('#2col_ms_search');
                                $msListSearch.multiSelect({
                                    keepOrder: true,
                                    selectableHeader: '<div class="ms-header-search"><input class="form-control input-sm" type="text" placeholder="Search in selectable..."/></div>',
                                    selectionHeader: '<div class="ms-header-search"><input class="form-control input-sm" type="text" placeholder="Search in selection..."/></div>',
                                    afterInit: function(ms){
                                        ms.find('.ms-list li').each(function() {
                                            var thisText = $(this).children('span').text(),
                                                flag = thisText.substr(2, 2),
                                                flag_remove = thisText.substr(0, 6);
                                            $(this).children('span').html( '<i class="flag-'+ flag +'"></i>'+ thisText.replace(flag_remove,'') );
                                        });
                                        var that = this,
                                            $selectableSearch = that.$selectableUl.prev().children(),
                                            $selectionSearch = that.$selectionUl.prev().children(),
                                            selectableSearchString = '#' + that.$container.attr('id') + ' .ms-elem-selectable:not(.ms-selected)',
                                            selectionSearchString = '#' + that.$container.attr('id') + ' .ms-elem-selection.ms-selected';
                
                                        that.qs1 = $selectableSearch.quicksearch(selectableSearchString).on('keydown', function (e) {
                                            if (e.which === 40) {
                                                that.$selectableUl.focus();
                                                return false;
                                            }
                                        });
                
                                        that.qs2 = $selectionSearch.quicksearch(selectionSearchString).on('keydown', function (e) {
                                            if (e.which == 40) {
                                                that.$selectionUl.focus();
                                                return false;
                                            }
                                        });
                                    },
                                    afterSelect: function () {
                                        this.qs1.cache();
                                        this.qs2.cache();
                                    },
                                    afterDeselect: function () {
                                        this.qs1.cache();
                                        this.qs2.cache();
                                    }
                                });
                                $msListSearch.closest('.ms-wrapper').find('.ms_select_all').click(function (e) {
                                    e.preventDefault();
                                    $msListSearch.multiSelect('select_all');
                                });
                                $msListSearch.closest('.ms-wrapper').find('.ms_deselect_all').click(function (e) {
                                    e.preventDefault();
                                    $msListSearch.multiSelect('deselect_all');
                                });
                            }
                        }
                    };
                    col_multiselect.init();
                })
            })
        }
    }])
    .controller( 'security-profile-controller', [   '$scope',
                                                    '$state',
                                                    '$rootScope',
                                                    'AuthRepository',
                                                    '$timeout',
                                                    'permissionsList',
                                                    'ProfileRepository',
                                                    'growl',
                                                    function(   $scope,
                                                                $state,
                                                                $rootScope,
                                                                AuthRepository,
                                                                $timeout,
                                                                permissionsList,
                                                                ProfileRepository,
                                                                growl   ) {
        if( AuthRepository.viewVerification() ) {
            
            $scope.permissionsList = permissionsList;

            function initProfile() {
                $scope.profile = {
                    bussines : $rootScope.user_info.business.id,
                    permissions : [],
                    value : 0
                }
            }
            
            function getAllProfiles() {
                ProfileRepository.getAll().success( function( response ) {
                    if( !response.error ) {   
                        $scope.profiles = response.data;
                        $scope.profiles.forEach( s => {
                            s.p_v = {}
                            $scope.permissionsList.forEach( p => {
                                let found_permission = s.permissions.find( per => per.id == p.id )
                                if( found_permission ){
                                    s.p_v[ p.name ] = true
                                } else {
                                    s.p_v[ p.name ] = false                                    
                                }
                            })
                        })
                    } else {
                        growl.error( "There was an error getting the profiles; " + response.message, {});
                    }
                }).error( function( error ) {
                    growl.error( "There was an error getting the profiles; " + error, {});
                });
            }
            
            initProfile();
            getAllProfiles();

            $scope.$on('$stateChangeSuccess', function () {
                $timeout(function() {
                    // init form.extended_elements functions
                    col_multiselect = {
                        init: function() {
                            if($('#2col_ms_default').length) {
                                var $msListDefault = $('#2col_ms_default');
                                $msListDefault.multiSelect({
                                    keepOrder: true,
                                    selectableHeader: '<div class="ms-header">Selectable items</div>',
                                    selectionHeader: '<div class="ms-header">Selection items</div>',
                                    selectableFooter: '<div class="ms-footer">Selectable footer</div>',
                                    selectionFooter: '<div class="ms-footer">Selection footer</div>'
                                });
                                $msListDefault.closest('.ms-wrapper').find('.ms_select_all').click(function (e) {
                                    e.preventDefault();
                                    $msListDefault.multiSelect('select_all');
                                });
                                $msListDefault.closest('.ms-wrapper').find('.ms_deselect_all').click(function (e) {
                                    e.preventDefault();
                                    $msListDefault.multiSelect('deselect_all');
                                });
                            }
                            if($('#2col_ms_search').length) {
                                var $msListSearch = $('#2col_ms_search');
                                $msListSearch.multiSelect({
                                    keepOrder: true,
                                    selectableHeader: '<div class="ms-header-search"><input class="form-control input-sm" type="text" placeholder="Search in selectable..."/></div>',
                                    selectionHeader: '<div class="ms-header-search"><input class="form-control input-sm" type="text" placeholder="Search in selection..."/></div>',
                                    afterInit: function(ms){
                                        ms.find('.ms-list li').each(function() {
                                            var thisText = $(this).children('span').text(),
                                                flag = thisText.substr(2, 2),
                                                flag_remove = thisText.substr(0, 6);
                                            $(this).children('span').html( '<i class="flag-'+ flag +'"></i>'+ thisText.replace(flag_remove,'') );
                                        });
                                        var that = this,
                                            $selectableSearch = that.$selectableUl.prev().children(),
                                            $selectionSearch = that.$selectionUl.prev().children(),
                                            selectableSearchString = '#' + that.$container.attr('id') + ' .ms-elem-selectable:not(.ms-selected)',
                                            selectionSearchString = '#' + that.$container.attr('id') + ' .ms-elem-selection.ms-selected';
                
                                        that.qs1 = $selectableSearch.quicksearch(selectableSearchString).on('keydown', function (e) {
                                            if (e.which === 40) {
                                                that.$selectableUl.focus();
                                                return false;
                                            }
                                        });
                
                                        that.qs2 = $selectionSearch.quicksearch(selectionSearchString).on('keydown', function (e) {
                                            if (e.which == 40) {
                                                that.$selectionUl.focus();
                                                return false;
                                            }
                                        });
                                    },
                                    afterSelect: function () {
                                        this.qs1.cache();
                                        this.qs2.cache();
                                    },
                                    afterDeselect: function () {
                                        this.qs1.cache();
                                        this.qs2.cache();
                                    }
                                });
                                $msListSearch.closest('.ms-wrapper').find('.ms_select_all').click(function (e) {
                                    e.preventDefault();
                                    $msListSearch.multiSelect('select_all');
                                });
                                $msListSearch.closest('.ms-wrapper').find('.ms_deselect_all').click(function (e) {
                                    e.preventDefault();
                                    $msListSearch.multiSelect('deselect_all');
                                });
                            }
                        }
                    };
                    col_multiselect.init();
                })
            })
            // Add new profile
            // Validate permissions are not empty
            // Get an array of permissions
            // Add profile then clean profile then refresh all profiles
            $scope.new_profile = function() {
                if( $scope.permission_list.length > 0 ) {
                    $scope.profile.permissions = $scope.permission_list.map( p => p.id );
                    ProfileRepository.add( $scope.profile ).success( function( response ) {
                        if( !response.error ) {
                            growl.success("Profile successfuly added.", {});            
                            initProfile();
                            getAllProfiles();
                        } else {
                            growl.error( "There was an error adding the profile; " + response.message, {});
                        }
                    }).error( function( error ) {
                        growl.error( "There was an error adding the profile; " + error, {});
                    });
                } else {
                    growl.error("Please select at least one permission.", {});            
                }
            }
            // Go to edit profile view
            $scope.goEdit = function( id ) {
                $state.go( 'auth.settings.security.profilesedit', { 'id' : id } )
            }
        }
    }])
    .controller( 'security-profiles-edit-controller', [ '$scope',
                                                        '$state',
                                                        '$timeout',
                                                        '$rootScope',
                                                        'AuthRepository',
                                                        'ProfileRepository',
                                                        'permissionsList',
                                                        'profileObj',
                                                        'growl',
                                                        function(   $scope,
                                                                    $state,
                                                                    $timeout,
                                                                    $rootScope,
                                                                    AuthRepository,
                                                                    ProfileRepository,
                                                                    permissionsList,
                                                                    profileObj,
                                                                    growl   ) {
        if (AuthRepository.viewVerification()) {
            
            $scope.profile = profileObj
            $scope.permissionsList = permissionsList;

            // update new user
            // updates user
            $scope.update_profile = function () {
                $scope.profile.permissions = $scope.profile.permissions.map(l => l.id);
                ProfileRepository.update($scope.profile).success(function (response) {
                    if (!response.error) {
                        growl.success("Profile successfuly updated.", {});
                        $state.go('auth.settings.security.profiles')
                    } else {
                        growl.error("There was an error;" + response.message, {});
                    }
                }).error(function (error) {
                    growl.error("There was an error;" + error, {});
                });
            }
            // locations input
            $scope.$on('$stateChangeSuccess', function () {
                $timeout(function () {
                    // init form.extended_elements functions
                    col_multiselect = {
                        init: function () {
                            if ($('#2col_ms_default').length) {
                                var $msListDefault = $('#2col_ms_default');
                                $msListDefault.multiSelect({
                                    keepOrder: true,
                                    selectableHeader: '<div class="ms-header">Selectable items</div>',
                                    selectionHeader: '<div class="ms-header">Selection items</div>',
                                    selectableFooter: '<div class="ms-footer">Selectable footer</div>',
                                    selectionFooter: '<div class="ms-footer">Selection footer</div>'
                                });
                                $msListDefault.closest('.ms-wrapper').find('.ms_select_all').click(function (e) {
                                    e.preventDefault();
                                    $msListDefault.multiSelect('select_all');
                                });
                                $msListDefault.closest('.ms-wrapper').find('.ms_deselect_all').click(function (e) {
                                    e.preventDefault();
                                    $msListDefault.multiSelect('deselect_all');
                                });
                            }
                            if ($('#2col_ms_search').length) {
                                var $msListSearch = $('#2col_ms_search');
                                $msListSearch.multiSelect({
                                    keepOrder: true,
                                    selectableHeader: '<div class="ms-header-search"><input class="form-control input-sm" type="text" placeholder="Search in selectable..."/></div>',
                                    selectionHeader: '<div class="ms-header-search"><input class="form-control input-sm" type="text" placeholder="Search in selection..."/></div>',
                                    afterInit: function (ms) {
                                        ms.find('.ms-list li').each(function () {
                                            var thisText = $(this).children('span').text(),
                                                flag = thisText.substr(2, 2),
                                                flag_remove = thisText.substr(0, 6);
                                            $(this).children('span').html('<i class="flag-' + flag + '"></i>' + thisText.replace(flag_remove, ''));
                                        });
                                        var that = this,
                                            $selectableSearch = that.$selectableUl.prev().children(),
                                            $selectionSearch = that.$selectionUl.prev().children(),
                                            selectableSearchString = '#' + that.$container.attr('id') + ' .ms-elem-selectable:not(.ms-selected)',
                                            selectionSearchString = '#' + that.$container.attr('id') + ' .ms-elem-selection.ms-selected';

                                        that.qs1 = $selectableSearch.quicksearch(selectableSearchString).on('keydown', function (e) {
                                            if (e.which === 40) {
                                                that.$selectableUl.focus();
                                                return false;
                                            }
                                        });

                                        that.qs2 = $selectionSearch.quicksearch(selectionSearchString).on('keydown', function (e) {
                                            if (e.which == 40) {
                                                that.$selectionUl.focus();
                                                return false;
                                            }
                                        });
                                    },
                                    afterSelect: function () {
                                        this.qs1.cache();
                                        this.qs2.cache();
                                    },
                                    afterDeselect: function () {
                                        this.qs1.cache();
                                        this.qs2.cache();
                                    }
                                });
                                $msListSearch.closest('.ms-wrapper').find('.ms_select_all').click(function (e) {
                                    e.preventDefault();
                                    $msListSearch.multiSelect('select_all');
                                });
                                $msListSearch.closest('.ms-wrapper').find('.ms_deselect_all').click(function (e) {
                                    e.preventDefault();
                                    $msListSearch.multiSelect('deselect_all');
                                });
                            }
                        }
                    };
                    col_multiselect.init();
                })
            })
        }
    }]);
