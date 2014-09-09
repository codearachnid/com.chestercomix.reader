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
var deviceMode = navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry|IEMobile)/) ? true : false;

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
                    link: "window.open('" + module.link + "', '_system')"
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



var comixObject = function(id, name, description, thumb, featured, owned){
    owned = owned || false;
    return {
        thumb: ko.observable( thumb ),
        id: ko.observable( id ),
        owned: ko.observable( owned ),
        name: ko.observable( name ),
        featured: ko.observable( featured ),
        description: ko.observable( description )
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
    states: usStates
};
var vmRegister = {
    applied: false,
    UUID: context.UUID
};

var vmAppSettings = {
    applied: false,
    version: ko.observable(),
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

        amplify.request.define("userAuth", "ajax", {
            url: "http://www.chestercomix.com/app/api/user-user/",
            dataType: "json",
            type: "POST",
            cache: cacheExpire
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

        amplify.request.define("remotePageAbout", "ajax", {
            url: "http://www.chestercomix.com/app/page/about/",
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

        if( typeof device != 'undefined' )
            console.log(device);

        if( deviceMode &&  typeof device != 'undefined' ) {
            context.UUID( device.uuid );
        } else {
            context.UUID( 'testbrowser' );
            // console.log(context.UUID());
        }

        chesterComix.checkAuthentication();
        fetchManifest();
        
        appFramework.onPageInit('index', function (page) {
            var element = document.getElementById('comix-index');
            ko.cleanNode(element);
            ko.applyBindings( vmComixIndex, element );
            fetchManifest();    
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
                successLogin( response );
                appFramework.hidePreloader();
                appFramework.closeModal();
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
    amplify.request("comixManifest", { UUID: context.UUID() }, function (response) {
        // console.log(response);
        jQuery.each(response.comix, function (i, comix) {
            var comixItem = new comixObject(
                comix.ID,
                comix.name,
                comix.description,
                comix.thumb,
                comix.featured,
                comix.owned
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

function clearLocalData( data, event ){
    amplify.sqlite.instance.clear();
    alert('clear local data');
    chesterComix.checkAuthentication();
}

function gotoComixPage( data, event ){
        context.comix = data;
        if( data.owned() == 'true'){
            // console.log(data);
            amplify.request("comixManifest", { UUID: context.UUID(), ID: data.id() }, function (response) {
                console.log(response);
                var myPhotoBrowserStandalone = appFramework.photoBrowser({
                    expositionHideCaptions: false,
                    photos : response.comix[0].panels,
                    onSlideChangeEnd: function(slider){
                        // console.log(slider);
                        if( response.comix[0].panels[ slider.activeSlideIndex ].link != '' && isEmptyElement($('.slider-slide-active').find('.theClaw')) ){
                            // console.log('show the claw');
                            var activeSlide = $('.slider-slide-active');
                            var alignLeft = activeSlide.find('.align-claw-to-this').position().left;
                            console.log( activeSlide.find('.align-claw-to-this').position() );
                            activeSlide.find('.theClaw').html('<a href="' + response.comix[0].panels[ slider.activeSlideIndex ].link + '" target="system" class="external"><img src="img/iCLAWscreen.png" /></a>');
                            activeSlide.find('.theClaw img').css({left:(alignLeft+8)+"px"});
                        }
                    },
                    photoTemplate : '<div class="photo-browser-slide slider-slide"><span class="photo-browser-zoom-container"><img src="{{url}}" class="align-claw-to-this"><span class="theClaw"></span></span></div>'
                });
                myPhotoBrowserStandalone.open();
            });
        } else {
            appMain.loadPage('purchase.html');
        }
}

function buyComix( data, event ){
    if( context.user.billing_zip() != '' ) {
        // console.log(context.comix.name());
        // console.log(data);
        if( context.user.payment_id() != '' ){
            appFramework.confirm('Are you sure you wish to purchase ' + data.name() + '?', 'Confirm Purchase', function () {
                context.comix = data;
                appFramework.showIndicator();
                amplify.request('submitPayment', { UUID: context.UUID(), ID: context.comix.id() }, function (submitResponse) {
                    // console.log(submitResponse);
                    if( submitResponse.status ) {
                        successfulPurchase( submitResponse );
                    } else {
                        appFramework.alert(response.error.message,"Purchase Error");
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
