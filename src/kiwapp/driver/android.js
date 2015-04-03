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

    /**
     * Compute a right url to make a kiwapp driver call
     * @param  {object} config The config to compute the url
     * @return {string}        The processed url
     */
    AndroidDriver.prototype.getDriverUrl = function (config) {
        var args = config.data;
        var url = 'kiwapp://' + config.call + '?';
        var i = 0;
        var tmp = '';

        for (var k in args) {
            if (i > 0) tmp = '&';

            // We double urlencode for the android driver who need a double decode natif side
            url = url + tmp + k + '=' + encodeURIComponent(encodeURIComponent(JSON.stringify(args[k])) || '');
            i++;
        }

        return url;
    };

    module.exports = AndroidDriver;
})();
