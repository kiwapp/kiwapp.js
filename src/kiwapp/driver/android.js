'use strict';
(function(){
    /**
    *  browserify modules dependencies
    **/
    var Driver = require('./driver');

    /**
     * The Android object
     */
    function AndroidDriver(){
        Driver.call(this);
    }

    /**
     * Get the driver prototype
     */
    AndroidDriver.prototype = Object.create(Driver.prototype);

    /**
     * Final method to send call to native
     * @param {string} url The call to native
     */
    AndroidDriver.prototype.exec =  function exec(url){
        window.Android.execute(url);
    };

    module.exports = AndroidDriver;
})();
