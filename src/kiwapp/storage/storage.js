'use strict';
(function(){
    //Browserify modules dependencies
    var increase = require('../../utils/increaseCapability'),
        EventEmitter = require('../../utils/event');

    /**
     * Storage object
     * @constructor
     */
    function Storage(){
        EventEmitter.call(this);
        observeEvents(this);
    }

    // Adding capabilities to Storage prototype
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
     * @param {string} key The key of the wanted value
     * @return {Storage} The storage object
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
     * Set a value associated to a key in the native db.
     * @param {string} key The key of the stored value
     * @param {*} value The value to store
     * @return {Storage} The Storage object
     */
    Storage.prototype.set = function storageSet(key, value){
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
     * @param {string} key The key to remove
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

    /*!
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
