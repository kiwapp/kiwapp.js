(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var toString = Object.prototype.toString

module.exports = function(val){
  switch (toString.call(val)) {
    case '[object Function]': return 'function'
    case '[object Date]': return 'date'
    case '[object RegExp]': return 'regexp'
    case '[object Arguments]': return 'arguments'
    case '[object Array]': return 'array'
    case '[object String]': return 'string'
  }

  if (typeof val == 'object' && val && typeof val.length == 'number') {
    try {
      if (typeof val.callee == 'function') return 'arguments';
    } catch (ex) {
      if (ex instanceof TypeError) {
        return 'arguments';
      }
    }
  }

  if (val === null) return 'null'
  if (val === undefined) return 'undefined'
  if (val && val.nodeType === 1) return 'element'
  if (val === Object(val)) return 'object'

  return typeof val
}

},{}],2:[function(require,module,exports){
'use strict';
(function () {

    // Browserify modules dependencies
    var Driver = require('./driver');

    // Get the driver prototype
    AndroidDriver.prototype = Object.create(Driver.prototype);

    /**
     * The Android Driver object
     * @constructor
     */
    function AndroidDriver() {
        Driver.call(this);
    }


    /**
     * Final method to send call to native
     * This method will override the driver/driver.js method
     * @param {string} url The call to native
     * @override
     */
    AndroidDriver.prototype.exec = function exec(url) {
        window.Android.execute(url);
    };

    /**
     * Compute a right url to make a kiwapp driver call
     * @param  {object} config The config to compute the url
     * @return {string}        The processed url
     */
    AndroidDriver.prototype.getDriverUrl = function (config) {
        var args = config.data;
        var url = 'kiwapp://' + config.call + '?';
        var i = 0;
        var tmp = '';

        for (var k in args) {
            if (i > 0) tmp = '&';

            // We double urlencode for the android driver who need a double decode natif side
            url = url + tmp + k + '=' + encodeURIComponent(encodeURIComponent(JSON.stringify(args[k])) || '');
            i++;
        }

        return url;
    };

    module.exports = AndroidDriver;
})();

},{"./driver":3}],3:[function(require,module,exports){
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

        if (!limit) {
            limit = 5;
        } else if (limit > 15) {
            console.warn('Your limit of photo to send is very high you must be careful with this. Especialy if you want send them');
        }

        if (callbackId) {
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
     * @param {String} title This title will be displayed on the modal for the drawing
     * @param {number} the callback Id this picker, this callback is useful when you have many drawer in your application, the response will contained this id
     * @return {Driver} The driver object
     */
    Driver.prototype.openDrawer = function openDrawer(backgroundImage, isSignature, title, callbackId) {
        if (callbackId) {
            window.Kiwapp.driver().trigger('callApp', {
                call: 'kw_open_drawer',
                data: {
                    background_image: backgroundImage,
                    is_signature: isSignature,
                    title: title,
                    kw_drawer_id: callbackId
                }
            });
        } else {
            window.Kiwapp.driver().trigger('callApp', {
                call: 'kw_open_drawer',
                data: {
                    background_image: backgroundImage,
                    is_signature: isSignature,
                    title: title,
                    kw_drawer_id: Kiwapp.driver().generateKey()
                }
            });
        }

        return this;
    };

    /**
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

    /**
     * @param {string} applicationIdentifier, the sharing key of the application you want open
     * @param {Object} urlQueryParams this params are injected as query string in the application you want open
     * @returns {Driver}
     */
    Driver.prototype.openHTML5Application = function openHTML5Application(applicationIdentifier, urlQueryParams) {

        if (applicationIdentifier === undefined) {
            Kiwapp.log('The applicationIdentifier params is required');
        }

        if (urlQueryParams === undefined) {
            window.Kiwapp.driver().trigger('callApp', {
                call: 'open_html5_app_webview',
                data: {
                    'sharing_key': applicationIdentifier
                }
            });
        } else {
            window.Kiwapp.driver().trigger('callApp', {
                call: 'open_html5_app_webview',
                data: {
                    'sharing_key': applicationIdentifier,
                    'params': urlQueryParams
                }
            });
        }

        return this;
    };

    /**
     * Open a document in Kiwapp (work with PDF)
     * @param {string} url The document relative url
     * @param {*} list of option  (see wiki for the complete list)
     * @returns {Driver}
     */
    Driver.prototype.openPDF = function openPDF(url, opts) {
        if (url === undefined) {
            Kiwapp.log('The url params is required');
        }

        // Use the option as data if they exist
        var data = {};
        if(opts) {
            data = opts;
        }
        data.file_path = url;

        window.Kiwapp.driver().trigger('callApp', {
            call: 'open_document_reader',
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

},{"../../utils/event":14,"../../utils/extend":15,"../../utils/increaseCapability":17,"../../utils/model":19}],4:[function(require,module,exports){
'use strict';
(function () {
    // Require Driver interface
    var Driver = require('./driver');

    // Memorize the last offline entry ids to earn performances
    var lastId = Object.create(null);

    //Driver interface implementation
    IOS.prototype = Object.create(Driver.prototype);

    /**
     * IOS Driver constructor
     * @constructor
     */
    function IOS() {
        var _self = this;
        Driver.call(_self);

        createBridge(_self);
        playQueue = playQueue.bind(_self);
    }

    /**
     * Method which prepare native call sending on ios
     * This method will override the driver/driver.js method
     * @param {string} url url describing the call
     */
    IOS.prototype.exec = function execIOS(url) {
        var _self = this;

        addToQueue(_self, url);
    };

    /**
     * Method used by native to get stored offline entries in local storage
     * if the given id is false, return a bad entry with error code 404
     * @param {string} id the entry id to find in local storage
     * @return {*} offline entry
     */
    IOS.prototype.entry = function entryIOS(id) {
        var entry = window.localStorage[id];
        if (entry === undefined) {
            return JSON.stringify({
                error: 404,
                data: ''
            });
        }
        entry = JSON.parse(entry);
        entry.error = 200;
        delete window.localStorage[id];
        return JSON.stringify(entry);
    };

    /**
     * Send offline entry call to native, saving it in local storage
     * Post method used to post offline entries
     *
     * @param {*} data data to send
     * @param {string} type define the entry type
     * @param {string} url if type is custom, define the url destination
     * @param {*} options if type is custom, define the send options
     *
     * @override
     */
    IOS.prototype.post = function postIOS(data, type, url, options) {
        var id = findLastId(window.Kiwapp.session().getIdentifier());
        window.localStorage[id] = JSON.stringify({
            data: data
        });

        window.Kiwapp.driver().trigger('callApp', {
            call: 'store_offline_entry',
            data: {
                id: id,
                type: type,
                url: url,
                options: options
            }
        });
    };

    /**
     * Set the print string to local storage
     * @param {string} The string is stock in local storage with a generate key
     * @param {string} The identifier id for the print (this identifier will be send in the callback method and you can identify the cart what you trying to print)
     * @return {Driver} The driver object
     *
     * @override
     */
    IOS.prototype.print = function (cardText, cardId) {

        if (!cardText) {
            console.warn('No text to print');

            return this;
        }

        if (!cardId) {
            cardId = Kiwapp.driver().generateKey();
        }

        var key = Kiwapp.driver().generateKey();

        localStorage.setItem(key, cardText);

        window.Kiwapp.driver().trigger('callApp', {
            call: 'print_card',
            data: {
                card_id: cardId,
                card_id_localStorage: key
            }
        });

        return this;
    };

    /**
     * This method is for allow the iOS driver to retrieve the local storage content of this application,
     * Is used when we use the bridge with many params (more than 1024 characters)
     * @param {number} id
     * @return {*}
     */
    IOS.prototype.getLocalStorageValue = function (id) {
        var storage = localStorage.getItem(id);

        if (storage === undefined) {
            return JSON.stringify({
                error: 404,
                data: ''
            });
        }

        delete window.localStorage[id];
        return JSON.stringify({
            error: 200,
            data: storage
        });
    };

    /**
     * Get the print string in the local storage (the card can be very long)
     * @param  {number} id the string is get with the key
     * @return {string} the string of the card
     */
    IOS.prototype.getPrintCard = function (id) {
        return IOS().getLocalStorageValue(id);
    };

    /**
     * Open the photo picker (gallery)
     * @param {number} limit the number limit of you want pick photo, beyond 15 a log warn is displayed
     * @param {Array<string>} alreadySendName the photo what you have already selected with a previous call, they will be already selected in the gallery
     * @param {number} callbackId
     * @return {Driver} The driver object
     *
     * @override
     */
    IOS.prototype.openPhotoPicker = function openPhotoPicker(limit, alreadySendName, callbackId) {

        if (!limit) {
            limit = 5;
        } else if (limit > 15) {
            console.warn('Your limit of photo to send is very high you must be careful with this. Especialy if you want send them');
        }

        var data = {};
        if (callbackId) {
            data = {
                limit: limit,
                already_used: alreadySendName,
                kw_photo_picker_id: callbackId
            };
        } else {
            data = {
                limit: limit,
                already_used: alreadySendName
            };
        }

        var key = Kiwapp.driver().generateKey();

        localStorage.setItem(key, JSON.stringify(data));

        window.Kiwapp.driver().trigger('callApp', {
            call: 'kw_open_photo_picker',
            data: {
                local_storage_key: key
            }
        });
        return this;
    };

    /**
     * Open the Kiwapp drawer (draw and signature)
     * @param {String} backgroundImage The background image what you want display on the background of your drawing
     * @param {boolean} isSignature Put this boolean to true and the driver will display a special view designed for the signature
     * @param {String} title This title will be displayed on the modal for the drawing
     * @param {number} the callback Id this picker, this callback is useful when you have many drawer in your application, the response will contained this id
     * @return {Driver} The driver object
     */
    IOS.prototype.openDrawer = function openDrawer(backgroundImage, isSignature, title, callbackId) {

        var data = {};
        if (callbackId) {
            data = {
                background_image: backgroundImage,
                is_signature: isSignature,
                title: title,
                kw_drawer_id: callbackId
            };
        } else {
            data = {
                background_image: backgroundImage,
                is_signature: isSignature,
                title: title,
                kw_drawer_id: Kiwapp.driver().generateKey()
            };
        }

        var key = Kiwapp.driver().generateKey();

        localStorage.setItem(key, JSON.stringify(data));

        window.Kiwapp.driver().trigger('callApp', {
            call: 'kw_open_drawer',
            data: {
                local_storage_key: key
            }
        });
        return this;
    };

    /**
     * Send a file to the storage Kiwapp
     * @param data
     * @return {IOS}
     *
     * @override
     */
    IOS.prototype.sendFile = function sendFile(data) {

        var key = Kiwapp.driver().generateKey();
        localStorage.setItem(key, JSON.stringify(data));

        window.Kiwapp.driver().trigger('callApp', {
            call: 'kw_upload_files',
            data: {
                local_storage_key: key
            }
        });

        return this;
    };

    /**
     * @param {string} applicationIdentifier, the sharing key of the application you want open
     * @param {Object} urlQueryParams this params are injected as query string in the application you want open
     * @returns {IOS}
     */
    IOS.prototype.openHTML5Application = function openHTML5Application(applicationIdentifier, urlQueryParams) {

        if(applicationIdentifier === undefined) {
            Kiwapp.log('The applicationIdentifier params is required');
        }

        // Build the data to send in the localStorage
        var data =  {};
        if(urlQueryParams === undefined) {
            data = {
                'sharing_key': applicationIdentifier
            };
        } else {
            data = {
                'sharing_key': applicationIdentifier,
                'params': urlQueryParams
            };
        }

        var key = Kiwapp.driver().generateKey();
        localStorage.setItem(key, JSON.stringify(data));

        window.Kiwapp.driver().trigger('callApp', {
            call: 'open_html5_app_webview',
            data: {
                local_storage_key: key
            }
        });

        return this;
    };

    /**
     * Open a document in Kiwapp (work with PDF)
     * @param {string} url The document relative url
     * @param {*} list of option  (see wiki for the complete list)
     * @returns {Driver}
     */
    IOS.prototype.openPDF = function openPDF(url, opts) {
        if (url === undefined) {
            Kiwapp.log('The url params is required');
        }

        var data = {};
        if(opts) {
            data = opts;
        }

        data =  {
            file_path: url
        };
        var key = Kiwapp.driver().generateKey();
        localStorage.setItem(key, JSON.stringify(data));

        window.Kiwapp.driver().trigger('callApp', {
            call: 'open_document_reader',
            data: {
                local_storage_key: key
            }
        });

        return this;
    };

    /*******************
     * PRIVATES METHODS
     ******************/

    function findLastId(identifier) {
        var id = (lastId[identifier] === undefined) ? 1 : lastId[identifier];
        while (window.localStorage[identifier + id] !== undefined) {
            id++;
        }

        lastId[identifier] = id;
        return identifier + id;
    }

    function createBridge(_self) {
        //create an iframe DOM Element, it will be the iOS bridge
        var iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = 'basesrc';
        document.documentElement.appendChild(iframe);

        _self.set({messagingIframe: iframe});
        _self.set({sendMessageQueue: []});
    }

    //play the last member of the call app queue
    function playQueue() {
        /*jshint validthis:true */
        var _self = this;
        var sendMessageQueue = _self.get('sendMessageQueue');

        if (sendMessageQueue.length > 1)
            setTimeout(playQueue, 50);

        send(_self, sendMessageQueue.shift());
    }

    function addToQueue(_self, message) {
        var sendMessageQueue = _self.get('sendMessageQueue');

        sendMessageQueue.push(message);
        if (sendMessageQueue.length === 1) {
            setTimeout(playQueue, 50);
        }
    }

    function send(_self, message) {
        var messagingIframe = _self.get('messagingIframe');

        messagingIframe.src = message;
    }

    module.exports = IOS;
})();

},{"./driver":3}],5:[function(require,module,exports){
'use strict';
(function(){
    /**
    *  browserify modules dependencies
    **/
    var Driver = require('./driver');

    /**
     * Web object
     * Constructor create the bridge (iframe)
     *
     * @constructor
     */
    function Web(){
        var _self = this;

        Driver.call(_self);
    }

    /**
     * Get the driver prototype
     */
    Web.prototype = Object.create(Driver.prototype);

    /**
     * Final method to simulate call to native, tracing it in console
     * This method will override the driver/driver.js method
     * @param {string} url
     * @param {*} config
     */
    Web.prototype.exec =  function(url, config){

        var log = '';
        if('call' in config && 'log' === config.call) {
            log = config.data.message;
        }

        console.debug('[Web@exec] : simulate native call ' + log, {info : {
            url    : url,
            config : config
        }});
    };

    module.exports = Web;
})();

},{"./driver":3}],6:[function(require,module,exports){
'use strict';
(function(){

    // Browserify modules dependencies
    var utils = require('../utils/utils');
    var loadJS = utils.loadJS;
    var AndroidDriver = require('./driver/android');
    var IOS = require('./driver/iOS');
    var Web = require('./driver/web');
    var Session = require('./stats/session');
    var Stats = require('./stats/stats');
    var Storage = require('./storage/StorageProxy');

    // Store config, storage and driver in private variables to avoid user modifications
    var config = {}, driver, storage;

    /**
     * Kiwapp is the function which stores all kiwapp.js features
     * To launch it, a path to the 'config/kiwapp_config.js' file is needed and an optional callback because of async loading
     * In debug : it's possible to give a simple javascript object instead of a path
     * @param {string|object} path The path to a config file, or an object with the config
     * @param {Function} callback Optional callback because of async loading
     * @return {Function} Kiwapp
     */
    function Kiwapp(path, callback){
        loadConfig(path, callback);
        return Kiwapp;
    }

    /**
     * The driver object getter, this driver Object is typed by OS (android, ios or webbrowser)
     * @return {Function} The bridge to communicate with native Kiwapp
     */
    Kiwapp.driver = function(){

        if(driver === undefined) {
            loadDriver();
        }

        return driver;
    };

    /**
     * Return your current environment
     * @return {String} the name of the current environment (android, ios or webbrowser)
     */
    Kiwapp.env = function env() {
        return this.driverInstance;
    };

    /**
     * Get the config used by Kiwapp
     * In debug this will return the config/kiwapp_config.js content
     * In production this will return the value given by the retail manager (like for example the shop name or the user email)
     * @param {string} value the config value to get, If value is undefined, we return the a copy of the whole config
     * @return {*} the wanted value/the whole config (copy)
     */
    Kiwapp.get = function get(value){
        if(config === undefined || config.appParameters === undefined) {
            console.log('No kiwapp_config.js file found, check within your config folder or add this folder with this file name inside (view README file: https://github.com/kiwapp/kiwapp.js/blob/master/README.md)');
            throw new Error('You can not load driver if config is not set');
        }

        if(value === undefined) {
            return Object.create(config);
        }
        if(typeof config[value] === 'object') {
            return Object.create(config[value]);
        }
        return config[value];
    };

    /**
     * Set a debug configuration to kiwapp.js (this will modify the driver instance)
     * @param {string|object} key if a string, this is the value to modify, if an object, this is a set of key : value to modify
     * @param {multi} value the value to associate to the key
     * @return {object} The current configuration used by kiwapp.js
     */
    Kiwapp.set = function set(key, value){
        if(typeof key === 'object'){
            for(var i in key){
                config[i] = key[i];
            }
        }
        else{
            config[key] = value;
        }

        return Kiwapp.get();
    };

    /**
     * The session object getter
     * @return {Session} The object containing session's management
     */
    Kiwapp.session = function session(){
        return Session;
    };

    /**
     * The stats object getter
     * @return {Stats} The object containing stats's management
     */
    Kiwapp.stats = function stats(){
        return Stats;
    };

    /**
     * The storage object getter
     * @return {Storage} The object containing storage's management
     */
    Kiwapp.storage = function getStorage(){
        if(storage === undefined){

            if('webbrowser' !== this.env()) {
                storage = new Storage.storage();
            }else {
                storage = new Storage.emulation();
            }
        }
        return storage;
    };

    /**
     * Launch dom is ready call to native to display webview
     * @return {Kiwapp} Kiwapp itself
     */
    Kiwapp.ready = function ready(){
        Kiwapp.driver().trigger('callApp', {
            call: 'dom_is_ready',
            data: {}
        });

        return Kiwapp;
    };

    /**
     * Log a message to the driver
     * This message will be displayed in the debug console on the device
     * @return {Kiwapp} Kiwapp
     */
    Kiwapp.log = function log(msg){
        console.log('%c[Kiwapp-Log]', 'color:red', msg);
        Kiwapp.driver().trigger('callApp', {
            call: 'log',
            data: {
                message : msg
            }
        });

        return Kiwapp;
    };

    /**
     * Enable or disable webview scrolling
     * @param {boolean} send true if you want enabled the native scroll on webview, false if you won't, default value is true
     * @return {Kiwapp} Kiwapp itself
     */
    Kiwapp.scroll = function scroll(state){
        if(state === true){
            Kiwapp.driver().trigger('callApp', {
                call: 'enable_scroll_on_webview',
                data: {}
            });
        } else{
            Kiwapp.driver().trigger('callApp', {
                call: 'disable_scroll_on_webview',
                data: {}
            });
        }

        return Kiwapp;
    };

    /**
     * KDS
     * GetKDSWriterCredentials getter for kds credential object
     * @return object
     */
    Kiwapp.getKDSWriterCredentials = function getKDSWriterCredentials(tabClass) {
        var object = Kiwapp.get().webHooksParameters;
        var kdsCredentials = {};

        if (object.KDS_INSTANCIATE_RESPONSE !== undefined) {
            try {
                if(tabClass !== undefined){
                    kdsCredentials = object.KDS_INSTANCIATE_RESPONSE[tabClass];  
                }
                else{
                   kdsCredentials = object.KDS_INSTANCIATE_RESPONSE.app; 
                }                
            }
            catch (e) {
                Kiwapp.log('Please verify your credential for writing in KDS');
            }
        }

        return kdsCredentials;
    };

    /**
     * Call the native to rotate the webview
     *
     * @param {string|number} orientation the possible values are 'landscape', 'portrait', 'landscape-left', 'landscape-right', 'portrait-up', 'portrait-down':
     * @return {Kiwapp} Kiwapp
     */
    Kiwapp.rotate = function rotate(orientation){
        Kiwapp.driver().rotate(orientation);

        return Kiwapp;
    };

    /**
     * Close the current application
     * @return {Kiwapp} Kiwapp
     */
    Kiwapp.close = function close(){
        Kiwapp.driver().trigger('callApp', {
            call : 'close_animation',
            data : {}
        });

        return Kiwapp;
    };

    /**
     * A private method which load the right driver depending on the config (deviceIdentifier)
     * @return {Function} The bridge to communicate with native kiwapp
     */
    function loadDriver(){
        if(config === undefined || config.appParameters === undefined) {
            console.log('No kiwapp_config.js file found, check within your config folder or add this folder with this file name inside (view README file: https://github.com/kiwapp/kiwapp.js/blob/master/README.md)');
            throw new Error('You can not load driver if config is not set');
        }
        var deviceType = config.appParameters.osID;

        if(deviceType === 'webbrowser') {
            Kiwapp.driverInstance = 'webbrowser';
            driver = new Web();
        } else if(deviceType === 'ios') {
            Kiwapp.driverInstance = 'ios';
            driver = new IOS();
        } else if(deviceType === 'android') {
            Kiwapp.driverInstance = 'android';
            driver = new AndroidDriver();
        } else if(deviceType === 'auto') {
            var ua = window.navigator.userAgent;
            if(ua.indexOf('Mobile') === -1 ||  deviceType === 'webbrowser') {
                Kiwapp.driverInstance = 'webbrowser';
                driver = new Web();
            }

            if( (ua.indexOf('iPhone') > -1 || ua.indexOf('iPad') > -1) ||  deviceType === 'ios') {
                Kiwapp.driverInstance = 'ios';
                driver = new IOS();
            }

            if(ua.indexOf('Android') > -1 || deviceType === 'android') {
                Kiwapp.driverInstance = 'android';
                driver = new AndroidDriver();
            }
        }

        return driver;
    }
    /**
     * A private method to load a jsFile or a js object and return the config object
     * @param {string | object}   path     The path to a config file, or an object with the config
     * @param {Function} callback Optionnal callback because of async loading
     * @return {object}            the loaded/assigned config
     */
    function loadConfig(path, callback){
        config = {};
        if(typeof path === 'string') {
            loadJS(path, callback);
        } else {
            Kiwapp.set(path);
        }

        return config;
    }

    // Add Kiwapp to window
    window.Kiwapp = Kiwapp;
    // Export the window
    module.exports = Kiwapp;
    return Kiwapp;
})();

},{"../utils/utils":20,"./driver/android":2,"./driver/iOS":4,"./driver/web":5,"./stats/session":7,"./stats/stats":8,"./storage/StorageProxy":10}],7:[function(require,module,exports){
'use strict';
(function () {
    /**
     * Browserify modules dependencies
     **/
    var hex_md5 = require('../../libs/md5');
    var extend = require('../../utils/extend');
    var ajax = require('../../utils/ajax');

    /**
     * store currentIdentifier and deviceIdentifier in private variables to avoid user modifications
     */
    var currentIdentifier, deviceIdentifier, currentURL;
    var currentData = {};
    // The callback method
    var callbackMethod;
    var timerIdentifier;
    var timeoutTime;
    var sessionStartTime;

    /**
     * Session object
     * @constructor
     */
    function Session() {

    }

    /**
     * A private method to generate the identifier depending on the deviceIdentifier
     * @param {string} identifier The device identifier
     * @return {string} The unique identifier for the session
     */
    function generateIdentifier(identifier) {
        var timestamp = Number(new Date());
        return hex_md5(identifier + timestamp);
    }

    /**
     * Your callback method is stored here
     * This method will be called when the session timeout time is reached
     * @param {Function} callback the callback method
     * @param {number} timeout the timeout in seconds
     */
    Session.launchTimeout = function launchTimeout(callback, timeout) {

        if (!timeout && !timeoutTime) {
            console.log('You have not specified any time for your callback method');
            return false;
        } else if (!timeoutTime){
            timeoutTime = timeout;
        }

        if (!callback && !callbackMethod) {
            console.log('You have not specified any method in callback');
            return false;
        } else if (!callbackMethod){
            callbackMethod = callback;
        }
        
        function callbackWrapper() {
            var sessionDuration = Date.now() - sessionStartTime; 
            callbackMethod(sessionDuration);
        }

        timerIdentifier = window.setTimeout(callbackWrapper, timeoutTime);
    };

    /**
     * Remove your callback
     * This callback is not lost but it will not trigger anymore
     * For relaunch it, use the method relaunchTimeout
     *
     */
    Session.resetTimeout = function resetTimeout() {
        clearInterval(timerIdentifier);
    };

    /**
     * Relaunch the timeout
     */
    Session.relaunchTimeout = function relaunchTimeout() {
        this.resetTimeout();
        this.launchTimeout();
    };


    /**
     * Launch a new session if there is no current session (generate a new identifier)
     * @param {string} identifier The device identifier
     * @return {Function} The session object
     */
    Session.start = function startSession(identifier) {
        if(identifier === undefined && deviceIdentifier === undefined) {
            deviceIdentifier = Kiwapp.get('appParameters').deviceIdentifier;
        } else if (deviceIdentifier === undefined) {
            deviceIdentifier = identifier;
        }

        identifier = identifier || deviceIdentifier;
        var newIdentifier = generateIdentifier(identifier);

        if (currentIdentifier === undefined) {
            currentData = {};
            currentIdentifier = newIdentifier;
            sessionStartTime = Date.now();

            console.debug('[Session@start] : New session fired !');
            if (window.Kiwapp !== undefined) {
                window.Kiwapp.driver().trigger('callApp', {
                    call: 'interaction_start',
                    data: {}
                });
            }
        }

        return Session;
    };

    /**
     * Close the current session
     * @return {Function} The session object
     */
    Session.end = function endSession() {
        if (window.Kiwapp !== undefined && currentIdentifier !== undefined) {

            console.debug('[Session@end] : We close the session !');

            window.Kiwapp.driver().trigger('callApp', {
                call: 'interaction_end',
                data: {}
            });
        }

        currentIdentifier = undefined;

        return Session;
    };

    /**
     * Return the current session identifier
     * @return {string} The current session identifier
     */
    Session.getIdentifier = function identifierSession() {
        return currentIdentifier;
    };

    /**
     * Stores data in the current data object
     * If a second argument is defined, a 'currentURL' is defined
     * This url will be a 'default' url when the send method is called
     * @param  {*} data Data to store
     * @param  {string} url  Default send url
     * @return {Session} The Session
     */
    Session.store = function storeSession(data, url) {
        if (data === undefined)
            return Object.create(currentData);

        if (Session.getIdentifier() !== undefined) {
            currentData = extend(currentData, data);
        }

        currentURL = url;

        return Session;
    };

    /**
     * Calls the native with stored data
     * The driver posts it when online come back, or when a ping signal come to the device
     * @param {string} url The url to the webservice which recieve data
     * @return {Session} The Session
     */
    Session.send = function sendSession(config) {
        config = config || currentURL;
        var url, options;
        if (typeof config === 'object') {
            options = manageConfig(config);
            url = config.url;
        }
        else {
            url = config;
        }
        if (window.Kiwapp !== undefined && Object.keys(currentData).length > 0) {
            var copy = JSON.parse(JSON.stringify(currentData));
            currentData = {};
            var ajaxConfig = {
                data: copy,
                contentType: 'application/json; charset=utf-8',
                url: url,
                error: function () {
                    window.Kiwapp.driver().post(copy, 'custom', url, btoa(JSON.stringify(options)));
                }
            };

            for (var i in options) {
                ajaxConfig[i] = options[i];
            }
            ajaxConfig.type = ajaxConfig.method;
            ajax(ajaxConfig);
        }

        return Session;
    };

    /**
     * create send configuration
     * @param {*} config user configuration
     * @return {Object} built configuration
     */
    function manageConfig(config) {
        var options = Object.create(null);

        for(var propeties in config) {
            options[propeties] = config[propeties];
        }

        return options;
    }

    module.exports = Session;
})();

},{"../../libs/md5":12,"../../utils/ajax":13,"../../utils/extend":15}],8:[function(require,module,exports){
'use strict';
(function () {

    /**
     * Browserify modules dependencies
     **/
    var getDate = require('../../utils/getDate');

    /**
     * Store stats history in private variables to avoid user modifications
     * @type {Object}
     */
    var stats = Object.create(null);

    /**
     * Stats object
     * @constructor
     */
    function Stats() {

    }

    /**
     * Check if the current user have already a session
     * If not this will print a warning and create one
     */
    function checkSession() {
        if(window.Kiwapp.session().getIdentifier() === undefined) {
            // Warn the user (for the application developer)
            console.log('Warning : you haven\'t a session opened, we open one for you. See Kiwapp best practice to http://developer.kiwapp.com/');
            window.Kiwapp.session().start();
        }
    }

    /**
     * Prepare the data format to send it to the native
     * @param {string} info The page or the event to send
     * @param {string} type Define if it's an event or a page
     * @param {*} config The Kiwapp config
     * @return {*} The final prepared data
     */
    function prepareData(info, type, config) {

        var data = {
            data: {
                uniqueIdentifier: config.uniqueIdentifier,
                path: info,
                deviceIdentifier: config.deviceIdentifier,
                date: getDate(),
                appInstanceId: config.appInstanceId,
                shopId: config.shopId
            },
            type: type
        };

        return data;
    }

    /**
     * Send the offline stats to the native and store it in history
     * @param {*} data The data object sent to native
     */
    function callNative(data) {
        window.Kiwapp.driver().post(data.data, data.type);
        if (stats[data.data.identifierInteraction] === undefined) {
            stats[data.data.identifierInteraction] = {};
        }
        stats[data.data.identifierInteraction][data.data.date] = data;
    }

    /**
     * Save a stat of type page
     * @param {string} page The page name
     * @return {Stats} The stats object
     */
    Stats.page = function sendPage(page) {
        if (window.Kiwapp !== undefined) {
            var config = window.Kiwapp.get('appParameters');

            // Check if a session exist (the session are required for the stats), if we haven't yet you open one
            checkSession();
            config.uniqueIdentifier = window.Kiwapp.session().getIdentifier();
            var data = prepareData(page, 'page', config);
            callNative(data);
        }

        return Stats;
    };

    /**
     * Save a stat of type event
     * @param {string} page The event name
     * @return {Stats} The stats object
     */
    Stats.event = function sendEvent(e) {
        if (window.Kiwapp !== undefined) {
            var config = window.Kiwapp.get('appParameters');

            // Check if a session exist (the session are required for the stats), if we haven't yet you open one
            checkSession();
            config.uniqueIdentifier = window.Kiwapp.session().getIdentifier();
            var data = prepareData(e, 'event', config);
            callNative(data);
        }

        return Stats;
    };

    /**
     * The stats history getter
     * @return {Object} Stats history
     */
    Stats.history = function getHistory() {
        return Object.create(stats);
    };

    /**
     * Clear history
     * @return {Stats} Stats object
     */
    Stats.clear = function clearStats() {
        stats = Object.create(null);

        return Stats;
    };

    module.exports = Stats;
})();

},{"../../utils/getDate":16}],9:[function(require,module,exports){
(function(){

    'use strict';
    //browserify modules dependencies/
    var increase = require('../../utils/increaseCapability'),
        EventEmitter = require('../../utils/event');

    /**
     * Storage object
     * @constructor
     */
    function Storage(){
        EventEmitter.call(this);
    }

    // Adding capabilities to Storage prototype
    increase(Storage.prototype, EventEmitter.prototype);

    /**
     * Get a specific key in the custom browser db.
     * Because of asynchronous, you have to listen the 'get' event before use it.
     * In your event callback, the first parameter will be the answer as :
     * {
     *     deviceID : '8764878GI2G8Y2',
     *     deviceType : 'db_get',
     *     deviceInfo : 'your requested key',
     *     deviceData : 'your wanted value'
     * }
     * @param  {string} key The key of the wanted value
     * @return {Storage} The storage object
     */
    Storage.prototype.get = function storageGet(key){

        var self = this,
            get  = localStorage.getItem('storage_' + key);

        setTimeout(function() {
            self.trigger('get',{
                deviceID : '8764878GI2G8Y2',
                deviceType : 'db_get',
                deviceInfo : key,
                deviceData : get
            });
        }, 0);

        return Storage;
    };

    /**
     * Set a value assiciated to a key in the custom browser db.
     * @param {string} key   The key of the storde value
     * @param {multiple} value The value to store
     * @return {Storage} The Storage object
     */
    Storage.prototype.set = function storageSet(key, value) {
        if(typeof value !== 'string'){
            value = JSON.stringify(value);
        }
        localStorage.setItem('storage_' + key, value);
        return Storage;
    };

    /**
     * Get all the stored keys in the custom browser db.
     * Because of asynchronous, you have to listen the 'get' event before use it.
     * In your event callback, the first parameter will be the answer as :
     * {
     *     deviceID : '8764878GI2G8Y2',
     *     deviceType : 'db_list_keys',
     *     deviceInfo : 'the number of key',
     *     deviceData : ['keyOne', 'keyTwo']
     * }
     * @return {Storage} The Storage object
     */
    Storage.prototype.keys = function storageKeys(){

        var self = this,
            keys = Object.keys(localStorage).filter(function(item) {
                return /storage_*/.test(item);
            });

        setTimeout(function() {
            self.trigger('keys', {
                deviceID : '8764878GI2G8Y2',
                deviceType : 'db_list_keys',
                deviceInfo : keys.length,
                deviceData : keys
            });
        }, 0);

        return Storage;
    };

    /**
     * Remove a specific key in the custom browser db.
     * @param  {string} key The key to remove
     * @return {Storage} The Storage object
     */
    Storage.prototype.remove = function storageRemove(key){
        localStorage.removeItem(key);
        return Storage;
    };

    /**
     * Clear the Localstorage custom db
     * @return {Storage} The Storage object
     */
    Storage.prototype.clear = function storageClear(){

        var keys = Object.keys(localStorage).filter(function(item) {
            return /storage_*/.test(item);
        });

        keys.forEach(function(item) {
            localStorage.removeItem(item);
        });
        return Storage;
    };

    module.exports = Storage;
})();

},{"../../utils/event":14,"../../utils/increaseCapability":17}],10:[function(require,module,exports){
(function(){
    'use strict';
    /**
     * The export of all utils
     * @type {Object}
     */
    module.exports = {
        storage : require('./storage'),
        emulation : require('./StorageBrowser')
    };
})();

},{"./StorageBrowser":9,"./storage":11}],11:[function(require,module,exports){
'use strict';
(function(){
    //Browserify modules dependencies
    var increase = require('../../utils/increaseCapability'),
        EventEmitter = require('../../utils/event');

    /**
     * Storage object
     * @constructor
     */
    function Storage(){
        EventEmitter.call(this);
        observeEvents(this);
    }

    // Adding capabilities to Storage prototype
    increase(Storage.prototype, EventEmitter.prototype);

    /**
     * Get a specific key in the native db.
     * Because of asynchronous, you have to listen the 'get' event before use it.
     * In your event callback, the first parameter will be the answer as :
     * {
     *     deviceID : '8764878GI2G8Y2',
     *     deviceType : 'db_get',
     *     deviceInfo : 'your requested key',
     *     deviceData : 'your wanted value'
     * }
     * @param {string} key The key of the wanted value
     * @return {Storage} The storage object
     */
    Storage.prototype.get = function storageGet(key){
        window.Kiwapp.driver().trigger('callApp', {
            call : 'db_get',
            data : {
                key : key
            }
        });

        return Storage;
    };

    /**
     * Set a value associated to a key in the native db.
     * @param {string} key The key of the stored value
     * @param {*} value The value to store
     * @return {Storage} The Storage object
     */
    Storage.prototype.set = function storageSet(key, value){
        window.Kiwapp.driver().trigger('callApp', {
            call : 'db_insert',
            data : {
                key : key,
                value : value
            }
        });
        Kiwapp.log('[Storage@set] ' + value);

        return Storage;
    };

    /**
     * Get all the stored keys in the native db.
     * Because of asynchronous, you have to listen the 'get' event before use it.
     * In your event callback, the first parameter will be the answer as :
     * {
     *     deviceID : '8764878GI2G8Y2',
     *     deviceType : 'db_list_keys',
     *     deviceInfo : 'the number of key',
     *     deviceData : ['keyOne', 'keyTwo']
     * }
     * @return {Storage} The Storage object
     */
    Storage.prototype.keys = function storageKeys(){
        window.Kiwapp.driver().trigger('callApp', {
            call : 'db_list_keys',
            data : {}
        });

        return Storage;
    };

    /**
     * Remove a specific key in the native db.
     * @param {string} key The key to remove
     * @return {Storage} The Storage object
     */
    Storage.prototype.remove = function storageRemove(key){
        window.Kiwapp.driver().trigger('callApp', {
            call : 'db_delete',
            data : {
                key : key
            }
        });

        return Storage;
    };

    /**
     * Clear the native db
     * @return {Storage} The Storage object
     */
    Storage.prototype.clear = function storageClear(){
        window.Kiwapp.driver().trigger('callApp', {
            call : 'db_clear',
            data : {}
        });

        return Storage;
    };

    /*!
     * Launch the event listening
     */
    function observeEvents(_self){
        window.Kiwapp.driver().on('dbAnswerValue', function(answer){
            _self.trigger('get', answer);
        });
        window.Kiwapp.driver().on('dbAnswerKeys', function(answer){
            _self.trigger('keys', answer);
        });
    }

    module.exports = Storage;
})();

},{"../../utils/event":14,"../../utils/increaseCapability":17}],12:[function(require,module,exports){
/*
 * A JavaScript implementation of the RSA Data Security, Inc. MD5 Message
 * Digest Algorithm, as defined in RFC 1321.
 * Version 2.2 Copyright (C) Paul Johnston 1999 - 2009
 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
 * Distributed under the BSD License
 * See http://pajhome.org.uk/crypt/md5 for more info.
 */

/*
 * Configurable variables. You may need to tweak these to be compatible with
 * the server-side, but the defaults work in most cases.
 */
var hexcase = 0;   /* hex output format. 0 - lowercase; 1 - uppercase        */
var b64pad  = "";  /* base-64 pad character. "=" for strict RFC compliance   */

/*
 * These are the functions you'll usually want to call
 * They take string arguments and return either hex or base-64 encoded strings
 */
function hex_md5(s)    { return rstr2hex(rstr_md5(str2rstr_utf8(s))); }
module.exports = hex_md5;
function b64_md5(s)    { return rstr2b64(rstr_md5(str2rstr_utf8(s))); }
function any_md5(s, e) { return rstr2any(rstr_md5(str2rstr_utf8(s)), e); }
function hex_hmac_md5(k, d)
  { return rstr2hex(rstr_hmac_md5(str2rstr_utf8(k), str2rstr_utf8(d))); }
function b64_hmac_md5(k, d)
  { return rstr2b64(rstr_hmac_md5(str2rstr_utf8(k), str2rstr_utf8(d))); }
function any_hmac_md5(k, d, e)
  { return rstr2any(rstr_hmac_md5(str2rstr_utf8(k), str2rstr_utf8(d)), e); }

/*
 * Perform a simple self-test to see if the VM is working
 */
function md5_vm_test()
{
  return hex_md5("abc").toLowerCase() == "900150983cd24fb0d6963f7d28e17f72";
}

/*
 * Calculate the MD5 of a raw string
 */
function rstr_md5(s)
{
  return binl2rstr(binl_md5(rstr2binl(s), s.length * 8));
}

/*
 * Calculate the HMAC-MD5, of a key and some data (raw strings)
 */
function rstr_hmac_md5(key, data)
{
  var bkey = rstr2binl(key);
  if(bkey.length > 16) bkey = binl_md5(bkey, key.length * 8);

  var ipad = Array(16), opad = Array(16);
  for(var i = 0; i < 16; i++)
  {
    ipad[i] = bkey[i] ^ 0x36363636;
    opad[i] = bkey[i] ^ 0x5C5C5C5C;
  }

  var hash = binl_md5(ipad.concat(rstr2binl(data)), 512 + data.length * 8);
  return binl2rstr(binl_md5(opad.concat(hash), 512 + 128));
}

/*
 * Convert a raw string to a hex string
 */
function rstr2hex(input)
{
  try { hexcase } catch(e) { hexcase=0; }
  var hex_tab = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
  var output = "";
  var x;
  for(var i = 0; i < input.length; i++)
  {
    x = input.charCodeAt(i);
    output += hex_tab.charAt((x >>> 4) & 0x0F)
           +  hex_tab.charAt( x        & 0x0F);
  }
  return output;
}

/*
 * Convert a raw string to a base-64 string
 */
function rstr2b64(input)
{
  try { b64pad } catch(e) { b64pad=''; }
  var tab = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  var output = "";
  var len = input.length;
  for(var i = 0; i < len; i += 3)
  {
    var triplet = (input.charCodeAt(i) << 16)
                | (i + 1 < len ? input.charCodeAt(i+1) << 8 : 0)
                | (i + 2 < len ? input.charCodeAt(i+2)      : 0);
    for(var j = 0; j < 4; j++)
    {
      if(i * 8 + j * 6 > input.length * 8) output += b64pad;
      else output += tab.charAt((triplet >>> 6*(3-j)) & 0x3F);
    }
  }
  return output;
}

/*
 * Convert a raw string to an arbitrary string encoding
 */
function rstr2any(input, encoding)
{
  var divisor = encoding.length;
  var i, j, q, x, quotient;

  /* Convert to an array of 16-bit big-endian values, forming the dividend */
  var dividend = Array(Math.ceil(input.length / 2));
  for(i = 0; i < dividend.length; i++)
  {
    dividend[i] = (input.charCodeAt(i * 2) << 8) | input.charCodeAt(i * 2 + 1);
  }

  /*
   * Repeatedly perform a long division. The binary array forms the dividend,
   * the length of the encoding is the divisor. Once computed, the quotient
   * forms the dividend for the next step. All remainders are stored for later
   * use.
   */
  var full_length = Math.ceil(input.length * 8 /
                                    (Math.log(encoding.length) / Math.log(2)));
  var remainders = Array(full_length);
  for(j = 0; j < full_length; j++)
  {
    quotient = Array();
    x = 0;
    for(i = 0; i < dividend.length; i++)
    {
      x = (x << 16) + dividend[i];
      q = Math.floor(x / divisor);
      x -= q * divisor;
      if(quotient.length > 0 || q > 0)
        quotient[quotient.length] = q;
    }
    remainders[j] = x;
    dividend = quotient;
  }

  /* Convert the remainders to the output string */
  var output = "";
  for(i = remainders.length - 1; i >= 0; i--)
    output += encoding.charAt(remainders[i]);

  return output;
}

/*
 * Encode a string as utf-8.
 * For efficiency, this assumes the input is valid utf-16.
 */
function str2rstr_utf8(input)
{
  var output = "";
  var i = -1;
  var x, y;

  while(++i < input.length)
  {
    /* Decode utf-16 surrogate pairs */
    x = input.charCodeAt(i);
    y = i + 1 < input.length ? input.charCodeAt(i + 1) : 0;
    if(0xD800 <= x && x <= 0xDBFF && 0xDC00 <= y && y <= 0xDFFF)
    {
      x = 0x10000 + ((x & 0x03FF) << 10) + (y & 0x03FF);
      i++;
    }

    /* Encode output as utf-8 */
    if(x <= 0x7F)
      output += String.fromCharCode(x);
    else if(x <= 0x7FF)
      output += String.fromCharCode(0xC0 | ((x >>> 6 ) & 0x1F),
                                    0x80 | ( x         & 0x3F));
    else if(x <= 0xFFFF)
      output += String.fromCharCode(0xE0 | ((x >>> 12) & 0x0F),
                                    0x80 | ((x >>> 6 ) & 0x3F),
                                    0x80 | ( x         & 0x3F));
    else if(x <= 0x1FFFFF)
      output += String.fromCharCode(0xF0 | ((x >>> 18) & 0x07),
                                    0x80 | ((x >>> 12) & 0x3F),
                                    0x80 | ((x >>> 6 ) & 0x3F),
                                    0x80 | ( x         & 0x3F));
  }
  return output;
}

/*
 * Encode a string as utf-16
 */
function str2rstr_utf16le(input)
{
  var output = "";
  for(var i = 0; i < input.length; i++)
    output += String.fromCharCode( input.charCodeAt(i)        & 0xFF,
                                  (input.charCodeAt(i) >>> 8) & 0xFF);
  return output;
}

function str2rstr_utf16be(input)
{
  var output = "";
  for(var i = 0; i < input.length; i++)
    output += String.fromCharCode((input.charCodeAt(i) >>> 8) & 0xFF,
                                   input.charCodeAt(i)        & 0xFF);
  return output;
}

/*
 * Convert a raw string to an array of little-endian words
 * Characters >255 have their high-byte silently ignored.
 */
function rstr2binl(input)
{
  var output = Array(input.length >> 2);
  for(var i = 0; i < output.length; i++)
    output[i] = 0;
  for(var i = 0; i < input.length * 8; i += 8)
    output[i>>5] |= (input.charCodeAt(i / 8) & 0xFF) << (i%32);
  return output;
}

/*
 * Convert an array of little-endian words to a string
 */
function binl2rstr(input)
{
  var output = "";
  for(var i = 0; i < input.length * 32; i += 8)
    output += String.fromCharCode((input[i>>5] >>> (i % 32)) & 0xFF);
  return output;
}

/*
 * Calculate the MD5 of an array of little-endian words, and a bit length.
 */
function binl_md5(x, len)
{
  /* append padding */
  x[len >> 5] |= 0x80 << ((len) % 32);
  x[(((len + 64) >>> 9) << 4) + 14] = len;

  var a =  1732584193;
  var b = -271733879;
  var c = -1732584194;
  var d =  271733878;

  for(var i = 0; i < x.length; i += 16)
  {
    var olda = a;
    var oldb = b;
    var oldc = c;
    var oldd = d;

    a = md5_ff(a, b, c, d, x[i+ 0], 7 , -680876936);
    d = md5_ff(d, a, b, c, x[i+ 1], 12, -389564586);
    c = md5_ff(c, d, a, b, x[i+ 2], 17,  606105819);
    b = md5_ff(b, c, d, a, x[i+ 3], 22, -1044525330);
    a = md5_ff(a, b, c, d, x[i+ 4], 7 , -176418897);
    d = md5_ff(d, a, b, c, x[i+ 5], 12,  1200080426);
    c = md5_ff(c, d, a, b, x[i+ 6], 17, -1473231341);
    b = md5_ff(b, c, d, a, x[i+ 7], 22, -45705983);
    a = md5_ff(a, b, c, d, x[i+ 8], 7 ,  1770035416);
    d = md5_ff(d, a, b, c, x[i+ 9], 12, -1958414417);
    c = md5_ff(c, d, a, b, x[i+10], 17, -42063);
    b = md5_ff(b, c, d, a, x[i+11], 22, -1990404162);
    a = md5_ff(a, b, c, d, x[i+12], 7 ,  1804603682);
    d = md5_ff(d, a, b, c, x[i+13], 12, -40341101);
    c = md5_ff(c, d, a, b, x[i+14], 17, -1502002290);
    b = md5_ff(b, c, d, a, x[i+15], 22,  1236535329);

    a = md5_gg(a, b, c, d, x[i+ 1], 5 , -165796510);
    d = md5_gg(d, a, b, c, x[i+ 6], 9 , -1069501632);
    c = md5_gg(c, d, a, b, x[i+11], 14,  643717713);
    b = md5_gg(b, c, d, a, x[i+ 0], 20, -373897302);
    a = md5_gg(a, b, c, d, x[i+ 5], 5 , -701558691);
    d = md5_gg(d, a, b, c, x[i+10], 9 ,  38016083);
    c = md5_gg(c, d, a, b, x[i+15], 14, -660478335);
    b = md5_gg(b, c, d, a, x[i+ 4], 20, -405537848);
    a = md5_gg(a, b, c, d, x[i+ 9], 5 ,  568446438);
    d = md5_gg(d, a, b, c, x[i+14], 9 , -1019803690);
    c = md5_gg(c, d, a, b, x[i+ 3], 14, -187363961);
    b = md5_gg(b, c, d, a, x[i+ 8], 20,  1163531501);
    a = md5_gg(a, b, c, d, x[i+13], 5 , -1444681467);
    d = md5_gg(d, a, b, c, x[i+ 2], 9 , -51403784);
    c = md5_gg(c, d, a, b, x[i+ 7], 14,  1735328473);
    b = md5_gg(b, c, d, a, x[i+12], 20, -1926607734);

    a = md5_hh(a, b, c, d, x[i+ 5], 4 , -378558);
    d = md5_hh(d, a, b, c, x[i+ 8], 11, -2022574463);
    c = md5_hh(c, d, a, b, x[i+11], 16,  1839030562);
    b = md5_hh(b, c, d, a, x[i+14], 23, -35309556);
    a = md5_hh(a, b, c, d, x[i+ 1], 4 , -1530992060);
    d = md5_hh(d, a, b, c, x[i+ 4], 11,  1272893353);
    c = md5_hh(c, d, a, b, x[i+ 7], 16, -155497632);
    b = md5_hh(b, c, d, a, x[i+10], 23, -1094730640);
    a = md5_hh(a, b, c, d, x[i+13], 4 ,  681279174);
    d = md5_hh(d, a, b, c, x[i+ 0], 11, -358537222);
    c = md5_hh(c, d, a, b, x[i+ 3], 16, -722521979);
    b = md5_hh(b, c, d, a, x[i+ 6], 23,  76029189);
    a = md5_hh(a, b, c, d, x[i+ 9], 4 , -640364487);
    d = md5_hh(d, a, b, c, x[i+12], 11, -421815835);
    c = md5_hh(c, d, a, b, x[i+15], 16,  530742520);
    b = md5_hh(b, c, d, a, x[i+ 2], 23, -995338651);

    a = md5_ii(a, b, c, d, x[i+ 0], 6 , -198630844);
    d = md5_ii(d, a, b, c, x[i+ 7], 10,  1126891415);
    c = md5_ii(c, d, a, b, x[i+14], 15, -1416354905);
    b = md5_ii(b, c, d, a, x[i+ 5], 21, -57434055);
    a = md5_ii(a, b, c, d, x[i+12], 6 ,  1700485571);
    d = md5_ii(d, a, b, c, x[i+ 3], 10, -1894986606);
    c = md5_ii(c, d, a, b, x[i+10], 15, -1051523);
    b = md5_ii(b, c, d, a, x[i+ 1], 21, -2054922799);
    a = md5_ii(a, b, c, d, x[i+ 8], 6 ,  1873313359);
    d = md5_ii(d, a, b, c, x[i+15], 10, -30611744);
    c = md5_ii(c, d, a, b, x[i+ 6], 15, -1560198380);
    b = md5_ii(b, c, d, a, x[i+13], 21,  1309151649);
    a = md5_ii(a, b, c, d, x[i+ 4], 6 , -145523070);
    d = md5_ii(d, a, b, c, x[i+11], 10, -1120210379);
    c = md5_ii(c, d, a, b, x[i+ 2], 15,  718787259);
    b = md5_ii(b, c, d, a, x[i+ 9], 21, -343485551);

    a = safe_add(a, olda);
    b = safe_add(b, oldb);
    c = safe_add(c, oldc);
    d = safe_add(d, oldd);
  }
  return Array(a, b, c, d);
}

/*
 * These functions implement the four basic operations the algorithm uses.
 */
function md5_cmn(q, a, b, x, s, t)
{
  return safe_add(bit_rol(safe_add(safe_add(a, q), safe_add(x, t)), s),b);
}
function md5_ff(a, b, c, d, x, s, t)
{
  return md5_cmn((b & c) | ((~b) & d), a, b, x, s, t);
}
function md5_gg(a, b, c, d, x, s, t)
{
  return md5_cmn((b & d) | (c & (~d)), a, b, x, s, t);
}
function md5_hh(a, b, c, d, x, s, t)
{
  return md5_cmn(b ^ c ^ d, a, b, x, s, t);
}
function md5_ii(a, b, c, d, x, s, t)
{
  return md5_cmn(c ^ (b | (~d)), a, b, x, s, t);
}

/*
 * Add integers, wrapping at 2^32. This uses 16-bit operations internally
 * to work around bugs in some JS interpreters.
 */
function safe_add(x, y)
{
  var lsw = (x & 0xFFFF) + (y & 0xFFFF);
  var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
  return (msw << 16) | (lsw & 0xFFFF);
}

/*
 * Bitwise rotate a 32-bit number to the left.
 */
function bit_rol(num, cnt)
{
  return (num << cnt) | (num >>> (32 - cnt));
}
},{}],13:[function(require,module,exports){
/* jshint ignore:start */
'use strict';
(function(){
    var type;
    try {
      type = require('type-of');
    } catch (ex) {
      //hide from browserify
      var r = require;
      type = r('type');
    }

    var jsonpID = 0,
        document = window.document,
        key,
        name,
        rscript = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        scriptTypeRE = /^(?:text|application)\/javascript/i,
        xmlTypeRE = /^(?:text|application)\/xml/i,
        jsonType = 'application/json',
        htmlType = 'text/html',
        blankRE = /^\s*$/;

    var ajax = module.exports = function(options){
      var settings = extend({}, options || {});
      for (var key in ajax.settings) if (settings[key] === undefined) settings[key] = ajax.settings[key];

      ajaxStart(settings);

      if (!settings.crossDomain) settings.crossDomain = /^([\w-]+:)?\/\/([^\/]+)/.test(settings.url) &&
        RegExp.$2 !== window.location.host;

      var dataType = settings.dataType, hasPlaceholder = /=\?/.test(settings.url);
      if (dataType === 'jsonp' || hasPlaceholder) {
        if (!hasPlaceholder) settings.url = appendQuery(settings.url, 'callback=?');
        return ajax.JSONP(settings);
      }

      if (!settings.url) settings.url = window.location.toString();
      serializeData(settings);

      var mime = settings.accepts[dataType],
          baseHeaders = { },
          protocol = /^([\w-]+:)\/\//.test(settings.url) ? RegExp.$1 : window.location.protocol,
          xhr = ajax.settings.xhr(), abortTimeout;

      if (!settings.crossDomain) baseHeaders['X-Requested-With'] = 'XMLHttpRequest';
      if (mime) {
        baseHeaders.Accept = mime;
        if (mime.indexOf(',') > -1) mime = mime.split(',', 2)[0];
        xhr.overrideMimeType && xhr.overrideMimeType(mime)
      }
      if (settings.contentType || (settings.data && settings.type.toUpperCase() !== 'GET'))
        baseHeaders['Content-Type'] = (settings.contentType || 'application/x-www-form-urlencoded');
      settings.headers = extend(baseHeaders, settings.headers || {});

      xhr.onreadystatechange = function(){
        if (xhr.readyState === 4) {
          clearTimeout(abortTimeout);
          var result, error = false;
          if ((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304 || (xhr.status === 0 && protocol === 'file:')) {
            dataType = dataType || mimeToDataType(xhr.getResponseHeader('content-type'));
            result = xhr.responseText;

            try {
              if (dataType === 'script')    (1,eval)(result);
              else if (dataType === 'xml')  result = xhr.responseXML;
              else if (dataType === 'json') result = blankRE.test(result) ? null : JSON.parse(result);
            } catch (e) { error = e };

            if (error) ajaxError(error, 'parsererror', xhr, settings);
            else ajaxSuccess(result, xhr, settings);
          } else {
            ajaxError(null, 'error', xhr, settings);
          }
        }
      };

      var async = 'async' in settings ? settings.async : true;
      xhr.open(settings.type, settings.url, async);

      for (var name in settings.headers) xhr.setRequestHeader(name, settings.headers[name]);

      if (ajaxBeforeSend(xhr, settings) === false) {
        xhr.abort();
        return false;
      }

      if (settings.timeout > 0) abortTimeout = setTimeout(function(){
          xhr.onreadystatechange = empty
          xhr.abort()
          ajaxError(null, 'timeout', xhr, settings)
        }, settings.timeout)

      // avoid sending empty string (#319)
      xhr.send(settings.data ? settings.data : null)
      return xhr
    }


    // trigger a custom event and return false if it was cancelled
    function triggerAndReturn(context, eventName, data) {
      //todo: Fire off some events
      //var event = $.Event(eventName)
      //$(context).trigger(event, data)
      return true;//!event.defaultPrevented
    }

    // trigger an Ajax "global" event
    function triggerGlobal(settings, context, eventName, data) {
      if (settings.global) return triggerAndReturn(context || document, eventName, data)
    }

    // Number of active Ajax requests
    ajax.active = 0

    function ajaxStart(settings) {
      if (settings.global && ajax.active++ === 0) triggerGlobal(settings, null, 'ajaxStart')
    }
    function ajaxStop(settings) {
      if (settings.global && !(--ajax.active)) triggerGlobal(settings, null, 'ajaxStop')
    }

    // triggers an extra global event "ajaxBeforeSend" that's like "ajaxSend" but cancelable
    function ajaxBeforeSend(xhr, settings) {
      var context = settings.context
      if (settings.beforeSend.call(context, xhr, settings) === false ||
          triggerGlobal(settings, context, 'ajaxBeforeSend', [xhr, settings]) === false)
        return false

      triggerGlobal(settings, context, 'ajaxSend', [xhr, settings])
    }
    function ajaxSuccess(data, xhr, settings) {
      var context = settings.context, status = 'success'
      settings.success.call(context, data, status, xhr)
      triggerGlobal(settings, context, 'ajaxSuccess', [xhr, settings, data])
      ajaxComplete(status, xhr, settings)
    }
    // type: "timeout", "error", "abort", "parsererror"
    function ajaxError(error, type, xhr, settings) {
      var context = settings.context
      settings.error.call(context, xhr, type, error)
      triggerGlobal(settings, context, 'ajaxError', [xhr, settings, error])
      ajaxComplete(type, xhr, settings)
    }
    // status: "success", "notmodified", "error", "timeout", "abort", "parsererror"
    function ajaxComplete(status, xhr, settings) {
      var context = settings.context
      settings.complete.call(context, xhr, status)
      triggerGlobal(settings, context, 'ajaxComplete', [xhr, settings])
      ajaxStop(settings)
    }

    // Empty function, used as default callback
    function empty() {}

    ajax.JSONP = function(options){
      if (!('type' in options)) return ajax(options)

      var callbackName = 'jsonp' + (++jsonpID),
        script = document.createElement('script'),
        abort = function(){
          //todo: remove script
          //$(script).remove()
          if (callbackName in window) window[callbackName] = empty
          ajaxComplete('abort', xhr, options)
        },
        xhr = { abort: abort }, abortTimeout,
        head = document.getElementsByTagName("head")[0]
          || document.documentElement

      if (options.error) script.onerror = function() {
        xhr.abort()
        options.error()
      }

      window[callbackName] = function(data){
        clearTimeout(abortTimeout)
          //todo: remove script
          //$(script).remove()
        delete window[callbackName]
        ajaxSuccess(data, xhr, options)
      }

      serializeData(options)
      script.src = options.url.replace(/=\?/, '=' + callbackName)

      // Use insertBefore instead of appendChild to circumvent an IE6 bug.
      // This arises when a base node is used (see jQuery bugs #2709 and #4378).
      head.insertBefore(script, head.firstChild);

      if (options.timeout > 0) abortTimeout = setTimeout(function(){
          xhr.abort()
          ajaxComplete('timeout', xhr, options)
        }, options.timeout)

      return xhr
    }

    ajax.settings = {
      // Default type of request
      type: 'GET',
      // Callback that is executed before request
      beforeSend: empty,
      // Callback that is executed if the request succeeds
      success: empty,
      // Callback that is executed the the server drops error
      error: empty,
      // Callback that is executed on request complete (both: error and success)
      complete: empty,
      // The context for the callbacks
      context: null,
      // Whether to trigger "global" Ajax events
      global: true,
      // Transport
      xhr: function () {
        return new window.XMLHttpRequest()
      },
      // MIME types mapping
      accepts: {
        script: 'text/javascript, application/javascript',
        json:   jsonType,
        xml:    'application/xml, text/xml',
        html:   htmlType,
        text:   'text/plain'
      },
      // Whether the request is to another domain
      crossDomain: false,
      // Default timeout
      timeout: 0
    }

    function mimeToDataType(mime) {
      return mime && ( mime == htmlType ? 'html' :
        mime == jsonType ? 'json' :
        scriptTypeRE.test(mime) ? 'script' :
        xmlTypeRE.test(mime) && 'xml' ) || 'text'
    }

    function appendQuery(url, query) {
      return (url + '&' + query).replace(/[&?]{1,2}/, '?')
    }

    // serialize payload and append it to the URL for GET requests
    function serializeData(options) {
      if (type(options.data) === 'object') options.data = param(options.data)
      if (options.data && (!options.type || options.type.toUpperCase() == 'GET'))
        options.url = appendQuery(options.url, options.data)
    }

    ajax.get = function(url, success){ return ajax({ url: url, success: success }) }

    ajax.post = function(url, data, success, dataType){
      if (type(data) === 'function') dataType = dataType || success, success = data, data = null
      return ajax({ type: 'POST', url: url, data: data, success: success, dataType: dataType })
    }

    ajax.getJSON = function(url, success){
      return ajax({ url: url, success: success, dataType: 'json' })
    }

    var escape = encodeURIComponent

    function serialize(params, obj, traditional, scope){
      var array = type(obj) === 'array';
      for (var key in obj) {
        var value = obj[key];

        if (scope) key = traditional ? scope : scope + '[' + (array ? '' : key) + ']'
        // handle data in serializeArray() format
        if (!scope && array) params.add(value.name, value.value)
        // recurse into nested objects
        else if (traditional ? (type(value) === 'array') : (type(value) === 'object'))
          serialize(params, value, traditional, key)
        else params.add(key, value)
      }
    }

    function param(obj, traditional){
      var params = []
      params.add = function(k, v){ this.push(escape(k) + '=' + escape(v)) }
      serialize(params, obj, traditional)
      return params.join('&').replace('%20', '+')
    }

    function extend(target) {
      var slice = Array.prototype.slice;
      slice.call(arguments, 1).forEach(function(source) {
        for (key in source)
          if (source[key] !== undefined)
            target[key] = source[key]
      })
      return target
    }
})();
/* jshint ignore:end */
},{"type-of":1}],14:[function(require,module,exports){
'use strict';
(function(){
    function EventEmitter(){
        this.events = {};
    }

    EventEmitter.prototype.on = function(eventName, callback, instance) {

        if(!this.events[eventName]) {
            this.events[eventName] = [];
        }

        this.events[eventName].push({callback : callback, instance : instance});
    };

    EventEmitter.prototype.clean = function(eventName) {
        if(!this.events[eventName]) {
            this.events[eventName] = [];
        }
        this.events[eventName] = [];
    };

    EventEmitter.prototype.trigger = function(events) {

        var args = Array.prototype.slice.call(arguments);
        args.shift();

        if(!Array.isArray(events)) {
            events = [events];
        }

        for(var i = 0; i < events.length; i++) {

            var eventName = events[i],
                splitName = eventName.split('*');

            if(splitName.length <= 1){
                if(!this.events[eventName]) {
                    continue;
                }

                for(var o = 0; o < this.events[eventName].length; o++) {
                    this.events[eventName][o].callback.apply(this.events[eventName][o].instance , args);
                }

            } else{
                for(var x in this.events) {

                    if(x.indexOf(splitName[1]) > -1) {
                        eventName = x;

                        for(var u = 0; u < this.events[eventName].length; u++) {
                            this.events[eventName][u].callback.apply(this.events[eventName][u].instance, args);
                        }
                    }
                }
            }
        }
    };

    module.exports = EventEmitter;
})();

},{}],15:[function(require,module,exports){
'use strict';
(function(){
    /**
     * A method which imitate jQuery extend method
     * @return {object} The concat final object
     */
    module.exports = function extend(){
        for(var i=1; i<arguments.length; i++)
            for(var key in arguments[i])
                if(arguments[i].hasOwnProperty(key))
                    arguments[0][key] = arguments[i][key];
        return arguments[0];
    };
})();
},{}],16:[function(require,module,exports){
'use strict';
(function(){
    /**
     * Compute the current date
     * @return {string} The current date
     */
    module.exports = function getDate(){
        var time = new Date();
        var day = String(time.getDate());
        if(day.length === 1) day = 0+day;
        var month = String(time.getMonth()+1);
        if(month.length === 1) month = 0+month;

        return time.getFullYear()+'-'+month+'-'+day + ' ' + time.toTimeString().split(' ')[0];
    };
})();
},{}],17:[function(require,module,exports){
'use strict';
(function(){
    /**
     * Increase a target prototype to add him the methods of an other
     * @param  {object} target       The prototype to target
     * @param  {object} capabilities The prototype to inherit
     */
    module.exports = function increaseCapability(target, capabilities){
        for(var i in capabilities){
            target[i] = capabilities[i];
        }
    };
})();
},{}],18:[function(require,module,exports){
'use strict';
(function(){
    /**
     * A method to load a jsFile, with a callback becase of async loading
     * @param {string}   path     The path to a js file
     * @param {Function} callback Optionnal callback because of async loading
     */
    module.exports = function loadJS(url, callback) {
        var module = document.createElement('script');
        module.src = url;
        var container = document.head;
        container.appendChild(module);
        module.addEventListener('load', function(){
            //removing the script because it is useless in DOM
            container.removeChild(module);
            if(callback !== undefined){
                callback();
            }
        });
    };
})();

},{}],19:[function(require,module,exports){
'use strict';
(function(){
    /**
     * Model object
     */
    function Model(){
        this.attributes = {};
    }

    /**
     * An attributes getter
     * If value is undefined, we return the whole object 
     * @param  {string} value the config value to get
     * @return {multi}       the wanted value/the whole object 
     */
    Model.prototype.set = function(key, value){
        if(typeof key === 'object'){
            for(var i in key){
                this.attributes[i] = key[i];
            }
        }
        else{
            this.attributes[key] = value;
        }

        return this;
    };

    /**
     * An attribute setter
     * @param {string/object} key   if a string, this is the value to modify, if an object, this is a set of key : value to modify
     * @param {multi} value the value to associate to the key
     */
    Model.prototype.get = function(key){
        return this.attributes[key];
    };

    module.exports = Model;
})();
},{}],20:[function(require,module,exports){
'use strict';
(function(){
    /**
     * The export of all utils
     * @type {Object}
     */
    module.exports = {
        extend : require('./extend'),
        loadJS : require('./loadJS'),
        Model : require('./model'),
        increaseCapability : require('./increaseCapability'),
        EventEmitter : require('./event'),
        getDate : require('./getDate'),
        ajax : require('./ajax'),
    };
})();
},{"./ajax":13,"./event":14,"./extend":15,"./getDate":16,"./increaseCapability":17,"./loadJS":18,"./model":19}]},{},[6]);