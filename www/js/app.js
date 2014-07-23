var debugMode = true;
var appFramework = new Framework7();
var $$ = Framework7.$;
var mainView = appFramework.addView('.view-main', {
    dynamicNavbar: true,
    init: false,
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
    mainView.loadPage('register.html');
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
var vmComixManifest = {
    manifest: ko.observableArray()
};

var chesterComix = {
    init: function () {
        // navigator.splashscreen.show();
        this.bindRequests();
        this.bindEvents();
    },
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function () {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        ko.applyBindings( vmComixManifest, document.getElementById('comix-manifest') );
        // temp
        this.onDeviceReady();
    },
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'chesterComix.receivedEvent(...);'
    onDeviceReady: function () {
        chesterComix.checkAuthentication();
        amplify.request("comixManifest", {}, function (response) {
            jQuery.each(response.comix, function (i, comix) {
                var comixItem = new comixObject(
                    comix.ID,
                    comix.name,
                    comix.description,
                    comix.thumb,
                    comix.owned
                    ) ;
                vmComixManifest.manifest.push( comixItem );
            });
        });
        appFramework.init();
    },
    checkAuthentication: function(){
        // appFramework.showPreloader('loading...');
        // setTimeout(function () {
        //     appFramework.hidePreloader();
        // }, 2000);
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
    }
};

chesterComix.init();









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


