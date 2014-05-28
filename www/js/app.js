/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
amplify.request.define("comixManifest", "ajax", {
    url: "http://www.chestercomix.com/app/api/comix/",
    dataType: "json",
    beforeSend: function (_xhr, _ajaxSettings) {
        $('#loading').fadeIn();
    },
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


var gaPlugin;
var app = {
    // Application Constructor
    initialize: function () {
        navigator.splashscreen.show();
        showSpinner('loading');
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function () {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function () {
        app.receivedEvent('deviceready');
        gaPlugin = window.plugins.gaPlugin;
        // Note: A request for permission is REQUIRED by google. You probably want to do this just once, though, and remember the answer for subsequent runs.
        navigator.notification.confirm('We would like your permission to collect usage data. No personal or user identifiable data will be collected.', this.trackingPermission, 'Attention', 'Allow,Deny');
        window.plugins.toast.showShortCenter("Device Ready");








        // $('click').on("click", function(event){
        $(document.body).on('click', 'click', function (event) {
            event.preventDefault();

            // gotopage
            if ($(this).data('gotopage') != null) {
                console.log("goto " + $(this).data('gotopage'));
                $('.appPage').hide().siblings('#' + $(this).data('gotopage')).fadeIn();
                switch ($(this).data('gotopage')) {
                    case 'reader':
                        $('#nav-dashboard').hide();
                        $('#nav-reader').show();
                        $('nav.navigation-bar').animate({
                            top: "0px",
                            opacity: 1
                        }, "fast").delay(800).animate({
                            top: "+=-45px",
                            opacity: 0
                        }, "fast");

                        var comicZipLocation = 'http://chestercomix.com/app/wp-content/uploads/comix/the-battle-of-little-bighorn.zip',
                            comicZip = null,
                            comicManifest = [];

                        // $('#loading').fadeIn();

                        var showNav = false;
                        var slidesInDOM = $('#slides').swiper({
                            createPagination: false,
                            // calculateHeight: true,
                            centeredSlides: true,
                            visibilityFullFit: true,
                            // cssWidthAndHeight:true,
                            onSlideTouch: function (swiper) {
                                $.doTimeout('showNav', 100, function () {
                                    if (!showNav) {
                                        showNav = true;
                                        $('nav.navigation-bar').css('z-index', 9999).animate({
                                            top: "0px",
                                            opacity: 1
                                        }, "fast");
                                    }
                                });
                            },
                            onTouchEnd: function (swiper) {
                                $.doTimeout('showNav', 2000, function () {
                                    if (showNav) {
                                        showNav = false;
                                        $('nav.navigation-bar').animate({
                                            top: "+=-45px",
                                            opacity: 0
                                        }, "fast").css('z-index', 0);
                                    }
                                });
                            },
                            onSlideChangeEnd: function (swiper) {
                                // load next image
                                // comicZip != null &&
                                if (swiper.slides.length < comicManifest.length && swiper.activeIndex + 1 >= swiper.slides.length) {
                                    // addSlideToReader( comicManifest[ swiper.activeIndex+1 ], comicZip, slidesInDOM );
                                    addSlideToReader(comicManifest[swiper.activeIndex + 1], slidesInDOM);
                                }
                            }
                        });

                        // console.log('fetch: ' + $(this).data('id'));
                        amplify.request("comixManifest", {
                            "ID": $(this).data('id')
                        }, function (response) {
                            if (response.comix.length > 0) {
                                comicManifest = response.comix[0].panels;
                                jQuery.each(response.comix[0].panels, function (i, image) {
                                    addSlideToReader(image, slidesInDOM);
                                    if (i == 3)
                                        return false;
                                });
                            }
                            $('#loading').fadeOut();
                            console.log(response);
                            // amplify.request( "comixPayload", { "payloadURL": response.comix[0].payload }, function( data ){
                            //   // console.log('got zip');
                            //   comicZip = new JSZip(data);
                            // });
                            // $.ajax({
                            //   url: response.comix[0].payload,
                            //   beforeSend: function( xhr ) {
                            //     // console.log('getting zip');
                            //     xhr.overrideMimeType( "text/plain; charset=x-user-defined" );
                            //   },
                            //   success: function( data, status, xhr ){
                            //     // console.log('got zip');
                            //     comicZip = new JSZip(data);
                            //     var manifestRAW = comicZip.file("comix.json").asBinary();
                            //     // console.log( 'listRAW: ' + listRAW);
                            //     comicManifest = jQuery.parseJSON( manifestRAW );
                            //     // alert(fileList);

                            //     jQuery.each( comicManifest, function( i, file ) {

                            //       // append image
                            //       addSlideToReader( file, comicZip, slidesInDOM );

                            //         if( i == 3)
                            //             return false;
                            //     });

                            //     $('#loading').fadeOut();

                            // }});

                        });




                        break;
                    case 'shop':
                    case 'bookshelf':
                        $('#nav-dashboard').show();
                        $('#nav-reader').hide();
                        if ($("#bookshelf-list").is(':empty')) {

                            amplify.request("comixManifest", {}, function (response) {
                                $('#loading').fadeOut('fast');
                                var tiles = [];
                                jQuery.each(response.comix, function (i, comix) {
                                    if( comix.owned ) {
                                        // var gotopage = comix.owned ? 'reader' : 'purchase';
                                        var tile = $('<click>').attr('data-gotopage', 'reader').attr('data-id', comix.ID),
                                            wrapper = $('<div>').addClass('tile ol-transparent'),
                                            content = $('<div>').addClass('tile-content'),
                                            img = $('<img>').attr('src', comix.thumb);
                                        content.append(img);
                                        wrapper.append(content);
                                        tile.append(wrapper);
                                        $("#bookshelf-list").append(tile);
                                    }
                                });
                            });

                        }
                        break;
                    case 'support':
                        $('#deviceProperties').html('Device Name: ' + device.name + '<br />' +
                        'Device PhoneGap: ' + device.phonegap + '<br />' +
                        'Device Platform: ' + device.platform + '<br />' +
                        'Device UUID: ' + device.uuid + '<br />' +
                        'Device Version: ' + device.version + '<br />');
                        break;
                    case 'signin':
                        break;
                    default:
                        // $('nav.navigation-bar').css('z-index',0).animate({
                        //         top: "0px",
                        //         opacity: 1
                        //       },"fast");

                        $('.appPage').hide();
                        $('#nav-signin').show();
                        // $('nav.navigation-bar').animate({
                        //     top: "0px",
                        //     opacity: 1
                        //   },"fast");
                        break;
                }
            }

            // checkLoaded();

            //    // slideshow
            //   if( $(this).data('gotoslide') != null ) {
            //         switch( $(this).data('gotoslide') ){
            //           case 'first':
            //             slide = 0;
            //             break;
            //           case 'last':
            //             slide = slidesInDOM.slides.length-1;
            //             break;
            //           default:
            //             slide = isNormalInteger( $(this).data('gotoslide') ) ? $(this).data('gotoslide') : 0;
            //             break;
            //         }

            //       slidesInDOM.swipeTo(slide);
            //   }
            // });

        });





    },
    // Update DOM on a Received Event
    receivedEvent: function (id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    },

    trackingPermission: function (button) {
        if (button === 1)
            gaPlugin.init(this.trackingSuccess, this.trackingError, "UA-48983835-1", 10);
    },

    trackingSuccess: function (result) {
        //alert('nativePluginResultHandler - '+result);
        console.log('nativePluginResultHandler: ' + result);
    },

    trackingError: function (error) {
        //alert('nativePluginErrorHandler - '+error);
        console.log('nativePluginErrorHandler: ' + error);
    }
};







app.initialize();







function showSpinner(target) {
    var opts = {
        lines: 9, // The number of lines to draw
        length: 29, // The length of each line
        width: 8, // The line thickness
        radius: 35, // The radius of the inner circle
        corners: 1, // Corner roundness (0..1)
        rotate: 0, // The rotation offset
        direction: 1, // 1: clockwise, -1: counterclockwise
        color: '#000', // #rgb or #rrggbb or array of colors
        speed: 1, // Rounds per second
        trail: 64, // Afterglow percentage
        shadow: false, // Whether to render a shadow
        hwaccel: false, // Whether to use hardware acceleration
        className: 'spinner', // The CSS class to assign to the spinner
        zIndex: 2e9, // The z-index (defaults to 2000000000)
        top: 'auto', // Top position relative to parent in px
        left: 'auto' // Left position relative to parent in px
    };
    target = document.getElementById(target);
    var spinner = new Spinner(opts).spin(target);
}

function addSlideToReaderFromZip(file, bundle, slider, direction) {
    file = file || false;
    direction = direction || 'append';
    if (!file)
        return false;
    var tmpFile = "data:";
    switch (getFileExtension(file).toLowerCase()) {
    case 'gif':
        tmpFile += "image/gif;base64,";
        break;
    case 'png':
        tmpFile += "image/png;base64,";
        break;
    case 'jpg':
    case 'jpeg':
        tmpFile += "image/jpeg;base64,";
        break;
    }
    tmpFile += base64_encode(bundle.file(file).asBinary());
    addSlideToReader(tmpFile, slider, direction);
}

function addSlideToReader(file, slider, direction) {
    file = file || false;
    direction = direction || 'append';
    if (!file)
        return false;
    var newSlide = slider.createSlide('<img src="' + file + '" />');
    if (direction == 'append') {
        newSlide.append();
    } else {
        newSlide.prepend();
    }
}