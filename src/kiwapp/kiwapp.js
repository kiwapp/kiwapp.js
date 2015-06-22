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
    Kiwapp.getKDSWriterCredentials = function getKDSWriterCredentials() {
        var object = Kiwapp.get().webHooksParameters;
        var kdsCredentials = {};

        if (object.KDS_INSTANCIATE_RESPONSE !== undefined) {
            try {
                kdsCredentials = object.KDS_INSTANCIATE_RESPONSE.app;
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
