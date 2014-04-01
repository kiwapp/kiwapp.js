'use strict';
(function(){
    module.exports = function buildGetUrl(data, noSlash) {
        var url;
        if(noSlash) url = '';
        else url = '/?';

        var keys = Object.keys(data);
        for(var i = 0; i < keys.length; i++){
            url += keys[i] + '=' + data[keys[i]];
            if(i !== keys.length-1) url += '&';
        }
        return url;
    };
})();