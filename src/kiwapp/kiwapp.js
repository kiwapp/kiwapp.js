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
     * @param {string/object}   path     The path to a config file, or an object with the config
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

    /**
     * add Kiwapp to window
     * @type {Function}
     */
    window.Kiwapp = Kiwapp;

    module.exports = Kiwapp;

    return Kiwapp;
})();
