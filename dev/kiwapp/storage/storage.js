'use strict';
(function(){
    /**
    *  browserify modules dependencies
    **/
    var increase = require('../../utils/increaseCapability'),
        EventEmitter = require('../../utils/event');

    /**
     * Storage object
     */
    function Storage(){
        EventEmitter.call(this);
        observeEvents(this);
    }

    /**
     * Adding capabilities to Storage prototype
     */
    increase(Storage.prototype, EventEmitter.prototype);

    Storage.prototype.get = function storageGet(key){
        window.Kiwapp.driver().trigger('callApp', {
            call : 'db_get',
            data : {
                key : key
            }
        });

        return Storage;
    };

    Storage.prototype.set = function storageSet(key, value){
        if(typeof value !== 'string'){
            value = JSON.stringify(value);
        }
        window.Kiwapp.driver().trigger('callApp', {
            call : 'db_insert',
            data : {
                key : key,
                value : value
            }
        });

        return Storage;
    };

    Storage.prototype.keys = function storageKeys(){
        window.Kiwapp.driver().trigger('callApp', {
            call : 'db_list_keys',
            data : {}
        });

        return Storage;
    };

    Storage.prototype.remove = function storageRemove(key){
        window.Kiwapp.driver().trigger('callApp', {
            call : 'db_delete',
            data : {
                key : key
            }
        });

        return Storage;
    };

    Storage.prototype.clear = function storageClear(){
        window.Kiwapp.driver().trigger('callApp', {
            call : 'db_clear',
            data : {}
        });

        return Storage;
    };

    /**
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