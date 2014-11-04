'use strict';
(function(){
    /**
     * A method to load a jsFile, with a callback becase of async loading
     * @param {string}   path     The path to a js file
     * @param {Function} callback Optionnal callback because of async loading
     */
    module.exports = function loadJS(url, callback) {
        var module = document.createElement('script');
        module.src = url;
        var container = document.head;
        container.appendChild(module);
        module.addEventListener('load', function(){
            //removing the script because it is useless in DOM
            container.removeChild(module);
            if(callback !== undefined){
                callback();
            }
        });
    };
})();
