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
     * Save a stat of type : page
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
     * Save a stat of type : event
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
