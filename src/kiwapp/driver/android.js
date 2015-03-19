'use strict';
(function(){

    // Browserify modules dependencies
    var Driver = require('./driver');

    // Get the driver prototype
    AndroidDriver.prototype = Object.create(Driver.prototype);

    /**
     * The Android object
     * @constructor
     */
    function AndroidDriver(){
        Driver.call(this);
    }


    /**
     * Final method to send call to native
     * @param {string} url The call to native
     */
    AndroidDriver.prototype.exec =  function exec(url){
        window.Android.execute(url);
    };

    module.exports = AndroidDriver;
})();
