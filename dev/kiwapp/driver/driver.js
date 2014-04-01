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
        console.log(msg);
        window.Kiwapp.driver().trigger('callApp', {
            call: 'log',
            data: {
                message : msg
            }
        });

        return this;
    };

    module.exports = Driver;
})();
