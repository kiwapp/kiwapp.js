(function(){

    'use strict';
    /**
    *  browserify modules dependencies
    **/
    var increase = require('../../utils/increaseCapability'),
        EventEmitter = require('../../utils/event');

    /**
     * Storage object
     * @constructor
     */
    function Storage(){
        EventEmitter.call(this);
    }

    /**
     * Adding capabilities to Storage prototype
     */
    increase(Storage.prototype, EventEmitter.prototype);

    /**
     * Get a specific key in the custom browser db.
     * Because of asynchronous, you have to listen the 'get' event before use it.
     * In your event callback, the first parameter will be the answer as :
     * {
     *     deviceID : '8764878GI2G8Y2',
     *     deviceType : 'db_get',
     *     deviceInfo : 'your requested key',
     *     deviceData : 'your wanted value'
     * }
     * @param  {string} key The key of the wanted value
     * @return {Storage}     The storage object
     */
    Storage.prototype.get = function storageGet(key){

        var self = this,
            get  = localStorage.getItem('storage_' + key);

        setTimeout(function() {
            self.trigger('get',{
                deviceID : '8764878GI2G8Y2',
                deviceType : 'db_get',
                deviceInfo : key,
                deviceData : get
            });
        }, 0);

        return Storage;
    };

    /**
     * Set a value assiciated to a key in the custom browser db.
     * @param {string} key   The key of the storde value
     * @param {multiple} value The value to store
     * @return {Storage} The Storage object
     */
    Storage.prototype.set = function storageSet(key, value) {
        if(typeof value !== 'string'){
            value = JSON.stringify(value);
        }
        localStorage.setItem('storage_' + key, value);
        return Storage;
    };

    /**
     * Get all the stored keys in the custom browser db.
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

        var self = this,
            keys = Object.keys(localStorage).filter(function(item) {
                return /storage_*/.test(item);
            });

        setTimeout(function() {
            self.trigger('keys', {
                deviceID : '8764878GI2G8Y2',
                deviceType : 'db_list_keys',
                deviceInfo : keys.length,
                deviceData : keys
            });
        }, 0);

        return Storage;
    };

    /**
     * Remove a specific key in the custom browser db.
     * @param  {string} key The key to remove
     * @return {Storage} The Storage object
     */
    Storage.prototype.remove = function storageRemove(key){
        localStorage.removeItem(key);
        return Storage;
    };

    /**
     * Clear the Localstorage custom db
     * @return {Storage} The Storage object
     */
    Storage.prototype.clear = function storageClear(){

        var keys = Object.keys(localStorage).filter(function(item) {
            return /storage_*/.test(item);
        });

        keys.forEach(function(item) {
            localStorage.removeItem(item);
        });
        return Storage;
    };

    module.exports = Storage;
})();
