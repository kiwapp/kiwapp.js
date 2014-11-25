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
     * Set the print string to local storage
     * @param  {string} the string is stock in local storage with a generate key
     * @param  {string} The identifier id for the print (this identifier will be send in the callback method and you can identify the cart what you trying to print)
     * @return {Driver}             the driver object
     */
    AndroidDriver.prototype.print = function(cardText, cardId){

        if(!cardText) {
            console.warn('No text to print');

            return this;
        }
        if(!cardId) {
            cardId = Kiwapp.driver().generateKey();
        }
        window.Kiwapp.driver().trigger('callApp', {
            call : 'print_card',
            data : {
                card_id : cardId,
                card_text : encodeURIComponent(encodeURIComponent(cardText))
            }
        });

        return this;
    };

    /**
     * Final method to send call to native
     * @param {string} url The call to native
     */
    AndroidDriver.prototype.exec =  function exec(url){
        window.Android.execute(url);
    };

    module.exports = AndroidDriver;
})();
