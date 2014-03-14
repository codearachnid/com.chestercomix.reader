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
var gaPlugin;
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
        gaPlugin = window.plugins.gaPlugin;
        // Note: A request for permission is REQUIRED by google. You probably want to do this just once, though, and remember the answer for subsequent runs.
        navigator.notification.confirm('We would like your permission to collect usage data. No personal or user identifiable data will be collected.', this.trackingPermission, 'Attention', 'Allow,Deny');
        
        
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    },

    trackingPermission: function( button ){
        if (button === 1)
            gaPlugin.init(this.trackingSuccess, this.trackingError, "UA-48983835-1", 10);
    },

    trackingSuccess: function( result ){
        //alert('nativePluginResultHandler - '+result);
        console.log('nativePluginResultHandler: '+result);
    },

    trackingError: function( error ){
        //alert('nativePluginErrorHandler - '+error);
        console.log('nativePluginErrorHandler: '+error);
    }
};

$(document).ready(function(){


  
  $('click').on("click", function(event){
     event.preventDefault();

     // gotopage
     if( $(this).data('gotopage') != null ){
        $('.appPage').hide().siblings('#' + $(this).data('gotopage') ).fadeIn();
        switch( $(this).data('gotopage') ){
            case 'reader':
                $('#nav-dashboard').fadeOut();
                $('#nav-reader').fadeIn();
                $('nav.navigation-bar').animate({
                    top: "0px",
                    opacity: 1
                  },"fast").delay( 800 ).animate({
                      top: "+=-45px",
                      opacity: 0
                    },"fast");
                break;
            default:
                $('#nav-dashboard').fadeIn();
                $('#nav-reader').fadeOut();
                $('nav.navigation-bar').animate({
                    top: "0px",
                    opacity: 1
                  },"fast");
                break;
        }
     }

     // slideshow
    if( $(this).data('gotoslide') != null ) {
          switch( $(this).data('gotoslide') ){
            case 'first':
              slide = 0;
              break;
            case 'last':
              slide = slidesInDOM.slides.length-1;
              break;
            default:
              slide = isNormalInteger( $(this).data('gotoslide') ) ? $(this).data('gotoslide') : 0;
              break;
          }

        slidesInDOM.swipeTo(slide);
    }
  });

});