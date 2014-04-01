'use strict';
(function(){
    /**
    *  browserify modules dependencies
    **/
    var hex_md5 = require('../../libs/md5');
    var extend = require('../../utils/extend');
    var ajax = require('../../utils/ajax');

    /**
     * store currentIdentifier and deviceIdentifier in private variables to avoid user modifications
     */
    var currentIdentifier, deviceIdentifier, currentURL;
    var currentData = {};

    /**
     * Session object
     */
    function Session(){

    }

    /**
     * A private method to generate the identifier depending on the deviceIdentifier
     * @param  {string} identifier The device identifier
     * @return {string}            The uniqueIdentifier of the session
     */
    function generateIdentifier(identifier){
        var timestamp = Number(new Date());
        return hex_md5(identifier + timestamp);
    }

    /**
     * Launch a new session if there is no current session (generate a new identifier)
     * @param  {string} identifier The device identifier
     * @return {Function}            The session object
     */
    Session.start = function startSession(identifier){
        if(deviceIdentifier === undefined){
            deviceIdentifier = identifier;
        }
        identifier = identifier || deviceIdentifier;
        var newIdentifier = generateIdentifier(identifier);

        if(currentIdentifier === undefined){
            currentData = {};
            currentIdentifier = newIdentifier;
            if(window.Kiwapp !== undefined){
                window.Kiwapp.driver().trigger('callApp', {
                    call : 'interaction_start',
                    data : {}
                });
            }
        }

        return Session;
    };

    /**
     * Close the current session
     * @return {Function} The session object
     */
    Session.end = function endSession(){
        if(window.Kiwapp !== undefined && currentIdentifier !== undefined){
            window.Kiwapp.driver().trigger('callApp', {
                call : 'interaction_end',
                data : {}
            });
        }

        currentIdentifier = undefined;

        return Session;
    };

    /**
     * Return the current session identifier
     * @return {string} The current session identifier
     */
    Session.getIdentifier = function identifierSession(){
        return currentIdentifier;
    };

    /**
     * Stores data in the current data object  
     * If a second argument is defined, a 'currentURL' is defined  
     * This url will be a 'default' url when the send method is called
     * @param  {object} data Data to store
     * @param  {string} url  Default send url
     * @return {Function}     The Session
     */
    Session.store = function storeSession(data, url){
        if(data === undefined)
            return Object.create(currentData);

        if(Session.getIdentifier() !== undefined){
            currentData = extend(currentData, data);
        }

        currentURL = url;

        return Session;
    };

    /**
     * Calls the native with stored data  
     * The driver posts it when online come back, or when a ping signal come to the device  
     * @param  {string} url The url to the webservice which recieve data
     * @return {Function}     The Session
     */
    Session.send = function sendSession(config){
        config = config || currentURL;
        var url, options;
        if(typeof config === 'object'){
            options = manageConfig(config);
            url = config.url;
        }
        else{
            url = config;
        }
        if(window.Kiwapp !== undefined && Object.keys(currentData).length > 0){
            var copy = JSON.parse(JSON.stringify(currentData));
            currentData = {};
            var ajaxConfig = {
                data : copy,
                url : url,
                error : function(){
                    window.Kiwapp.driver().post(copy, 'custom', url, btoa(JSON.stringify(options)));
                }
            };

            for(var i in options){
                ajaxConfig[i] = options[i];
            }
            ajaxConfig.type = ajaxConfig.method;
            ajax(ajaxConfig);
        }

        return Session;
    };

    /**
     * create send configuration
     * @param  {object} config user configuration
     * @param  {object} data   user data
     * @return {object}        built configuration
     */
    function manageConfig(config){
        var options = Object.create(null);

        options.method = config.method;
        options.headers = config.headers;
        options.username = config.username;
        options.password = config.password;

        return options;
    }
    module.exports = Session;
})();