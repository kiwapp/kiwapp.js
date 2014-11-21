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
     * Check if kiwapp_config.js exist inside config folder at the project root
     * Log a console message error if this file is not found
     */
    var http = new XMLHttpRequest();
        http.open('HEAD', '../config/kiwapp_config.js', false);
        http.send();
        if(http.status !== 200) {
            console.log('No kiwapp_config.js file found, check within your config folder or add this folder with this file name inside (view README file: https://github.com/kiwapp/kiwapp.js/blob/master/README.md)');
        }
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
     * Open native app with bridge
     * post android package name for open native app
     * @param  {string} packageName    Package name android app
     */
    Driver.prototype.openNativeApp = function openNativeApp(packageName){
       
        window.Kiwapp.driver().trigger('callApp', {
        call : 'open_native_app',
            data : {
                package_name : packageName
            }
        });

    };

    /**
     * Open html5 app with bridge
     * post android package name for open native app
     * @param  {string} applicationIdentifier    The unique application identifier, this identifier can be found on the Kiwapp manager backoffice
     */
    Driver.prototype.openHTML5App = function openHTML5App(applicationIdentifier){

        window.Kiwapp.driver().trigger('callApp', {
            call : 'open_html5_app',
            data : {
                application_identifier : applicationIdentifier
            }
        });
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
     * Set the print string to local storage
     * @param  {string} the string is stock in local storage with a generate key
     * @return {Driver}             the driver object
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
            call : 'print_card',
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
