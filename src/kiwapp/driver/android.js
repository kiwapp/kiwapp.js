'use strict';
(function () {

    // Browserify modules dependencies
    var Driver = require('./driver');

    // Get the driver prototype
    AndroidDriver.prototype = Object.create(Driver.prototype);

    /**
     * The Android Driver object
     * @constructor
     */
    function AndroidDriver() {
        Driver.call(this);
    }


    /**
     * Final method to send call to native
     * This method will override the driver/driver.js method
     * @param {string} url The call to native
     * @override
     */
    AndroidDriver.prototype.exec = function exec(url) {
        window.Android.execute(url);
    };

    module.exports = AndroidDriver;
})();
