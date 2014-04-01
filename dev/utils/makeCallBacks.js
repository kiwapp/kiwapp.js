'use strict';
(function(){
var extend = require('./extend');

/**
 * [makeCallBacks build callbacks object for ajax queue Management]
 * @param  {Object} callbacks [input callback to extend]
 * @param  {[type]} loopMax   [the number of member of the same ajax queue]
 * @return {Object}           [extended callback object with default function if needed]
 */
module.exports = function makeCallBacks(callbacks,loopMax) {


var defaults = {
    'onBeforeLoad':function (){},
    'onLoadSuccess':function (){},
    'onLoadError':function (err){console.log('Error on loading item ' + err.message);},
    'onAllDone':function (){},
    '_onAllDone':function (myItem,index){
    if(this._LoadSuccess >= this._LoadMax)
        this.onAllDone(myItem,index);
    },
    '_onLoadSuccess':function (myItem,index){
        this._LoadSuccess++;
        this.onLoadSuccess(myItem,index);
        this._onAllDone(myItem,index);
    },
    '_onSkipSuccess':function (myItem,index){
        this._LoadSuccess++;
        this._onAllDone(myItem,index);
    },
    '_LoadSuccess':0,
    '_LoadMax':(loopMax === undefined) ? 1 : loopMax
    };

callbacks = Object.create(extend({}, defaults, callbacks));

return callbacks;
};

})();