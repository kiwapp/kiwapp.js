'use strict';
(function(){
    /**
     * The export of all utils
     * @type {Object}
     */
    module.exports = {
        extend : require('./extend'),
        loadJS : require('./loadJS'),
        Model : require('./model'),
        increaseCapability : require('./increaseCapability'),
        EventEmitter : require('./event'),
        getDate : require('./getDate'),
        ajax : require('./ajax'),
    };
})();