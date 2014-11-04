'use strict';
(function(){
    /**
     * Increase a target prototype to add him the methods of an other
     * @param  {object} target       The prototype to target
     * @param  {object} capabilities The prototype to inherit
     */
    module.exports = function increaseCapability(target, capabilities){
        for(var i in capabilities){
            target[i] = capabilities[i];
        }
    };
})();