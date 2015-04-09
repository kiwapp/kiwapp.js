'use strict';
(function () {
    //Browserify modules dependencies
    var increase = require('../../utils/increaseCapability');
    var extend = require('../../utils/extend');
    var EventEmitter = require('../../utils/event');
    var Model = require('../../utils/model');

    /**
     * The Driver object (this class is abstract and will be extended by AndroidDriver, iOSDriver, CordovaDriver or WebDriver)
     * @constructor
     */
    function Driver() {
        EventEmitter.call(this);
        Model.call(this);

        observeEvents(this);
    }

    // Adding capabilities to Driver prototype
    increase(Driver.prototype, EventEmitter.prototype);
    increase(Driver.prototype, Model.prototype);

    //Launch the event listening
    function observeEvents(_self) {
        _self.on('callApp', _self.catchCallApp, _self);
    }

    /*!
     * Compute a right url to make a Kiwapp driver call
     * @param {*} config The config to compute the url
     * @return {string} The processed url
     */
    Driver.prototype.getDriverUrl = function getDriverUrl(config) {
        var args = config.data;
        var url = 'kiwapp://' + config.call + '?';
        var i = 0;
        var tmp = '';

        for (var k in args) {
            if (i > 0) tmp = '&';
            url = url + tmp + k + '=' + encodeURIComponent(JSON.stringify(args[k]) || '');
            i++;
        }

        return url;
    };

    /**
     * Open native app with bridge
     * Post android package name for open native app
     * @param {string} packageName Package name android app
     */
    Driver.prototype.openNativeApp = function openNativeApp(packageName) {

        window.Kiwapp.driver().trigger('callApp', {
            call: 'open_native_app',
            data: {
                package_name: packageName
            }
        });

    };

    /**
     * Open html5 app with bridge
     * post android package name for open native app
     * @param {*} params The config parameters for the open external application HTML 5
     */
    Driver.prototype.openHTML5App = function openHTML5App(params) {

        window.Kiwapp.driver().trigger('callApp', {
            call: 'open_html5_app',
            data: params
        });
    };

    /*!
     * Catch the callApp event and send it to the native
     * @param  {*} config The call config
     */
    Driver.prototype.catchCallApp = function catchCallApp(config) {
        var _self = this;

        var defaults = {'data': {}};
        config = extend({}, defaults, config);

        var url = _self.getDriverUrl(config);

        _self.exec(url, config);
    };

    /**
     * Post method used to post offline entries
     * @param {*} data data to send
     * @param {string} type define the entry type
     * @param {string} url if type is custom, define the url destination
     * @param {*} options if type is custom, define the send options
     */
    Driver.prototype.post = function post(data, type, url, options) {
        window.Kiwapp.driver().trigger('callApp', {
            call: 'store_offline_entry',
            data: {
                data: data,
                type: type,
                url: url,
                options: options
            }
        });

        return this;
    };

    /**
     * Set the print string to local storage
     * @param  {string} The string is stock in local storage with a generate key
     * @param  {string} The identifier id for the print (this identifier will be send in the callback method and you can identify the cart what you trying to print)
     * @return {Driver} The driver object
     */
    Driver.prototype.print = function print(cardText, cardId) {

        if (!cardText) {
            console.warn('No text to print');

            return this;
        }
        if (!cardId) {
            cardId = Kiwapp.driver().generateKey();
        }
        window.Kiwapp.driver().trigger('callApp', {
            call: 'print_card',
            data: {
                card_id: cardId,
                card_text: cardText
            }
        });

        return this;
    };

    /**
     * Set the device rotation
     * @param {string} Orientation define the wanted orientation
     * @return {Driver} The driver object
     */
    Driver.prototype.rotate = function rotate(orientation) {
        switch (orientation) {
            case 'landscape':
                orientation = 10;
                break;
            case 'portrait':
                orientation = 5;
                break;
            case 'landscape-left':
                orientation = 2;
                break;
            case 'landscape-right':
                orientation = 8;
                break;
            case 'portrait-up':
                orientation = 1;
                break;
            case 'portrait-down':
                orientation = 4;
                break;
        }

        window.Kiwapp.driver().trigger('callApp', {
            call: 'rotation',
            data: {
                orientation: orientation
            }
        });

        return this;
    };

    /**
     * Log a message to the driver
     * @param {string} The message to log
     * @return {Driver} The driver object
     */
    Driver.prototype.log = function log(msg) {
        console.debug('[Driver@log] : ', msg);
        window.Kiwapp.driver().trigger('callApp', {
            call: 'log',
            data: {
                message: msg
            }
        });

        return this;
    };

    /**
     * Close the current HTML 5 application and return on the launcher's driver page
     * @return {Driver} The driver object
     */
    Driver.prototype.closeApplication = function closeApplication() {
        window.Kiwapp.driver().trigger('callApp', {
            call: 'close_animation',
            data: {}
        });
        return this;
    };

    /**
     * Open the photo picker (gallery)
     * @param {number} limit the number limit of you want pick photo, beyond 15 a log warn is displayed
     * @param {Array<string>} alreadySendName the photo what you have already selected with a previous call, they will be already selected in the gallery
     * @param {number} the callback Id this picker, this callback is useful when you have many photo picker in your application, the response will contained this id
     * @return {Driver} The driver object
     */
    Driver.prototype.openPhotoPicker = function openPhotoPicker(limit, alreadySendName, callbackId) {

        if(!limit) {
            limit = 5;
        } else if (limit > 15) {
            console.warn('Your limit of photo to send is very high you must be careful with this. Especialy if you want send them');
        }

        if(callbackId) {
            window.Kiwapp.driver().trigger('callApp', {
                call: 'kw_open_photo_picker',
                data: {
                    limit: limit,
                    already_used: alreadySendName,
                    kw_photo_picker_id: callbackId
                }
            });
        } else {
            window.Kiwapp.driver().trigger('callApp', {
                call: 'kw_open_photo_picker',
                data: {
                    limit: limit,
                    already_used: alreadySendName
                }
            });
        }

        return this;
    };

    /**
     * Open the Kiwapp drawer (draw and signature)
     * @param {String} backgroundImage The background image what you want display on the background of your drawing
     * @param {boolean} isSignature Put this boolean to true and the driver will display a special view designed for the signature
     * @param {number} the callback Id this picker, this callback is useful when you have many drawer in your application, the response will contained this id
     * @return {Driver} The driver object
     */
    Driver.prototype.openDrawer = function openDrawer(backgroundImage, isSignature, callbackId) {
        if(callbackId) {
            window.Kiwapp.driver().trigger('callApp', {
                call: 'kw_open_drawer',
                data: {
                    background_image: backgroundImage,
                    is_signature: isSignature,
                    kw_drawer_id: callbackId
                }
            });
        } else {
            window.Kiwapp.driver().trigger('callApp', {
                call: 'kw_open_drawer',
                data: {
                    background_image: backgroundImage,
                    is_signature: isSignature
                }
            });
        }

        return this;
    };

    /**
     *
     * @param {Array<{file_type: string, file_id: number, file_path: string, file_url: string}>} the data to send, it will be contain the type of file, the path, an id, and the url where you want send this file
     * @return {Driver}
     */
    Driver.prototype.sendFile = function sendFile(data) {

        window.Kiwapp.driver().trigger('callApp', {
            call: 'kw_upload_files',
            data: data
        });

        return this;
    };

    /*!
     * Generate an unique key
     * @return {string}
     */
    Driver.prototype.generateKey = function generateKey() {
        var key = '';
        var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (var i = 0; i < 5; i++) {
            key += possible.charAt(Math.floor(Math.random() * possible.length));
        }

        return 'kw_card_' + key + Math.round(new Date().getTime() / 1000);
    };
    module.exports = Driver;
})();
