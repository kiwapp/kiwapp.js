'use strict';
(function(){
    /**
     * Compute the current date
     * @return {string} The current date
     */
    module.exports = function getDate(){
        var time = new Date();
        var day = String(time.getDate());
        if(day.length === 1) day = 0+day;
        var month = String(time.getMonth()+1);
        if(month.length === 1) month = 0+month;

        return time.getFullYear()+'-'+month+'-'+day + ' ' + time.toTimeString().split(' ')[0];
    };
})();