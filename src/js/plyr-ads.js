// ==========================================================================
// Plyr-Ads
// plyr-ads.js v0.0.7
// https://github.com/ferdiemmen/plyr-ads
// License: The MIT License (MIT)
// ==========================================================================
// Credits: Copyright 2013 Google Inc. All Rights Reserved.
//          You may study, modify, and use this example for any purpose.
//          Note that this example is provided "as is", WITHOUT WARRANTY
//          of any kind either expressed or implied.
// ==========================================================================

;(function (root, factory) {
    'use strict';
    /*global define,module*/

    if (typeof module === 'object' && typeof module.exports === 'object') {
        // Node, CommonJS-like
        module.exports = factory(root, document);
    } else if (typeof define === 'function' && define.amd) {
        // AMD
        define([], function () { return factory(root, document); });
    } else {
        // Browser globals (root is window)
        root.plyrAds = factory(root, document);
    }
}(typeof window !== 'undefined' ? window : this, function (window, document) {
    'use strict';

    // Default config
    var defaults = {
        container: 'plyr-ads',
        classes: [],
        skipButton: {
            enabled: true,
            text: 'Skip ad'
        }
    };

    // Check variable types.
    var _is = {
        object: function (input) {
            return input !== null && typeof (input) === 'object';
        },
        array: function (input) {
            return input !== null && (typeof (input) === 'object' && input.constructor === Array);
        },
        number: function (input) {
            return input !== null && (typeof (input) === 'number' && !isNaN(input - 0) || (typeof input === 'object' && input.constructor === Number));
        },
        string: function (input) {
            return input !== null && (typeof input === 'string' || (typeof input === 'object' && input.constructor === String));
        },
        boolean: function (input) {
            return input !== null && typeof input === 'boolean';
        },
        nodeList: function (input) {
            return input !== null && input instanceof NodeList;
        },
        htmlElement: function (input) {
            return input !== null && input instanceof HTMLElement;
        },
        function: function (input) {
            return input !== null && typeof input === 'function';
        },
        undefined: function (input) {
            return input !== null && typeof input === 'undefined';
        }
    };

    function PlyrAds(plyr, options) {
        this.adsManager;
        this.adsLoader;
        this.intervalTimer;
        this.plyr = plyr;
        this.options = options;
        this.plyrContainer = plyr.getContainer();
        this.adDisplayContainer;

        // Check if the Google IMA3 SDK is present.
        if (!window.google) {
            throw new Error('The Google IMA3 SDK is not loaded.');
        }

        // Add ad container to DOM.
        this.createAdDisplayContainer();

        // Setup IMA.
        this.setUpIMA();
    }

    PlyrAds.prototype.playAds = _playAds;
    PlyrAds.prototype.playVideo = _playVideo;
    PlyrAds.prototype.setUpIMA = _setUpIMA;
    PlyrAds.prototype.createAdDisplayContainer = _createAdDisplayContainer;
    PlyrAds.prototype.onAdEvent = _onAdEvent;
    PlyrAds.prototype.onAdError = _onAdError;
    PlyrAds.prototype.onAdsManagerLoaded = _onAdsManagerLoaded;
    PlyrAds.prototype.onContentResumeRequested = _onContentResumeRequested;
    PlyrAds.prototype.onContentSkippable = _onContentSkippable;

    function _createAdDisplayContainer() {
        this.adDisplayContainer = new google.ima.AdDisplayContainer(
            this.plyr.getContainer());
        this.adDisplayContainer.I.setAttribute('class', 'plyr-ads');
        this.adDisplayContainer.I.addEventListener(_getStartEvent(), function() {
            this.playAds();
        }.bind(this), false);
    }

    function _getStartEvent() {
        // Set the correct event based on userAgent.
        var startEvent = 'click';
        if (navigator.userAgent.match(/iPhone/i) ||
            navigator.userAgent.match(/iPad/i) ||
            navigator.userAgent.match(/Android/i)) {
            startEvent = 'touchend';
        }
        return startEvent;
    }

    // Prepend child
    function _prependChild(parent, element) {
        return parent.insertBefore(element, parent.firstChild);
    }

    // Set attributes
    function _setAttributes(element, attributes) {
        for (var key in attributes) {
            element.setAttribute(key, (_is.boolean(attributes[key]) && attributes[key]) ? '' : attributes[key]);
        }
    }

    // Insert a HTML element
    function _insertElement(type, parent, attributes) {
        // Create a new <element>
        var element = document.createElement(type);

        // Set all passed attributes
        _setAttributes(element, attributes);

        // Inject the new element
        return _prependChild(parent, element);
    }

    function _playVideo() {
        this.adDisplayContainer.I.remove();
        this.plyr.play();
    }

    function _setUpIMA() {
        // Create ads loader.
        this.adsLoader = new google.ima.AdsLoader(this.adDisplayContainer);
        // Listen and respond to ads loaded and error events.
        this.adsLoader.addEventListener(
            google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED,
            function (e) {
                this.onAdsManagerLoaded(e);
            }.bind(this),
            false);
        this.adsLoader.addEventListener(
            google.ima.AdErrorEvent.Type.AD_ERROR,
            function (adError) {
                this.adDisplayContainer.I.remove();
            }.bind(this),
            false);

        // Request video ads.
        var adsRequest = new google.ima.AdsRequest();
        adsRequest.adTagUrl = this.options.adTagUrl;
        this.adsLoader.requestAds(adsRequest);
    }

    function _playAds() {

        // Initialize the container. Must be done via a user action on mobile devices.
        this.adDisplayContainer.initialize();

        // Initialize the ads manager. Ad rules playlist will start at this time.
        this.adsManager.init(this.plyrContainer.offsetWidth, this.plyrContainer.offsetHeight, google.ima.ViewMode.NORMAL);

        // Call play to start showing the ad. Single video and overlay ads will
        // start at this time; the call will be ignored for ad rules.
        console.log(this.adsManager);
        this.adsManager.start();
    }

    function _onAdsManagerLoaded(adsManagerLoadedEvent) {
        // Get the ads manager.
        var adsRenderingSettings = new google.ima.AdsRenderingSettings();
        adsRenderingSettings.restoreCustomPlaybackStateOnAdBreakComplete = true;
        this.adsManager = adsManagerLoadedEvent.getAdsManager(adsRenderingSettings);

        // Add listeners to the required events.
        this.adsManager.addEventListener(
            google.ima.AdErrorEvent.Type.AD_ERROR,
            function (e) {
                this.onAdError(e);
            }.bind(this));
        this.adsManager.addEventListener(
            google.ima.AdEvent.Type.CONTENT_RESUME_REQUESTED,
            function (e) {
                this.onContentResumeRequested(e);
            }.bind(this));
        this.adsManager.addEventListener(
            google.ima.AdEvent.Type.SKIPPABLE_STATE_CHANGED,
            function (e) {
                this.onContentSkippable(e);
            }.bind(this));
        this.adsManager.addEventListener(
            google.ima.AdEvent.Type.ALL_ADS_COMPLETED,
            function (e) {
                this.onAdEvent(e);
            }.bind(this));

        // Listen to any additional events, if necessary.
        this.adsManager.addEventListener(
            google.ima.AdEvent.Type.LOADED,
            function (e) {
                this.onAdEvent(e);
            }.bind(this));
        this.adsManager.addEventListener(
            google.ima.AdEvent.Type.STARTED,
            function (e) {
                this.onAdEvent(e);
            }.bind(this));
        this.adsManager.addEventListener(
            google.ima.AdEvent.Type.COMPLETE,
            function (e) {
                this.onAdEvent(e);
            }.bind(this));

        // Listen to the resizing of the window. And resize
        // ad accordingly.
        window.addEventListener(
            'resize',
            function (e) {
                this.adsManager.resize(
                    this.plyrContainer.offsetWidth,
                    this.plyrContainer.offsetHeight,
                    google.ima.ViewMode.NORMAL);
            }.bind(this));
    }

    function _onAdEvent(adEvent) {
        // Retrieve the ad from the event. Some events (e.g. ALL_ADS_COMPLETED)
        // don't have ad object associated.
        var ad = adEvent.getAd();
        switch (adEvent.type) {
            case google.ima.AdEvent.Type.LOADED:
                // This is the first event sent for an ad - it is possible to
                // determine whether the ad is a video ad or an overlay.
                if (!ad.isLinear()) {
                    // Position AdDisplayContainer correctly for overlay.
                    // Use ad.width and ad.height.
                    this.playVideo();
                }
                break;
            case google.ima.AdEvent.Type.STARTED:
                // This event indicates the ad has started - the video player
                // can adjust the UI, for example display a pause button and
                // remaining time.
                if (ad.isLinear()) {
                    // For a linear ad, a timer can be started to poll for
                    // the remaining time.
                    this.intervalTimer = setInterval(
                        function () {
                            var remainingTime = Math.round(this.adsManager.getRemainingTime());
                        }.bind(this),
                        300); // every 300ms
                }
                break;
            case google.ima.AdEvent.Type.COMPLETE:
                // This event indicates the ad has finished - the video player
                // can perform appropriate UI actions, such as removing the timer for
                // remaining time detection.

                // Start playing the video.
                this.playVideo();

                if (ad.isLinear()) {
                    clearInterval(this.intervalTimer);
                }
                break;
        }
    }

    function _onAdError(adErrorEvent) {
        // Handle the error logging.
        this.adsManager.destroy();
        throw new Error(adErrorEvent.getError());
    }

    function _onContentResumeRequested() {
        // Start playing the video.
        this.playVideo();
        // This function is where you should ensure that your UI is ready
        // to play content. It is the responsibility of the Publisher to
        // implement this function when necessary.
        // setupUIForContent();
    }

    function _onContentSkippable() {
        this.plyrAdSkipButton.style.display = 'block';
    }

    // Deep extend/merge destination object with N more objects
    // http://andrewdupont.net/2009/08/28/deep-extending-objects-in-javascript/
    // Removed call to arguments.callee (used explicit function name instead)
    function _extend() {
        // Get arguments
        var objects = arguments;

        // Bail if nothing to merge
        if (!objects.length) {
            return;
        }

        // Return first if specified but nothing to merge
        if (objects.length === 1) {
            return objects[0];
        }

        // First object is the destination
        var destination = Array.prototype.shift.call(objects),
            length      = objects.length;

        // Loop through all objects to merge
        for (var i = 0; i < length; i++) {
            var source = objects[i];

            for (var property in source) {
                if (source[property] && source[property].constructor && source[property].constructor === Object) {
                    destination[property] = destination[property] || {};
                    _extend(destination[property], source[property]);
                } else {
                    destination[property] = source[property];
                }
            }
        }

        return destination;
    }

    // Setup function
    function setup(plyr, config) {
        // Bail if plyr instances aren't found.
        if (!window.plyr) return false;

        // Set options from defaults and config.
        var options = _extend({}, defaults, config);

        // Loop through plyr instances and add ads.
        plyr.forEach(function(instance) {
            // Only add ads to video instances.
            if (instance.getType() !== 'audio') {
                instance.plyrAds = new PlyrAds(instance, options);
            }
        });
    }


    return {
        setup: setup
    };

}));
