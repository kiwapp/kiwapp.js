(function(){
    'use strict';
    /**
     * The export of all utils
     * @type {Object}
     */
    module.exports = {
        storage : require('./storage'),
        emulation : require('./StorageBrowser')
    };
})();
