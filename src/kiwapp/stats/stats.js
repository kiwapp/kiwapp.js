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
                shopId : config.shopId
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
            