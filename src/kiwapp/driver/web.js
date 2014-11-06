'use strict';
(function(){
    /**
    *  browserify modules dependencies
    **/
    var Driver = require('./driver');

    /**
    *  Web object
    *  Constructor create the bridge (iframe)
    **/
    function Web(){
        var _self = this;

        Driver.call(_self);
    }

    /**
     * Get the driver prototype
     */
    Web.prototype = Object.create(Driver.prototype);

    /**
     * Final method to simulate call to native, tracing it in console
     * @type {Function}
     */
    Web.prototype.exec =  function(url, config){

        var log = '';
        if('call' in config && 'log' === config.call) {
            log = config.data.message;
        }

        console.debug('[Web@exec] : simulate native call ' + log, {info : {
            url    : url,
            config : config
        }});
    };

    module.exports = Web;
})();