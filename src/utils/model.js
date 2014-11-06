'use strict';
(function(){
    /**
     * Model object
     */
    function Model(){
        this.attributes = {};
    }

    /**
     * An attributes getter
     * If value is undefined, we return the whole object 
     * @param  {string} value the config value to get
     * @return {multi}       the wanted value/the whole object 
     */
    Model.prototype.set = function(key, value){
        if(typeof key === 'object'){
            for(var i in key){
                this.attributes[i] = key[i];
            }
        }
        else{
            this.attributes[key] = value;
        }

        return this;
    };

    /**
     * An attribute setter
     * @param {string/object} key   if a string, this is the value to modify, if an object, this is a set of key : value to modify
     * @param {multi} value the value to associate to the key
     */
    Model.prototype.get = function(key){
        return this.attributes[key];
    };

    module.exports = Model;
})();