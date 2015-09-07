var qs = (function (a) {
    'use strict';
    if (a === "") {
        return {};
    }
    var b = {};
    for (var i = 0; i < a.length; ++i){
        var p=a[i].split('=');
        if (p.length != 2) continue;
        b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
    }
    return b;
})(window.location.search.substr(1).split('&'));

var debugMode = qs['debug'] != 'undefined' ? Boolean(qs.debug) : false;
var deviceMode =navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry|IEMobile)/) ? true : false;
var myPhotoBrowserStandalone = null;


var IAP = {
  list: []
};

// log both in the console and in the HTML #log element.
var log = function(arg) {
    try {
        if (typeof arg !== 'string')
            arg = JSON.stringify(arg);
        console.log(arg);
        document.getElementById('log').innerHTML += '<div>' + arg + '</div>';
    } catch (e) {}
};

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

$$('.open-external').on('click', function () {
    window.analytics.trackEvent('UserEvent', 'tap', 'open-external');
    appFramework.popup('.popup-external');
});
function openDeviceBrowser(externalLinkToOpen){
    window.open(externalLinkToOpen, '_system', 'location=no');
}
$$('.panel-left').on('open', function () {
    window.analytics.trackEvent('UserEvent', 'tap', 'open-menu');
    var element = document.getElementById('app-flyout-panel');
    ko.cleanNode( element );
    ko.applyBindings( vmAppSideNavigation, element );

    amplify.request('remoteSidebar',{},function(response){
        if( response.status ){
            vmAppSideNavigation.modules([]);
            $.each(response.sidebar, function(i, module){
                vmAppSideNavigation.modules.push({
                    title: module.title,
                    image: module.image,
                    link: "openDeviceBrowser('" + module.link + "')"
                });
            });
        }
    });
});

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
    UUID: ko.observable('')
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
    allowBack: ko.observable(false)
};
var vmAppSideNavigation = {
    applied: false,
    bookshelf: ko.observable(0),
    modules: ko.observableArray()
};
var vmPurchase = {
    owned: false,
    buyComixNow: buyComix
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
    initStoreCompleted: false,
    // init the Apple IAP
    initStore: function(){

        fetchManifest();

        if( this.initStoreCompleted )
            return;

        if (!window.store) {
            appFramework.addNotification({
                hold: 1500,
                title: 'In-App purchase disabled',
                message: 'In-App purchase encountered an error during startup. Please restart the app to reset.',
            });
            return;
        }

        // Enable maximum logging level
        store.verbosity = store.ERROR;

        // Enable remote receipt validation
        // store.validator = "https://api.fovea.cc:1982/check-purchase";
        store.validator = function(product, callback){
            callback(true, product);
        };

        // Log all errors
        store.error(function(error) {
            console.log(error);
            appFramework.addNotification({
                hold: 3000,
                title: 'In-App purchase error',
                message: 'IAP ERROR ' + error.code + ': ' + error.message,
            });
        });

        // inform the store of your registered product
        storeRegisterProducts().done(function(){
            store.refresh();
            
            var newManifest = [];
             $.each(vmComixManifest.manifest(), function( key, comix ){
                 var product = store.get( comix.iap() );
                 newManifest[key] = comix;
                             
                 store.when(comix.iap()).updated(function(){
                     newManifest[key].owned( 'true' );
                 });
                 
                 // When purchase of the product is approved,
                 // show some logs and finish the transaction.
                 store.when(comix.iap()).approved(function (order) {
                     successfulPurchase( order );
                     order.finish();
                 });

                 if( vmComixManifest.manifest().length-1 === key ){
                     vmComixManifest.manifest(newManifest);
                     // When the store is ready (i.e. all products are loaded and in their "final"
                     // state), we hide the "loading" indicator.
                     //
                     // Note that the "ready" function will be called immediately if the store
                     // is already ready.
                     store.ready(function() {
                         alert('store ready');
                         appFramework.hidePreloader();
                     });
                    store.refresh();
                    chesterComix.initStoreCompleted = true;
                 }
             });

        });


    },
    onDeviceReady: function () {


        chesterComix.initStore();

        window.analytics.startTrackerWithId('UA-48983835-1');

        appFramework.onPageInit('index', function (page) {
            window.analytics.trackView('Dashboard');
            var element = document.getElementById('comix-index');
            ko.cleanNode(element);
            ko.applyBindings( vmComixIndex, element );
        });

        appFramework.onPageInit('purchase', function (page) {
            window.analytics.trackView('Purchase');
            vmAppTopNavigation.allowBack(true);
            var element = document.getElementById('comix-purchase');
            ko.cleanNode(element);
            ko.applyBindings( vmPurchase, element );
        });
        appFramework.onPageBeforeRemove('purchase',function (page){
            vmAppTopNavigation.allowBack(false);
        });

        appFramework.onPageInit('settings', function (page) {
            window.analytics.trackView('Settings');
            var element = document.getElementById('app-settings');
            ko.cleanNode(element);
            ko.applyBindings( vmAppSettings, element );
        });
        appFramework.onPageBeforeAnimation('index', function (page) {
            appFramework.closePanel();
        });

        appFramework.onPageBeforeAnimation('settings', function (page) {
            appFramework.closePanel();
        });

        appFramework.onPageInit('detect', function (page) {
            window.analytics.trackView('Detect');
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
                                vmRemotePageDetect.manifest()[ key ].unlocked( "true" );
                            }
                        });
                    }
                    appFramework.hidePreloader();
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
            window.analytics.trackView('About');
            setupRemotePage('remotePage-about', vmRemotePageAbout, 'remotePageAbout');
        });
        appFramework.onPageBeforeAnimation('author', function (page) {
            window.analytics.trackView('Author');
            setupRemotePage('remotePage-author', vmRemotePageAuthorBio, 'remotePageAuthorBio');
        });
        appFramework.onPageBeforeAnimation('credits', function (page) {
            window.analytics.trackView('Credits');
            setupRemotePage('remotePage-credits', vmRemotePageCredits, 'remotePageCredits');
        });
        appFramework.onPageBeforeAnimation('legal', function (page) {
            window.analytics.trackView('Legal');
            setupRemotePage('remotePage-legal', vmRemotePageLegal, 'remotePageLegal');
        });

        appFramework.init();
    }

};

chesterComix.init();


function fetchManifest(){

    window.analytics.trackEvent('SystemEvent', 'serverCall', 'FetchManifest');

    var bookshelf = 0;
    amplify.request("comixManifest", { UUID: context.UUID(), res: { w: $(window).width(), h: $(window).height() } }, function (response) {
        // console.log(response);
        jQuery.each(response.comix, function (i, comix) {
            if( comix.iap != '' ){
                IAP.list.push({ id: comix.iap, alias: comix.alias });
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
            // if( comix.owned.toString() == 'true' ){
            //     bookshelf++;
            //     vmAppSideNavigation.bookshelf( bookshelf );
            // }
            var foundItem = ko.utils.arrayFirst(vmComixManifest.manifest(), function(existingItem) {
                    return existingItem.id() == comixItem.id();
                });
            if( !foundItem ){
                vmComixManifest.manifest.push( comixItem );
            }
        });
    });
}

function generateGoogleMap(){
    window.analytics.trackEvent('SystemEvent', 'serverCall', 'generateGoogleMap');
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

            });


        }
    });
}
function restorePurchase(data, event){
    window.analytics.trackEvent('UserEvent', 'tap', 'RestorePurchase');
    appFramework.alert('Attempting to restore your purchased comix.', 'Restore Attempt');
    store.refresh();
}
function clearLocalData( data, event ){
    window.analytics.trackEvent('UserEvent', 'tap', 'ClearLocalData');
    amplify.sqlite.instance.clear();
    appFramework.alert('Successfully cleared local data', 'Data Cleared');
}

function gotoComixPage( data, event ){
    window.analytics.trackEvent('UserEvent', 'tap', 'ViewComix', data.id() );
        context.comix = data;
        
        // another store refresh for ownership
        store.refresh();
        var product = store.get( data.iap() );
        if( product.owned ){
            data.owned( 'true' );
        }
        
        if( data.owned() == 'true'){
            amplify.request("comixManifest", { UUID: context.UUID(), ID: data.id(), res: { w: $(window).width(), h: $(window).height() } }, function (response) {
                myPhotoBrowserStandalone = appFramework.photoBrowser({
                    expositionHideCaptions: false,
                    toolbarTemplate: '<div class="toolbar tabbar"><div class="toolbar-inner"><a href="#" class="link photo-browser-index photo-browser-link-inactive"><i class="icon-iconmonstr-arrow-48-icon icon-direction-rotate-180"></i> <span>First</span></a><a href="#" class="link photo-browser-prev"><i class="icon-iconmonstr-arrow-37-icon icon-direction-rotate-180"></i> <span>Previous</span></a><a href="#" class="link photo-browser-next"><span>Next</span> <i class="icon-iconmonstr-arrow-37-icon"></i></a></div></div>',
                    photos : response.comix[0].panels,
                    onOpen: function(photobrowser){
                        var activeSlide = $('.slider-slide-active');
                        if( activeSlide.find('.align-claw-to-this').attr('alt') == '' ){
                            activeSlide.find('.align-claw-to-this').attr('alt',  response.comix[0].description );
                        }

                        setTimeout(function(){
                            amplify.sqlite.instance.get('onResumeGoTo_' +  data.id() ).done(function( slideContext ){
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
                            activeSlide.find('.align-claw-to-this').attr('alt',  caption );
                        }

                        // claw
                        if( response.comix[0].panels[ slider.activeSlideIndex ].link != '' && isEmptyElement($('.slider-slide-active').find('.theClaw')) ){

                            var position = activeSlide.find('.align-claw-to-this').position();
                            if( position ) {
                                activeSlide.find('.theClaw').html('<a href="#" onclick="openDeviceBrowser(\'' + response.comix[0].panels[ slider.activeSlideIndex ].link + '\')"><img src="img/iCLAWscreen.png" /></a>');
                                activeSlide.find('.theClaw img').css({left:(position.left+8)+"px"});
                            }

                        }


                        var resumeContext = {
                            comix: context.comix,
                            slide: slider.activeSlideIndex
                        };
                        amplify.sqlite.instance.put('onResumeGoTo_' +  data.id(), resumeContext, 0 ).done(function(){
                            // console.log('save onResumeGoTo_' +  data.id(),resumeContext);
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
            gotoComixPage(comix);
        }
    });
    // gotoComixPage
}

function storeRegisterProducts(){
    var deferred = $.Deferred();
    if( store.products.length != IAP.list.length ){
        for(var i=0;i<IAP.list.length;i++){
            store.register({
               id:    IAP.list[i].id,
               alias: IAP.list[i].alias,
               type:   store.NON_CONSUMABLE
           });
        }
        store.refresh();
        deferred.resolve( store.products );
    }
    return deferred.promise();
}

function buyComix( data, event ){
        if( data.iap() ){
            appFramework.confirm('Are you sure you wish to purchase ' + data.name() + '?', 'Confirm Purchase', function () {
                storeRegisterProducts().done(function(){
                    store.order( data.iap() );
                });
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
