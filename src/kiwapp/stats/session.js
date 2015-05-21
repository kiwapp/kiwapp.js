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
