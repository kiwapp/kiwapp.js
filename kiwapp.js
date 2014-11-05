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
(function(){
    /**
    *  browserify modules dependencies
    **/
    var Driver = require('./driver');

    /**
     * The Android object
     */
    function AndroidDriver(){
        Driver.call(this);
    }

    /**
     * Get the driver prototype
     */
    AndroidDriver.prototype = Object.create(Driver.prototype);

    /**
     * Final method to send call to native
     * @param {string} url The call to native
     */
    AndroidDriver.prototype.exec =  function exec(url){
        window.Android.execute(url);
    };

    module.exports = AndroidDriver;
})();

},{"./driver":3}],3:[function(require,module,exports){
'use strict';
(function(){
    /**
    *  browserify modules dependencies
    **/
    var increase = require('../../utils/increaseCapability');
    var extend = require('../../utils/extend');
    var EventEmitter = require('../../utils/event');
    var Model = require('../../utils/model');

    /**
     * The Driver object
     */
    function Driver(){
        EventEmitter.call(this);
        Model.call(this);

        observeEvents(this);
    }

    /**
     * Adding capabilities to Driver prototype
     */
    increase(Driver.prototype, EventEmitter.prototype);
    increase(Driver.prototype, Model.prototype);

    /**
     * Launch the event listening
     */
    function observeEvents(_self){
        _self.on('callApp', _self.catchCallApp, _self);
    }

    /**
     * Compute a right url to make a kiwapp driver call
     * @param  {object} config The config to compute the url
     * @return {string}        The processed url
     */
    Driver.prototype.getDriverUrl = function(config)
    {
        var args = config.data;
        var url = 'kiwapp://'+config.call+'?';
        var i = 0;
        var tmp = '';

        for(var k in args){
            if (i>0) tmp = '&';
            url = url+tmp+k+'='+encodeURIComponent(JSON.stringify(args[k]) || '');
            i++;
        }

        return url;
    };

    /**
     * Catch the callApp event and send it to the native
     * @param  {object} config The call config
     */
    Driver.prototype.catchCallApp = function(config) {
        var _self = this;

        var defaults = {'data':{}};
        config = extend({}, defaults, config);

        var url = _self.getDriverUrl(config);

        _self.exec(url, config);
    };

    /**
     * post method used to post offline entries
     * @param  {object} data    data to send
     * @param  {string} type    define the entry type
     * @param  {url} url     if type is custom, define the url destination
     * @param  {options} options if type is custom, define the send options
     */
    Driver.prototype.post = function(data, type, url, options){
        window.Kiwapp.driver().trigger('callApp', {
            call : 'store_offline_entry',
            data : {
                data : data,
                type : type,
                url : url,
                options : options
            }
        });

        return this;
    };

    /**
     * post method used to post offline entries
     * @param  {object} data    data to send
     * @param  {string} type    define the entry type
     * @param  {url} url     if type is custom, define the url destination
     * @param  {options} options if type is custom, define the send options
     */
    Driver.prototype.print = function(cardId, cardText){
        
        if(!cardText) {
            console.warn('No text to print');

            return this;
        }
        if(!cardId) {
            cardId = Kiwapp.driver().generateKey();
        }
        window.Kiwapp.driver().trigger('callApp', {
            call : 'printCard',
            data : {
                card_id : cardId,
                card_text : cardText
            }
        });

        return this;
    };

    /**
     * Set the device rotation
     * @param  {string} orientation define the wanted orientation
     * @return {Driver}             the driver object
     */
    Driver.prototype.rotate = function(orientation){
        switch(orientation){
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
            call : 'rotation',
            data : {
                orientation : orientation
            }
        });

        return this;
    };

    /**
     * Log a message to the driver
     * @return {Driver} The driver object
     */
    Driver.prototype.log = function log(msg){
        console.debug('[Driver@log] : ',msg);
        window.Kiwapp.driver().trigger('callApp', {
            call: 'log',
            data: {
                message : msg
            }
        });

        return this;
    };

    Driver.prototype.generateKey = function() {
        var key = '';
        var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for( var i=0; i < 5; i++ ) {
            key += possible.charAt(Math.floor(Math.random() * possible.length));
        }

        return 'kw_card_' + key + Math.round(new Date().getTime() / 1000);
    };
    module.exports = Driver;
})();

},{"../../utils/event":14,"../../utils/extend":15,"../../utils/increaseCapability":17,"../../utils/model":19}],4:[function(require,module,exports){
'use strict';
(function(){
    //require Driver interface
    var Driver = require('./driver');

    //memorize the last offline entry ids to earn performances
    var lastId = Object.create(null);

    /**
     * iOS Driver constructor
     */
    function iOS(){
        /*jshint validthis:true */
        var _self = this;
        Driver.call(_self);

        createBridge(_self);
        playQueue = playQueue.bind(_self);
    }

    /**
     * Driver interface implementation
     */
    iOS.prototype = Object.create(Driver.prototype);

    /**
     * method which prepare native call sending on ios
     * @param  {string} url url describing the call
     */
    iOS.prototype.exec = function execIOS(url){
        var _self = this;

        addToQueue(_self, url);
    };

    /**
     * method used by native to get stored offline entries in local storage
     * if the given id is false, return a bad entry with error code 404
     * @param  {string} id the entry id to find in local storage
     * @return {object}    offline entry
     */
    iOS.prototype.entry = function entryIOS(id){
        var entry = window.localStorage[id];
        if(entry === undefined){
            return JSON.stringify({
                error : 404,
                data : ''
            });
        }
        entry = JSON.parse(entry);
        entry.error = 200;
        delete window.localStorage[id];
        return JSON.stringify(entry);
    };

    /**
     * send offline entry call to native, saving it in local storage
     * post method used to post offline entries
     * @param  {object} data    data to send
     * @param  {string} type    define the entry type
     * @param  {url} url     if type is custom, define the url destination
     * @param  {options} options if type is custom, define the send options
     */
    iOS.prototype.post = function postIOS(data, type, url, options){
        var id = findLastId(window.Kiwapp.session().getIdentifier());
        window.localStorage[id] = JSON.stringify({
            data : data
        });

        window.Kiwapp.driver().trigger('callApp', {
            call : 'store_offline_entry',
            data : {
                id : id,
                type : type,
                url : url,
                options : options
            }
        });
    };
    /**
     * Set the print string to local storage
     * @param  {string} the string is stock in local storage with a generate key
     * @return {Driver}             the driver object
     */
    iOS.prototype.print = function(cardId, cardText){

        if(!cardText) {
            console.warn('No text to print');

            return this;
        }

        if(!cardId) {
            cardId = Kiwapp.driver().generateKey();
        }

        var key = Kiwapp.driver().generateKey();

        localStorage.setItem(key, cardText);

        window.Kiwapp.driver().trigger('callApp', {
            call : 'printCard',
            data : {
                card_id : cardId,
                card_id_localStorage : key
            }
        });

        return this;
    };

    /**
     * Get the print string
     * @param  {id} the string is get with the key
     * @return {printString}             the string
     */
    iOS.prototype.getPrintCard = function(id){

        var printString = localStorage.getItem(id);

        if(printString === undefined){
            return JSON.stringify({
                error : 404,
                data : ''
            });
        }

        delete window.localStorage[id];
        return JSON.stringify({
                error : 200,
                data : printString
            });
    };

    function findLastId(identifier){
        var id = (lastId[identifier] === undefined) ? 1  : lastId[identifier];
        while(window.localStorage[identifier + id] !== undefined) {
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

        _self.set({messagingIframe : iframe});
        _self.set({sendMessageQueue : []});
    }

    //play the last member of the call app queue
    function playQueue(){
        /*jshint validthis:true */
        var _self = this;
        var sendMessageQueue = _self.get('sendMessageQueue');

        if(sendMessageQueue.length > 1)
            setTimeout(playQueue, 50);

        send(_self, sendMessageQueue.shift());
    }

    function addToQueue(_self, message){
        var sendMessageQueue = _self.get('sendMessageQueue');

        sendMessageQueue.push(message);
        if(sendMessageQueue.length === 1){
          setTimeout(playQueue, 50);
        }
    }

    function send(_self, message) {
        var messagingIframe = _self.get('messagingIframe');

        messagingIframe.src = message;
    }

    module.exports = iOS;
})();
},{"./driver":3}],5:[function(require,module,exports){
'use strict';
(function(){
    /**
    *  browserify modules dependencies
    **/
    var Driver = require('./driver');

    /**
    *  Web object
    *  Constructor create the bridge (iframe)
    **/
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
     * @type {Function}
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

    /**
    *  browserify modules dependencies
    **/
    var utils = require('../utils/utils');
    var loadJS = utils.loadJS;
    var AndroidDriver = require('./driver/android');
    var IOS = require('./driver/iOS');
    var Web = require('./driver/web');
    var Session = require('./stats/session');
    var Stats = require('./stats/stats');
    var Storage = require('./storage/StorageProxy');

    /**
     * store config, storage and driver in private variables to avoid user modifications
     */
    var config = {}, driver, storage;

    /**
     * Kiwapp is the function which stores all kiwapp.js features
     * To launch it, a path to the 'config.js' file is needed and an optionnal callback because of async loading
     * It's possible to give a simple javascript object instead of a path, for debugging
     * @param {string/object}   path     The path to a config file, or an object with the config
     * @param {Function} callback Optionnal callback because of async loading
     * @return {Function} Kiwapp
     */
    function Kiwapp(path, callback){
        loadConfig(path, callback);
        return Kiwapp;
    }

    /**
     * The driver object getter
     * @return {Function} The bridge to communicate with native kiwapp
     */
    Kiwapp.driver = function(){
        if(driver === undefined)
            loadDriver();

        return driver;
    };

    /**
     * Return your current environement
     * @return {String}
     */
    Kiwapp.env = function() {
        return this.driverInstance;
    };

    /**
     * A config getter
     * If value is undefined, we return the whole config (a copy)
     * @param  {string} value the config value to get
     * @return {multi}       the wanted value/the whole config (copy)
     */
    Kiwapp.get = function get(value){
        if(value === undefined)
            return Object.create(config);

        if(typeof config[value] === 'object')
            return Object.create(config[value]);

        return config[value];
    };

    /**
     * A config setter
     * @param {string/object} key   if a string, this is the value to modify, if an object, this is a set of key : value to modify
     * @param {multi} value the value to associate to the key
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
     * @return {Function} The object containing session's management
     */
    Kiwapp.session = function session(){
        if(Session.getIdentifier() === undefined){
            Session.start(Kiwapp.get('appParameters').deviceIdentifier);
        }

        return Session;
    };

    /**
     * The stats object getter
     * @return {Function} The object containing stats's management
     */
    Kiwapp.stats = function stats(){
        return Stats;
    };

    /**
     * The storage object getter
     * @return {Function} The object containing storage's management
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
     * @return {Kiwapp} Kiwapp itself
     */
    Kiwapp.log = function log(msg){
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
     * getKDSWriterCredentials getter for kds credential object
     * @return object
     */
    Kiwapp.getKDSWriterCredentials = function getKDSCredentials(){
    var object   = Kiwapp.get().webHooksParameters;
    var kdsCredentials = {};

    if(object.KDS_INSTANCIATE_RESPONSE!==undefined){
        try {
            kdsCredentials = object.KDS_INSTANCIATE_RESPONSE.app;
            }
        catch(e){
                Kiwapp.log('please verify your credential for writing');
            }
        }

    return kdsCredentials;
    };

    /**
     * Call the native to rotate the webview
     * @return {Kiwapp} Kiwapp itself
     */
    Kiwapp.rotate = function rotate(orientation){
        Kiwapp.driver().rotate(orientation);

        return Kiwapp;
    };

    /**
     * Close the current application
     * @return {Kiwapp} Kiwapp itself
     */
    Kiwapp.close = function close(){
        Kiwapp.driver().trigger('callApp', {
            call : 'close_animation',
            data : {}
        });

        return Kiwapp;
    };

    Kiwapp.version = require('./version');

    /**
     * A private method which load the right driver depending on the config (deviceIdentifier)
     * @return {Function} The bridge to communicate with native kiwapp
     */
    function loadDriver(){
        if(config === undefined || config.appParameters === undefined)
            throw new Error('You can not load driver if config is not set');

        var deviceType = config.appParameters.osID;

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

        return driver;
    }
    /**
     * A private method to load a jsFile or a js object and return the config object
     * @param {string/object}   path     The path to a config file, or an object with the config
     * @param {Function} callback Optionnal callback because of async loading
     * @return {object}            the loaded/assigned config
     */
    function loadConfig(path, callback){
        config = {};
        if(typeof path === 'string')
            loadJS(path, callback);
        else
            Kiwapp.set(path);

        return config;
    }

    /**
     * add Kiwapp to window
     * @type {Function}
     */
    window.Kiwapp = Kiwapp;

    module.exports = Kiwapp;

    return Kiwapp;
})();

},{"../utils/utils":20,"./driver/android":2,"./driver/iOS":4,"./driver/web":5,"./stats/session":7,"./stats/stats":8,"./storage/StorageProxy":10,"./version":12}],7:[function(require,module,exports){

},{}],8:[function(require,module,exports){
'use strict';
(function(){

    /**
    *  browserify modules dependencies
    **/
    var getDate = require('../../utils/getDate');

    /**
     * store stats history in private variables to avoid user modifications
     */
    var stats = Object.create(null);

    /**
     * Stats object
     */
    function Stats(){

    }

    /**
     * Prepare the data format to send it to the native
     * @param  {string} info   The page or the event to send
     * @param  {string} type   Define if it's an event or a page
     * @param  {object} config The Kiwapp config 
     * @return {object}        The final prepared data
     */
    function prepareData(info, type, config){

        var data = {
            data : {
                uniqueIdentifier: config.uniqueIdentifier,
                path: info,
                deviceIdentifier: config.deviceIdentifier,
                date: getDate(),
                appInstanceId : config.appInstanceId,
                shopId : config.shopId,
            },
            type : type
        };

        return data;
    }

    /**
     * Send the offline stats to the native and store it in history
     * @param  {object} data The data object sent to native
     */
    function callNative(data){
        window.Kiwapp.driver().post(data.data, data.type);
        if(stats[data.data.identifierInteraction] === undefined){
            stats[data.data.identifierInteraction] = {};
        }
        stats[data.data.identifierInteraction][data.data.date] = data;
    }
    
    /**
     * Save a stat of type : page
     * @param  {string} page The page name
     * @return {function}    The stats object
     */
    Stats.page = function sendPage(page){
        if(window.Kiwapp !== undefined){
            var config = window.Kiwapp.get('appParameters');
            config.uniqueIdentifier = window.Kiwapp.session().getIdentifier();
            var data = prepareData(page, 'page', config);
            callNative(data);
        }

        return Stats;
    };

    /**
     * Save a stat of type : event
     * @param  {string} page The event name
     * @return {function}    The stats object
     */
    Stats.event = function sendEvent(e){
        if(window.Kiwapp !== undefined){
            var config = window.Kiwapp.get('appParameters');
            config.uniqueIdentifier = window.Kiwapp.session().getIdentifier();
            var data = prepareData(e, 'event', config);
            callNative(data);
        }

        return Stats;
    };

    /**
     * The stats history getter
     * @return {object} Stats history
     */
    Stats.history = function getHistory(){
        return Object.create(stats);
    };

    /**
     * clear history
     * @return {function} Stats object
     */
    Stats.clear = function clearStats(){
        stats = Object.create(null);

        return Stats;
    };

    module.exports = Stats;
})();
            
},{"../../utils/getDate":16}],9:[function(require,module,exports){
(function(){

    'use strict';
    /**
    *  browserify modules dependencies
    **/
    var increase = require('../../utils/increaseCapability'),
        EventEmitter = require('../../utils/event');

    /**
     * Storage object
     */
    function Storage(){
        EventEmitter.call(this);
    }

    /**
     * Adding capabilities to Storage prototype
     */
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
     * @return {Storage}     The storage object
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
    /**
    *  browserify modules dependencies
    **/
    var increase = require('../../utils/increaseCapability'),
        EventEmitter = require('../../utils/event');

    /**
     * Storage object
     */
    function Storage(){
        EventEmitter.call(this);
        observeEvents(this);
    }

    /**
     * Adding capabilities to Storage prototype
     */
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
     * @param  {string} key The key of the wanted value
     * @return {Storage}     The storage object
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
     * Set a value assiciated to a key in the native db.
     * @param {string} key   The key of the storde value
     * @param {multiple} value The value to store
     * @return {Storage} The Storage object
     */
    Storage.prototype.set = function storageSet(key, value){
        if(typeof value !== 'string'){
            value = JSON.stringify(value);
        }
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
     * @param  {string} key The key to remove
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

    /**
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
module.exports = '1.4.6';
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