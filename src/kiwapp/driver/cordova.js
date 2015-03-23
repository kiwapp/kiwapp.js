'use strict';
(function(){
    /**
    *  Browserify modules dependencies
    **/
    var Driver = require('./driver');
    var extend = require('../../utils/extend');

    /**
     * The Cordova Driver object
     * @constructor
     */
    function CordovaDriver(){
        Driver.call(this);

        delete this.events.callApp;
        observeEvents(this);
    }

    /**
     * Launch the event listening
     */
    function observeEvents(_self){
        _self.on('callApp', _self.catchCallApp, _self);
    }

    /**
     * Get the driver prototype
     */
    CordovaDriver.prototype = Object.create(Driver.prototype);

    /**
     * Final method to send call to native
     * This method will override the driver/driver.js method
     * @param {string} config The call to native
     */
    CordovaDriver.prototype.exec =  function exec(config){
        window.cordova.exec(function() {}, function() {}, 'Kiwapp', config.call, [config.data]);
    };

    /**
     * Get all the call to the bridge (force all call in the method when you use Cordova bridge)
     * @param {*} config
     */
    CordovaDriver.prototype.catchCallApp = function CordovaCatchCallApp(config){
        var _self = this;

        var defaults = {'data':{}};
        config = extend({}, defaults, config);

        _self.exec(config);
    };

    module.exports = CordovaDriver;
})();
