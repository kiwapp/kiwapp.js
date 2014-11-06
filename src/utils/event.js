'use strict';
(function(){
    function EventEmitter(){
        this.events = {};
    }

    EventEmitter.prototype.on = function(eventName, callback, instance) {

        if(!this.events[eventName]) {
            this.events[eventName] = [];
        }

        this.events[eventName].push({callback : callback, instance : instance});
    };

    EventEmitter.prototype.trigger = function(events) {

        var args = Array.prototype.slice.call(arguments);
        args.shift();

        if(!Array.isArray(events)) {
            events = [events];
        }

        for(var i = 0; i < events.length; i++) {

            var eventName = events[i],
                splitName = eventName.split('*');

            if(splitName.length <= 1){
                if(!this.events[eventName]) {
                    continue;
                }

                for(var o = 0; o < this.events[eventName].length; o++) {
                    this.events[eventName][o].callback.apply(this.events[eventName][o].instance , args);
                }

            } else{
                for(var x in this.events) {

                    if(x.indexOf(splitName[1]) > -1) {
                        eventName = x;

                        for(var u = 0; u < this.events[eventName].length; u++) {
                            this.events[eventName][u].callback.apply(this.events[eventName][u].instance, args);
                        }
                    }
                }
            }
        }
    };

    module.exports = EventEmitter;
})();