var debugMode = false;
var UUID = 'f06ca12c760a48bb';




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


var comixObject = function(id, name, description, thumb, owned){
    owned = owned || false;
    return {
        thumb: ko.observable( thumb ),
        id: ko.observable( id ),
        owned: ko.observable( owned ),
        name: ko.observable( name ),
        description: ko.observable( description )
    }
};

var vmComixApplication = {
    authenticated: ko.observable(),
    context: new comixObject,
    comix: new comixObject,
    manifest: ko.observableArray(),
    gotoComix: function( data, event ){
        vmComixApplication.context = data;
        if( data.owned() == 'true'){
            console.log(data.owned(), data.id());
            // photobrowser
        } else {
            appMain.loadPage('purchase.html');
            console.log(vmComixApplication.context.id());
        }
        
    }
};



var context = {
    comix: new comixObject,
    authenticated: ko.observable(false),
    UUID: ko.observable( UUID )
};
var vmComixManifest = {
    manifest: ko.observableArray()
    
};
// vmComixManifest.manifest.subscribe(function(newValue){

// });
var vmComixIndex = {
    manifest: vmComixManifest.manifest,
    gotoComix: function( data, event ){
        context.comix = data;
        if( data.owned() == 'true'){
            console.log(data.owned(), data.id());
            // photobrowser
        } else {
            appMain.loadPage('purchase.html');
        }
        
    }
};
var vmAppTopNavigation = {
    authenticated: context.authenticated,
    allowBack: ko.observable(false)
};
var vmPurchase = {

};
var vmAccount = {

};
var vmRegister = {
    UUID: context.UUID
}

var vmAppSettings = {
    version: ko.observable()
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
        document.addEventListener('deviceready', this.onDeviceReady, false);
        // ko.applyBindings( vmComixApplication );
        ko.applyBindings( vmComixIndex, document.getElementById('comix-index') );
        ko.applyBindings( vmAppTopNavigation, document.getElementById('app-navbar') );
        // temp
        this.onDeviceReady();
    },
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'chesterComix.receivedEvent(...);'
    onDeviceReady: function () {
        chesterComix.checkAuthentication();
        fetchManifest()
        
        appFramework.onPageInit('index', function (page) {
            ko.applyBindings( vmComixIndex, document.getElementById('comix-index') );
            fetchManifest();    
        });
        appFramework.onPageInit('bookshelf', function (page) { 
            
        });
        appFramework.onPageInit('purchase', function (page) {
            vmAppTopNavigation.allowBack(true);
            ko.applyBindings( vmPurchase, document.getElementById('comix-purchase') );
        });
        appFramework.onPageBeforeRemove('purchase',function (page){
            vmAppTopNavigation.allowBack(false);
        });
        appFramework.onPageInit('account', function (page) {
            vmAppTopNavigation.allowBack(true);
            ko.applyBindings( vmAccount, document.getElementById('app-account') );
        });
        appFramework.onPageBeforeRemove('account',function (page){
            vmAppTopNavigation.allowBack(false);
        });
        appFramework.onPageInit('settings', function (page) {
        });
        appFramework.onPageInit('register', function (page){
            ko.applyBindings( vmRegister, document.getElementById('app-register'));
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
        appFramework.onPageBeforeAnimation('about', function (page) {
            appFramework.closePanel();
        });
        appFramework.onPageBeforeAnimation('bookshelf', function (page) {
            appFramework.closePanel();
        });
        appFramework.onPageBeforeAnimation('credits', function (page) {
            appFramework.closePanel();
        });
        appFramework.onPageBeforeAnimation('settings', function (page) {
            appFramework.closePanel();
        });



        appFramework.init();
    },
    checkAuthentication: function(){
        appFramework.loginScreen();
        appFramework.showPreloader('loading...');
        
        amplify.request('userAuth',{ UUID: context.UUID() }, function(response){
            if( response.status ) {
                context.authenticated(true);
                appFramework.hidePreloader();
                appFramework.closeModal();
                appFramework.addNotification({
                    hold: 1500,
                    title: 'Login successful',
                    message: 'You are logged in successfully. Thank you for supporting Chester Comix!',
                });
            } else {
                appFramework.hidePreloader();
            }
        });
    },
    bindRequests: function(){
        var comixManifestUrl = !debugMode ? "http://www.chestercomix.com/app/api/comix/" : "js/data/manifest.json";
        amplify.request.define("comixManifest", "ajax", {
            url: comixManifestUrl,
            dataType: "json",
            // beforeSend: function (_xhr, _ajaxSettings) {
            //     appFramework.showPreloader('loading...');
            // },
            type: "POST",
            cache: "persist"
        });

        amplify.request.define("comixPayload", "ajax", {
            url: "http://www.chestercomix.com/app/api/comix/",
            dataType: "json",
            beforeSend: function (_xhr, _ajaxSettings) {
                _xhr.overrideMimeType("text/plain; charset=x-user-defined");
                _ajaxSettings.url = decodeURIComponent(_ajaxSettings.data).replace('payloadURL=', '');
            },
            type: "POST",
            cache: "persist"
        });

        amplify.request.define("userAuth", "ajax", {
            url: "http://www.chestercomix.com/app/api/auth-user/",
            dataType: "json",
            type: "POST",
            cache: "persist"
        });
    }
};

chesterComix.init();


function fetchManifest(){
    amplify.request("comixManifest", {}, function (response) {
        jQuery.each(response.comix, function (i, comix) {
            var comixItem = new comixObject(
                comix.ID,
                comix.name,
                comix.description,
                comix.thumb,
                comix.owned
                ) ;
            var foundItem = ko.utils.arrayFirst(vmComixManifest.manifest(), function(existingItem) {
                    return existingItem.id == comixItem.id;
                });
            if( !foundItem ){
                vmComixManifest.manifest.push( comixItem );    
            }
        });
    });
}






// Add view




// $$('.open-preloader-title').on('click', function () {
//     myApp.showPreloader('Custom Title')
//     setTimeout(function () {
//         myApp.hidePreloader();
//     }, 2000);
// });

// myApp.onPageBeforeInit('index',function (page) {
//     alert('function (page)');
// });

// Callbacks to run specific code for specific pages, for example for About page:
// myApp.onPageInit('index', function (page) {
//     myApp.showPreloader('Custom Title');
//     // myApp.showIndicator();
//     // myApp.showPreloader('Checking credentials');

//     // $$('.open-preloader').on('click', function () {
//     //     myApp.showPreloader();
//     //     setTimeout(function () {
//     //         myApp.hidePreloader();
//     //     }, 2000);
//     // });

// });

// myApp.onPageInit('login-screen', function (page) {
//   var pageContainer = $$(page.container);
//   pageContainer.find('.list-button').on('click', function () {
//     var username = pageContainer.find('input[name="username"]').val();
//     var password = pageContainer.find('input[name="password"]').val();
//     // Handle username and password
//     myApp.alert('Username: ' + username + ', Password: ' + password, function () {
//       mainView.goBack();
//     });
//   });
// }); 


