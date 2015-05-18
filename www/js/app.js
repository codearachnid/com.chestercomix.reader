var gaPlugin;
var qs = (function(a) {
    if (a == "") return {};
    var b = {};
    for (var i = 0; i < a.length; ++i)
    {
        var p=a[i].split('=');
        if (p.length != 2) continue;
        b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
    }
    return b;
})(window.location.search.substr(1).split('&'));
var debugMode = qs['debug'] != 'undefined' ? Boolean(qs.debug) : false;
// var deviceMode = ( typeof device != 'undefined' ) ? true : false; //
var deviceMode =navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry|IEMobile)/) ? true : false;
var myPhotoBrowserStandalone = null;


var IAP = {
  list: []
};


IAP.load = function () {
  // Check availability of the storekit plugin
  if (!window.storekit) {
    console.log("In-App Purchases not available");
    return;
  }
 
  // Initialize
  window.storekit.init({
    debug:    false, // disable IAP messages on the console
    ready:    IAP.onReady,
    purchase: IAP.onPurchase,
    restore:  IAP.onRestore,
    error:    IAP.onError
  });
};


IAP.onReady = function () {
    // Once setup is done, load all product data.
    storekit.load(IAP.list, function (products, invalidIds) {
      IAP.products = products;
      IAP.loaded = true;
      for (var i = 0; i < invalidIds.length; ++i) {
        console.log("Error: could not load " + invalidIds[i]);
      }
  });
};

IAP.onPurchase = function (transactionId, productId, receipt) {
  amplify.request('submitIAP', { UUID: context.UUID(), ID: productId, receipt: receipt, transactionId: transactionId }, function (submitResponse) {
        // console.log(submitResponse);
        if( submitResponse.status ) {
            successfulPurchase( submitResponse );
        } else {
            appFramework.alert(submitResponse.message,"Purchase Error");
        }
    });
};
 
IAP.onError = function (errorCode, errorMessage) {
  console.log('Error: ' + errorMessage);
  appFramework.hidePreloader();
    appFramework.alert( errorMessage, 'Purchase Error Occured.' );
};
IAP.onRestore = function (transactionId, productId, transactionReceipt) {
  amplify.request('submitIAP', { UUID: context.UUID(), ID: productId, receipt: receipt, transactionId: transactionId }, function (submitResponse) {
        // console.log(submitResponse);
        if( submitResponse.status ) {
            appFramework.alert('Thank you for requesting to restore your comix! We have successfully restored them in the bookshelf for you.',"Restore Successful");
        } else {
            appFramework.alert(submitResponse.message,"Restore Error");
        }
    });
};
IAP.restore = function () {
  storekit.restore();
};
IAP.buy = function (productId) {
    //testing
    // IAP.onPurchase('transid',productId,'reciept');
  storekit.purchase(productId);
};

var usStates = ko.observableArray([
    {id:"", name: "Select your state"},
    {id:"AL",name:"Alabama"},
    {id:"AK",name: "Alaska"},
    {id:"AS",name: "American Samoa"},
    {id:"AZ",name: "Arizona"},
    {id:"AR",name: "Arkansas"},
    {id:"CA",name: "California"},
    {id:"CO",name: "Colorado"},
    {id:"CT",name: "Connecticut"},
    {id:"DE",name: "Delaware"},
    {id:"DC",name: "District Of Columbia"},
    {id:"FM",name: "Federated States Of Micronesia"},
    {id:"FL",name: "Florida"},
    {id:"GA",name: "Georgia"},
    {id:"GU",name: "Guam"},
    {id:"HI",name: "Hawaii"},
    {id:"ID",name: "Idaho"},
    {id:"IL",name: "Illinois"},
    {id:"IN",name: "Indiana"},
    {id:"IA",name: "Iowa"},
    {id:"KS",name: "Kansas"},
    {id:"KY",name: "Kentucky"},
    {id:"LA",name: "Louisiana"},
    {id:"ME",name: "Maine"},
    {id:"MH",name: "Marshall Islands"},
    {id:"MD",name: "Maryland"},
    {id:"MA",name: "Massachusetts"},
    {id:"MI",name: "Michigan"},
    {id:"MN",name: "Minnesota"},
    {id:"MS",name: "Mississippi"},
    {id:"MO",name: "Missouri"},
    {id:"MT",name: "Montana"},
    {id:"NE",name: "Nebraska"},
    {id:"NV",name: "Nevada"},
    {id:"NH",name: "New Hampshire"},
    {id:"NJ",name: "New Jersey"},
    {id:"NM",name: "New Mexico"},
    {id:"NY",name: "New York"},
    {id:"NC",name: "North Carolina"},
    {id:"ND",name: "North Dakota"},
    {id:"MP",name: "Northern Mariana Islands"},
    {id:"OH",name: "Ohio"},
    {id:"OK",name: "Oklahoma"},
    {id:"OR",name: "Oregon"},
    {id:"PW",name: "Palau"},
    {id:"PA",name: "Pennsylvania"},
    {id:"PR",name: "Puerto Rico"},
    {id:"RI",name: "Rhode Island"},
    {id:"SC",name: "South Carolina"},
    {id:"SD",name: "South Dakota"},
    {id:"TN",name: "Tennessee"},
    {id:"TX",name: "Texas"},
    {id:"UT",name: "Utah"},
    {id:"VT",name: "Vermont"},
    {id:"VI",name: "Virgin Islands"},
    {id:"VA",name: "Virginia"},
    {id:"WA",name: "Washington"},
    {id:"WV",name: "West Virginia"},
    {id:"WI",name: "Wisconsin"},
    {id:"WY",name: "Wyoming"}]);


var appFramework = new Framework7();
var $$ = Framework7.$;
var appMain = appFramework.addView('.view-main', {
    // dynamicNavbar: true,
    init: false,
    cache: false,
    modalUsernamePlaceholder: "Email",
    // Hide and show indicator during ajax requests
    onAjaxStart: function (xhr) {
        appFramework.showIndicator();
    },
    onAjaxComplete: function (xhr) {
        appFramework.hideIndicator();
    }
});

$$('.prompt-register').on('click', function () {
    appMain.loadPage('register.html');
    appFramework.closeModal();
});
$$('.prompt-forgot-password').on('click', function () {
    var modalTitle = 'Password Reset';
    appFramework.prompt('What is your registered email?', modalTitle + " Request", function (email) {
        if( email == '' ) {
            appFramework.alert( "You must supply a valid email to reset your password.", modalTitle + " Failure" );
        } else {
            appFramework.showPreloader('requesting reset');
            amplify.request('userPasswordReset',{ u: email }, function(response){
                appFramework.hidePreloader();
                if( response.status ) {
                    appFramework.addNotification({
                        hold: 3000,
                        title: modalTitle + " Success",
                        message: 'You will receive an email at "' + email + '" with a link to change your password. Thank you for supporting Chester Comix!',
                    });
                } else {
                    appFramework.alert( response.message, modalTitle + ' Failed' );
                }
            });
        }
    });
});
$$('#signin-button').on('click', function () {
    var pageContainer = $$('.login-screen');
    var username = pageContainer.find('input[name="email"]').val();
    var password = pageContainer.find('input[name="password"]').val();
    appFramework.showPreloader('checking access...');
    amplify.request('userAuth',{ UUID: context.UUID(), u: username, p: password }, function(response){
        if( response.status ) {
            successLogin( response );
            appFramework.hidePreloader();
            appFramework.closeModal();
        } else {
            appFramework.hidePreloader();
            appFramework.alert( response.message, 'Login Attempt Failed' );
        }
    });
});
$$('.open-external').on('click', function () {
    // console.log('open external');
    appFramework.popup('.popup-external');
});
function openDeviceBrowser(externalLinkToOpen){
    window.open(externalLinkToOpen, '_system', 'location=no');
}
$$('.panel-left').on('open', function () {
    var element = document.getElementById('app-flyout-panel');
    ko.cleanNode( element );
    ko.applyBindings( vmAppSideNavigation, element );

    amplify.request('remoteSidebar',{},function(response){
        if( response.status ){
            vmAppSideNavigation.modules([]);
            // console.log( response.sidebar );
            $.each(response.sidebar, function(i, module){
                vmAppSideNavigation.modules.push({
                    title: module.title,
                    image: module.image,
                    // link: module.link
                    // link: "window.open('" + module.link + "', '_blank', 'location=yes')"
                    link: "openDeviceBrowser('" + module.link + "')"
                    // link: "navigator.startApp.start('" + module.link + "')"
                    // link: (navigator.userAgent.match(/Android/i)) == "Android" ?  "navigator.app.loadUrl('" + module.link + "', { openExternal:true })" : "window.open('" + module.link + "', '_system', 'location=yes&toolbar=yes')"
                    // link: "window.plugins.ChildBrowser.showWebPage('" + module.link + "', { showLocationBar: true })"
                    // link: "window.open('" + module.link + "', '_system')"
                });
                // console.log(vmAppSideNavigation.modules());
            });
            
        }
    });
    // console.log( vmAppSideNavigation.bookshelf() );
});
$$('.logout').on('click', function () {
    amplify.request('userLogout',{ UUID: context.UUID() },function(response){
        context.authenticated(false);
        context.UUID(false);
        chesterComix.checkAuthentication();
        appFramework.alert( response.message, 'Logout Successful' );
        navigator.app.exitApp();
    });
});

var paymentModal = '<div class="row no-gutter"><input type="text" placeholder="Credit Card" name="modal-cc" class="modal-text-input modal-text-input-double" /></div>' +
        '<div class="row no-gutter"><input type="text" placeholder="MM/YY" name="modal-expires" class="col-50 modal-text-input modal-text-input-double modal-text-input-double-left" />' + 
        '<input type="text" name="modal-cvc" placeholder="CVC Code" class="col-50 modal-text-input modal-text-input-double modal-text-input-double-right" /></div>' +
        '<div class="row"><label><input type="checkbox" name="modal-remember" /> Remember this card.</label></div>';
var paymentModalTitle = 'Credit Card Details';
var paymentModalButtons = [
              {
                text: 'Purchase',
                bold: true,
                onClick: stripeRequestHandler
              },
              {
                text: 'Cancel'
              }
            ];



var comixObject = function(id, name, description, thumb, featured, owned, unlocked, iap){
    unlocked = unlocked || false;
    owned = owned || false;
    iap = iap || '';
    return {
        thumb: ko.observable( thumb ),
        id: ko.observable( id ),
        owned: ko.observable( owned ),
        unlocked: ko.observable( unlocked ),
        name: ko.observable( name ),
        featured: ko.observable( featured ),
        description: ko.observable( description ),
        iap: ko.observable( iap )
    };
};

var context = {
    comix: new comixObject,
    authenticated: ko.observable(false),
    UUID: ko.observable(''),
    paymentKey: {
        secret: ko.observable(),
        publish: ko.observable()
    },
    user: {
        name: ko.observable(''),
        email: ko.observable(''),
        password: ko.observable(''),
        billing_name: ko.observable(''),
        billing_address: ko.observable(''),
        billing_address2: ko.observable(''),
        billing_city: ko.observable(''),
        billing_state: ko.observable(''),
        billing_zip: ko.observable(''),
        payment_id: ko.observable('')
    },
    purchaseAttempt: ko.observable('')
};
var emptyContext = context;
var vmComixManifest = {
    manifest: ko.observableArray()
    
};
var vmComixIndex = {
    applied: false,
    manifest: vmComixManifest.manifest,
    gotoComix: gotoComixPage
};
var vmAppTopNavigation = {
    applied: false,
    authenticated: context.authenticated,
    allowBack: ko.observable(false)
};
var vmAppSideNavigation = {
    applied: false,
    authenticated: context.authenticated,
    bookshelf: ko.observable(0),
    modules: ko.observableArray()
};
var vmPurchase = {
    owned: false,
    buyComixNow: buyComix
};
var vmAccount = {
    applied: false,
    user: context.user,
    UUID: context.UUID,
    states: usStates,
    isApple: ko.observable(true),
    restorePurchase: restorePurchase
};
var vmRegister = {
    applied: false,
    UUID: context.UUID
};

var vmAppSettings = {
    applied: false,
    version: ko.observable(),
    restorePurchase: restorePurchase,
    clearLocalData: clearLocalData
};
var vmBookshelf = {
    applied: false,
    manifest: vmComixManifest.manifest,
    gotoComix: gotoComixPage
};

var vmRemotePageAbout = {
    title: ko.observable(),
    content: ko.observable()
};
var vmRemotePageAuthorBio = {
    title: ko.observable(),
    content: ko.observable()
};
var vmRemotePageCredits = {
    title: ko.observable(),
    content: ko.observable()
};
var vmRemotePageLegal = {
    title: ko.observable(),
    content: ko.observable()
};

var vmRemotePageDetect = {
    manifest: vmComixManifest.manifest,
    title: ko.observable(),
    content: ko.observable()
};

var chesterComix = {
    init: function () {
        if( navigator.splashscreen ){
            navigator.splashscreen.show();    
        }
        this.bindRequests();
        this.bindEvents();
    },
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function () {

        ko.applyBindings( vmComixIndex, document.getElementById('comix-index') );
        ko.applyBindings( vmAppTopNavigation, document.getElementById('app-navbar') );

        // load device ready via device or force in dev mode
        if( deviceMode ) {
            document.addEventListener('deviceready', this.onDeviceReady, false);
        } else {
            this.onDeviceReady();
        }
            
    },
    bindRequests: function(){

        var cacheExpire = {
            type: "sqlite",
            expires: 604800000 //900000
        };

        cacheExpire = false;

        amplify.request.define("comixManifest", "ajax", {
            url: "http://www.chestercomix.com/app/api/comix/",
            dataType: "json",
            type: "POST",
            cache: cacheExpire
        });

        amplify.request.define("comixRead", "ajax", {
            url: "http://www.chestercomix.com/app/api/comix/",
            dataType: "json",
            type: "POST",
            cache: cacheExpire
        });

        amplify.request.define("comixLocations", "ajax", {
            url: "http://www.chestercomix.com/app/api/locations/",
            dataType: "json",
            type: "POST",
            cache: cacheExpire
        });

        amplify.request.define("comixPayload", "ajax", {
            url: "http://www.chestercomix.com/app/api/comix/",
            dataType: "json",
            beforeSend: function (_xhr, _ajaxSettings) {
                _xhr.overrideMimeType("text/plain; charset=x-user-defined");
                _ajaxSettings.url = decodeURIComponent(_ajaxSettings.data).replace('payloadURL=', '');
            },
            type: "POST",
            cache: cacheExpire
        });

        amplify.request.define("userDetect", "ajax", {
            url: "http://www.chestercomix.com/app/api/user-detect/",
            dataType: "json",
            type: "POST",
            cache: cacheExpire
        });

        amplify.request.define("userAuth", "ajax", {
            url: "http://www.chestercomix.com/app/api/user-user/",
            dataType: "json",
            type: "POST",
            cache: cacheExpire
        });

        amplify.request.define("userPasswordReset", "ajax", {
            url: "http://www.chestercomix.com/app/api/user-password-reset/",
            dataType: "json",
            type: "POST",
            cache: false
        });

        amplify.request.define("userContext", "ajax", {
            url: "http://www.chestercomix.com/app/api/user-context/",
            dataType: "json",
            type: "POST",
            cache: cacheExpire
        });

        amplify.request.define("userLogout", "ajax", {
            url: "http://www.chestercomix.com/app/api/user-logout/",
            dataType: "json",
            type: "POST",
            cache: cacheExpire
        });

        amplify.request.define("getPaymentKey", "ajax", {
            url: "http://www.chestercomix.com/app/api/payment-key/",
            dataType: "json",
            type: "POST",
            cache: cacheExpire
        });

        amplify.request.define("submitPayment", "ajax", {
            url: "http://www.chestercomix.com/app/api/payment/",
            dataType: "json",
            type: "POST",
            cache: cacheExpire
        });

        amplify.request.define("submitIAP", "ajax", {
            url: "http://www.chestercomix.com/app/api/iap/",
            dataType: "json",
            type: "POST",
            cache: cacheExpire
        });

        amplify.request.define("remotePageAbout", "ajax", {
            url: "http://www.chestercomix.com/app/page/about/",
            dataType: "json",
            type: "POST",
            cache: cacheExpire
        });

        amplify.request.define("remotePageDetect", "ajax", {
            url: "http://www.chestercomix.com/app/page/detect/",
            dataType: "json",
            type: "POST",
            cache: cacheExpire
        });

        // pages
        amplify.request.define("remotePageAbout", "ajax", {
            url: "http://www.chestercomix.com/app/page/about/",
            dataType: "json",
            type: "POST",
            cache: cacheExpire
        });
        amplify.request.define("remotePageAuthorBio", "ajax", {
            url: "http://www.chestercomix.com/app/page/authors-bio/",
            dataType: "json",
            type: "POST",
            cache: cacheExpire
        });
        amplify.request.define("remotePageCredits", "ajax", {
            url: "http://www.chestercomix.com/app/page/credits/",
            dataType: "json",
            type: "POST",
            cache: cacheExpire
        });
        amplify.request.define("remotePageLegal", "ajax", {
            url: "http://www.chestercomix.com/app/page/legal/",
            dataType: "json",
            type: "POST",
            cache: cacheExpire
        });
        amplify.request.define("remoteSidebar", "ajax", {
            url: "http://www.chestercomix.com/app/api/sidebar/",
            dataType: "json",
            type: "POST",
            cache: cacheExpire
        });
    },
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'chesterComix.receivedEvent(...);'
    onDeviceReady: function () {

        // gaPlugin = window.plugins.gaPlugin;
        // gaPlugin.init(function(){}, function(){}, "UA-48983835-1", 10);

        amplify.sqlite.instance.get('deviceUUID').done(function( responseUUID ){
            if( responseUUID != '' )
                context.UUID( responseUUID );
            chesterComix.checkAuthentication();
        }).fail(function(){
            chesterComix.checkAuthentication();
        });
        
        appFramework.onPageInit('index', function (page) {
            var element = document.getElementById('comix-index');
            ko.cleanNode(element);
            ko.applyBindings( vmComixIndex, element );
        });
        appFramework.onPageInit('bookshelf', function (page) { 
            var element = document.getElementById('comix-bookshelf');
            ko.cleanNode(element);
            ko.applyBindings( vmBookshelf, element );
        });
        appFramework.onPageInit('purchase', function (page) {
            vmAppTopNavigation.allowBack(true);
            var element = document.getElementById('comix-purchase');
            ko.cleanNode(element);
            ko.applyBindings( vmPurchase, element );
        });
        appFramework.onPageBeforeRemove('purchase',function (page){
            vmAppTopNavigation.allowBack(false);
        });
        appFramework.onPageInit('account', function (page) {
            vmAppTopNavigation.allowBack(true);
            var element = document.getElementById('app-account');
            ko.cleanNode(element);
            ko.applyBindings( vmAccount, element );
            vmAccount.isApple(true || device.platform.toLowerCase() == 'ios');
            $$('#app-account-details-form').on('submitted', function (e) {
                console.log(e.detail.data);
              var response = JSON.parse(e.detail.data);
              if( response.status ){
                appFramework.addNotification({
                    hold: 3000,
                    title: 'Success',
                    message: 'Thank you for updating your account information!',
                    onClose: function () {
                        if( context.purchaseAttempt() != '' ) {
                            gotoComixPage( context.purchaseAttempt() );
                        } else {
                            appMain.loadPage('index.html');
                        }
                    }
                });
              } else {
                appFramework.alert(response.message);
              }
            });
        });
        appFramework.onPageBeforeRemove('account',function (page){
            vmAppTopNavigation.allowBack(false);
        });
        appFramework.onPageInit('settings', function (page) {
            var element = document.getElementById('app-settings');
            ko.cleanNode(element);
            ko.applyBindings( vmAppSettings, element );
        });
        appFramework.onPageInit('register', function (page){
            var element = document.getElementById('app-register');
            ko.cleanNode(element);
            ko.applyBindings( vmRegister, element );
            $$('#app-register-form').on('submitted', function (e) {
              var response = JSON.parse(e.detail.data);
              if( response.status ){
                appFramework.addNotification({
                    hold: 3000,
                    title: 'Success',
                    message: 'Thank you for registering an account. Now you may find new comix or read previously purchased comix!',
                    onClose: function () {
                        appMain.loadPage('index.html');
                    }
                });
              } else {
                appFramework.alert(response.message);
              }
            });
        });

        appFramework.onPageBeforeAnimation('index', function (page) {
            appFramework.closePanel();
        });
        
        appFramework.onPageBeforeAnimation('bookshelf', function (page) {
            appFramework.closePanel();
        });
        appFramework.onPageBeforeAnimation('settings', function (page) {
            appFramework.closePanel();
        });

        appFramework.onPageInit('detect', function (page) {
            setupRemotePage('remotePage-detect', vmRemotePageDetect, 'remotePageDetect');
            navigator.geolocation.getCurrentPosition(geolocationSuccess, geolocationError);
            generateGoogleMap();
        });
        function geolocationSuccess(position){
            appFramework.showPreloader('checking your location to unlock new screens...');
            amplify.request('userDetect',{ UUID: context.UUID(), longitude: position.coords.longitude, latitude: position.coords.latitude }, function(response){
                if( response.status ) {
                    if( response.user_new_comix_ids.length > 0 ){
                        fetchManifest();
                        $.each( vmRemotePageDetect.manifest(), function(key, value){
                            if( $.inArray( value.id(), response.user_owned_unlocked_comix_ids ) > -1 ){
                                // console.log('unlocking', value.id(), response.user_owned_unlocked_comix_ids, vmRemotePageDetect.manifest()[ key ]);
                                vmRemotePageDetect.manifest()[ key ].unlocked( "true" );
                            }
                        });
                        // vmRemotePageDetect.manifest = vmComixManifest.manifest;
                        // console.log(vmRemotePageDetect.manifest);
                    }
                    appFramework.hidePreloader();
                    // appFramework.closeModal();
                } else {
                    appFramework.hidePreloader();
                    appFramework.alert( response.message, 'Failed detecting your current location' );
                }
            });
        }
        function geolocationError(error){
            appFramework.hidePreloader();
            appFramework.alert( error.message, 'Failed detecting your current location '+ error.code );
        }

        // remote pages
        appFramework.onPageBeforeAnimation('about', function (page) {
            setupRemotePage('remotePage-about', vmRemotePageAbout, 'remotePageAbout');
        });
        appFramework.onPageBeforeAnimation('author', function (page) {
            setupRemotePage('remotePage-author', vmRemotePageAuthorBio, 'remotePageAuthorBio');
        });
        appFramework.onPageBeforeAnimation('credits', function (page) {
            setupRemotePage('remotePage-credits', vmRemotePageCredits, 'remotePageCredits');
        });
        appFramework.onPageBeforeAnimation('legal', function (page) {
            setupRemotePage('remotePage-legal', vmRemotePageLegal, 'remotePageLegal');
        });

        



        appFramework.init();
    },
    checkAuthentication: function(){
        appFramework.loginScreen();
        appFramework.showPreloader('loading...');
        amplify.request('userAuth',{ UUID: context.UUID() }, function(response){
            if( response.status ) {
                context.UUID( response.UUID );
                successLogin( response );
                appFramework.hidePreloader();
                appFramework.closeModal();

                amplify.sqlite.instance.get('onResumeGoTo').done(function( onResumeContext ){
                    // console.log(onResumeContext);
                    if( onResumeContext != '' ){
                        gotoComixPage( onResumeContext.comix );
                    }
                });
                

            } else {
                appFramework.hidePreloader();
                amplify.sqlite.instance.clear();
            }
        });
    }
};

chesterComix.init();

function successLogin( response ){
    if( response.status ) {
        context.authenticated(true);

        context.UUID( response.UUID );
        amplify.sqlite.instance.put('deviceUUID', response.UUID, 0);


        fetchManifest();

        amplify.request('userContext',{ UUID: context.UUID() }, function(newContext){
            if( newContext.status ) {
                context.user.name( newContext.user.name );
                context.user.email( newContext.user.email );
                context.user.billing_name( newContext.user.billing_name );
                context.user.billing_address( newContext.user.billing_address );
                context.user.billing_address2( newContext.user.billing_address2 );
                context.user.billing_city( newContext.user.billing_city );
                context.user.billing_state( newContext.user.billing_state );
                context.user.billing_zip( newContext.user.billing_zip );
                context.user.payment_id( newContext.user.payment_id );
            }
            // console.log("get userContext", newContext);
        });

        amplify.request('getPaymentKey',{ UUID: context.UUID() }, function(newContext){
            context.paymentKey.secret( newContext.paymentKey.secret );
            context.paymentKey.publish( newContext.paymentKey.publish );
        });

        appFramework.addNotification({
            hold: 1500,
            title: 'Login successful',
            message: 'You are logged in successfully. Thank you for supporting Chester Comix!',
        });
    }
}

function fetchManifest(){
    var bookshelf = 0;
    amplify.request("comixManifest", { UUID: context.UUID(), res: { w: $(window).width(), h: $(window).height() } }, function (response) {
        // console.log(response);
        jQuery.each(response.comix, function (i, comix) {
            if( comix.iap != '' ){
                IAP.list.push( comix.iap );
            }
            var comixItem = new comixObject(
                comix.ID,
                comix.name,
                comix.description,
                comix.thumb,
                comix.featured,
                comix.owned,
                comix.unlocked,
                comix.iap
                ) ;
            if( comix.owned.toString() == 'true' ){
                bookshelf++;
                vmAppSideNavigation.bookshelf( bookshelf );
            }
            var foundItem = ko.utils.arrayFirst(vmComixManifest.manifest(), function(existingItem) {
                // console.log('compare:',
                //     existingItem.id(), 
                //     comixItem.id() );
                    return existingItem.id() == comixItem.id();
                });
            if( !foundItem ){
                vmComixManifest.manifest.push( comixItem );    
            }
        });
    });
}

function generateGoogleMap(){
    amplify.request('comixLocations',function( response ){
        if( response.status ) {
            var myLatlng = new google.maps.LatLng(37.037778,-95.626389);
            var mapOptions = {
                zoom: 4,
                center: myLatlng
            };
            var map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
            $.each( response.locations, function( key, location ){
                var locLatlng = new google.maps.LatLng(location.lat,location.lng);
                var locName = ( location.locName != '') ? location.name + ': ' + location.locName: location.name;
                var infowindow = new google.maps.InfoWindow({
                      content: '<div class="gmapInfoBox"><h3 class="clickGoToComix" onclick="loadComixByID(' + location.ID + ')">' + locName + '</h3><div>' + location.description + '</div></div>'
                  });
                var marker = new google.maps.Marker({
                    position: locLatlng,
                    map: map,
                    title: location.name + ': ' + location.locName
                });
                google.maps.event.addListener(marker, 'click', function() {
                    infowindow.open(map,marker);
                  });

                // if( key == response.locations.length-1 ){
                //     $('.clickGoToComix').on('click', function (instance) {
                //         alert( 'goto: ' + $(instance).attr('data-id') );
                //     });
                // }
            });


        }
    });
}
function restorePurchase(data, event){
    appFramework.alert('Attempting to restore your purchased comix.', 'Restore Attempt');
    IAP.restore();
}
function clearLocalData( data, event ){
    amplify.sqlite.instance.clear();
    appFramework.alert('Successfully cleared local data', 'Data Cleared');
    chesterComix.checkAuthentication();
}

function gotoComixPage( data, event ){
        context.comix = data;
        // amplify.sqlite.instance.delete('onResumeGoTo');
        if( data.owned() == 'true'){
            // console.log(data);
            amplify.request("comixManifest", { UUID: context.UUID(), ID: data.id(), res: { w: $(window).width(), h: $(window).height() } }, function (response) {
                // console.log(response);
                myPhotoBrowserStandalone = appFramework.photoBrowser({
                    expositionHideCaptions: false,
                    // lazyLoading: true,
                    toolbarTemplate: '<div class="toolbar tabbar"><div class="toolbar-inner"><a href="#" class="link photo-browser-index photo-browser-link-inactive"><i class="icon-iconmonstr-arrow-48-icon icon-direction-rotate-180"></i> <span>First</span></a><a href="#" class="link photo-browser-prev"><i class="icon-iconmonstr-arrow-37-icon icon-direction-rotate-180"></i> <span>Previous</span></a><a href="#" class="link photo-browser-next"><span>Next</span> <i class="icon-iconmonstr-arrow-37-icon"></i></a></div></div>',
                    photos : response.comix[0].panels,
                    onOpen: function(photobrowser){
                        var activeSlide = $('.slider-slide-active');
                        if( activeSlide.find('.align-claw-to-this').attr('alt') == '' ){
                            activeSlide.find('.align-claw-to-this').attr('alt',  response.comix[0].description );
                        }

                        setTimeout(function(){
                            console.log('get onResumeGoTo_' +  data.id());
                            amplify.sqlite.instance.get('onResumeGoTo_' +  data.id() ).done(function( slideContext ){
                                console.log('set new onResumeGoTo_',slideContext);
                                photobrowser.open( slideContext.slide );
                            });
                            $$('.photo-browser-index').on('click',function(){
                                photobrowser.open( 0 );
                            });
                        },500);

                        
                    },
                    onSlideChangeEnd: function(slider){

                        var activeSlide = $('.slider-slide-active');

                        if( slider.activeSlideIndex > 0 ){
                            $(".photo-browser-index").removeClass('photo-browser-link-inactive');
                        } else {
                            $(".photo-browser-index").addClass('photo-browser-link-inactive');
                        }


                        if( activeSlide.find('.align-claw-to-this').attr('alt') == '' ){
                            var caption = response.comix[0].panels[ slider.activeSlideIndex ].caption;
                            // REDACTED below to keep caption blank if there is none
                            // if( caption == '' ) {
                            //     caption = 'Slide ' + slider.activeSlideIndex;
                            // }
                            activeSlide.find('.align-claw-to-this').attr('alt',  caption );
                        }

                        // claw
                        if( response.comix[0].panels[ slider.activeSlideIndex ].link != '' && isEmptyElement($('.slider-slide-active').find('.theClaw')) ){
                            
                            var position = activeSlide.find('.align-claw-to-this').position();
                            if( position ) {
                                // activeSlide.find('.theClaw').html('<a href="' + response.comix[0].panels[ slider.activeSlideIndex ].link + '" data-popup=".popup-external" class="open-external"><img src="img/iCLAWscreen.png" /></a>');
                                activeSlide.find('.theClaw').html('<a href="#" onclick="openDeviceBrowser(\'' + response.comix[0].panels[ slider.activeSlideIndex ].link + '\')"><img src="img/iCLAWscreen.png" /></a>');
                                // activeSlide.find('.theClaw').html('<a href="' + response.comix[0].panels[ slider.activeSlideIndex ].link + '" target="_system" class="external"><img src="img/iCLAWscreen.png" /></a>');
                                activeSlide.find('.theClaw img').css({left:(position.left+8)+"px"});
                            }

                        }


                        var resumeContext = {
                            comix: context.comix,
                            slide: slider.activeSlideIndex
                        };
                        amplify.sqlite.instance.put('onResumeGoTo_' +  data.id(), resumeContext, 0 ).done(function(){
                            console.log('save onResumeGoTo_' +  data.id(),resumeContext);
                        }); // save state for 30 days
                    },
                    photoTemplate : '<div class="photo-browser-slide slider-slide"><span class="photo-browser-zoom-container"><img src="{{url}}" class="align-claw-to-this" alt="" ><span class="theClaw"></span></span></div>'
                });
                myPhotoBrowserStandalone.open();
            });
        } else {
            appMain.loadPage('purchase.html');
        }
}

function loadComixByID( cID ){
    $.each(vmComixManifest.manifest(), function( key, comix ){
        if( comix.id() == cID ){
            console.log('load comix: ', comix.name());
            gotoComixPage(comix);
        }
    });
    // gotoComixPage
}

function buyComix( data, event ){
    // todo to go to other platforms
    if( true || device.platform.toLowerCase() == 'ios' ){
        // apple user
        if( data.iap() ){
            appFramework.confirm('Are you sure you wish to purchase ' + data.name() + '?', 'Confirm Purchase', function () {
                IAP.buy( data.iap() );
            });
        }

    } else {
        if( context.user.billing_zip() != '' ) {
            // console.log(context.comix.name());
            // console.log(data);
            if( context.user.payment_id() != '' ){
                appFramework.confirm('Are you sure you wish to purchase ' + data.name() + '?', 'Confirm Purchase', function () {
                    context.comix = data;
                    appFramework.showIndicator();
                    amplify.request('submitPayment', { UUID: context.UUID(), ID: context.comix.id(), res: { w: $(window).width(), h: $(window).height() } }, function (submitResponse) {
                        // console.log(submitResponse);
                        if( submitResponse.status ) {
                            successfulPurchase( submitResponse );
                        } else {
                            appFramework.alert(submitResponse.message,"Purchase Error");
                        }
                    });
                });
            } else {
                context.comix = data;
                appFramework.modal({
                    title: paymentModalTitle,
                    afterText: paymentModal,
                    buttons: paymentModalButtons
                    });
            }
            
        } else {
            appMain.loadPage('account.html');
            appFramework.addNotification({
                hold: 1500,
                title: 'Missing information',
                message: 'Please fill in your billing details before purchasing',
                onClose: function(){
                    context.purchaseAttempt( data );
                    appFramework.showTab('#account-billing-info');        
                }
            });
            
        }
    }
}
function stripeRequestHandler (modal, index) {
    appFramework.showIndicator();
    var cc = $(modal).find('.modal-text-input[name="modal-cc"]').val();
    var cvc = $(modal).find('.modal-text-input[name="modal-cvc"]').val();
    var expires = $(modal).find('.modal-text-input[name="modal-expires"]').val().split("/");
    // console.log('expires',expires);
    var expMo = expires[0];
    var expYr = "20" + expires[1];
    var validated = true;
    var errorMessage = '';

    if( ! Stripe.card.validateCardNumber(cc) ){
        validated = false;
        errorMessage = 'Your credit card number is invalid. Please correct and try again.';
    }

    if( validated && ! Stripe.card.validateCVC(cvc) ){
        validated = false;
        errorMessage = 'Your CVC number is invalid. Please correct and try again.';
    }

    if( validated && ! Stripe.card.validateExpiry(expMo, expYr) ){
        validated = false;
        errorMessage = 'Your card expiration is invalid. Please correct and try again.';
    }

    if( validated ){
        // appFramework.showIndicator();
        Stripe.setPublishableKey(context.paymentKey.publish());
        Stripe.card.createToken({
          number: cc,
          cvc: cvc,
          exp_month: expMo,
          exp_year: expYr
        }, stripeResponseHandler);
    } else {
        appFramework.hideIndicator();
        appFramework.modal({
            title: paymentModalTitle,
            text: '<div class="error">' + errorMessage + '</div>',
            afterText: paymentModal,
            buttons: paymentModalButtons
            });
    }
}
function stripeResponseHandler(status, response){
    
    // console.log('stripeResponseHandler', status, response, context);
  if (response.error) {
    appFramework.hideIndicator();
// Show the errors on the form
    appFramework.modal({
        title: paymentModalTitle,
        text: '<div class="error">' + response.error.message + '</div>',
        afterText: paymentModal,
        buttons: paymentModalButtons
        });
  } else {

    amplify.request('submitPayment', { UUID: context.UUID(), token: response.id, ID: context.comix.id() }, function (submitResponse) {
        // console.log(submitResponse);
        if( submitResponse.status ) {
            successfulPurchase( submitResponse );
        } else {
            appFramework.hideIndicator();
            appFramework.alert(response.error.message,"Payment Error");
        }
    });

  }
}

function successfulPurchase( response ){
    appFramework.hideIndicator();
    context.comix.owned( 'true' );
    appFramework.addNotification({
        hold: 3000,
        title: 'Successful purchase',
        message: 'Thank you for purchasing the ' + context.comix.name() + '. Please wait while we load it for you now.',
    });
    appMain.loadPage('index.html');
    gotoComixPage( context.comix );
}

function setupRemotePage(domid, vm, aReq){
    appFramework.closePanel();
    // vmAppTopNavigation.allowBack(true);
    var element = document.getElementById(domid);
    ko.cleanNode(element);
    ko.applyBindings( vm, element );
    amplify.request(aReq,{},function(response){
        if( response.status ){
            vm.title( response.page.title );
            vm.content( response.page.content );
        }
    });
}

function isEmptyElement( el ){
  return !$.trim(el.html())
}
