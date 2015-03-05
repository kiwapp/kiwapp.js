'use strict';
(function(){
    //require Driver interface
    var Driver = require('./driver');

    //memorize the last offline entry ids to earn performances
    var lastId = Object.create(null);

    /**
     * iOS Driver constructor
     */
    function iOS(){
        /*jshint validthis:true */
        var _self = this;
        Driver.call(_self);

        createBridge(_self);
        playQueue = playQueue.bind(_self);
    }

    /**
     * Driver interface implementation
     */
    iOS.prototype = Object.create(Driver.prototype);

    /**
     * method which prepare native call sending on ios
     * @param  {string} url url describing the call
     */
    iOS.prototype.exec = function execIOS(url){
        var _self = this;

        addToQueue(_self, url);
    };

    /**
     * method used by native to get stored offline entries in local storage
     * if the given id is false, return a bad entry with error code 404
     * @param  {string} id the entry id to find in local storage
     * @return {object}    offline entry
     */
    iOS.prototype.entry = function entryIOS(id){
        var entry = window.localStorage[id];
        if(entry === undefined){
            return JSON.stringify({
                error : 404,
                data : ''
            });
        }
        entry = JSON.parse(entry);
        entry.error = 200;
        delete window.localStorage[id];
        return JSON.stringify(entry);
    };

    /**
     * send offline entry call to native, saving it in local storage
     * post method used to post offline entries
     * @param  {object} data    data to send
     * @param  {string} type    define the entry type
     * @param  {url} url     if type is custom, define the url destination
     * @param  {options} options if type is custom, define the send options
     */
    iOS.prototype.post = function postIOS(data, type, url, options){
        var id = findLastId(window.Kiwapp.session().getIdentifier());
        window.localStorage[id] = JSON.stringify({
            data : data
        });

        window.Kiwapp.driver().trigger('callApp', {
            call : 'store_offline_entry',
            data : {
                id : id,
                type : type,
                url : url,
                options : options
            }
        });
    };

    /**
     * Set the print string to local storage
     * @param  {string} the string is stock in local storage with a generate key
     * @param  {string} The identifier id for the print (this identifier will be send in the callback method and you can identify the cart what you trying to print)
     * @return {Driver}             the driver object
     */
    iOS.prototype.print = function(cardText, cardId){

        if(!cardText) {
            console.warn('No text to print');

            return this;
        }

        if(!cardId) {
            cardId = Kiwapp.driver().generateKey();
        }

        var key = Kiwapp.driver().generateKey();

        localStorage.setItem(key, cardText);

        window.Kiwapp.driver().trigger('callApp', {
            call : 'print_card',
            data : {
                card_id : cardId,
                card_id_localStorage : key
            }
        });

        return this;
    };

    iOS.prototype.getLocalStorageValue = function(id) {
        var storage = localStorage.getItem(id);

        if(storage === undefined){
            return JSON.stringify({
                error : 404,
                data : ''
            });
        }

        delete window.localStorage[id];
        return JSON.stringify({
            error : 200,
            data : storage
        });
    };

    /**
     * Get the print string
     * @param  {id} the string is get with the key
     * @return {printString}             the string
     */
    iOS.prototype.getPrintCard = function(id){
        return iOS().getLocalStorageValue(id);
    };

    /**
     * Open the photo picker (gallery)
     * @param limit the number limit of you want pick photo, beyond 15 a log warn is displayed
     * @param {string[]} alreadySendName the photo what you have already selected with a previous call, they will be already selected in the gallery
     * @returns {Driver} The driver object
     */
    iOS.prototype.openPhotoPicker = function openPhotoPicker(limit, alreadySendName) {

        if(!limit) {
            limit = 5;
        } else if (limit > 15) {
            console.warn('Your limit of photo to send is very high you must be careful with this. Especialy if you want send them');
        }

        var data = {
            limit: limit,
            already_used: alreadySendName
        };

        var key = Kiwapp.driver().generateKey();

        localStorage.setItem(key, JSON.stringify(data));

        window.Kiwapp.driver().trigger('callApp', {
            call: 'open_kw_photo_picker',
            data: {
                local_storage_key: key
            }
        });
        return this;
    };

    iOS.prototype.sendFile = function sendFile(data) {

        var key = Kiwapp.driver().generateKey();
        localStorage.setItem(key, JSON.stringify(data));

        window.Kiwapp.driver().trigger('callApp', {
            call: 'kw_upload_files',
            data: {
                local_storage_key: key
            }
        });

        return this;
    };

    function findLastId(identifier){
        var id = (lastId[identifier] === undefined) ? 1  : lastId[identifier];
        while(window.localStorage[identifier + id] !== undefined) {
            id++;
        }

        lastId[identifier] = id;
        return identifier + id;
    }

    function createBridge(_self) {
        //create an iframe DOM Element, it will be the iOS bridge
        var iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = 'basesrc';
        document.documentElement.appendChild(iframe);

        _self.set({messagingIframe : iframe});
        _self.set({sendMessageQueue : []});
    }

    //play the last member of the call app queue
    function playQueue(){
        /*jshint validthis:true */
        var _self = this;
        var sendMessageQueue = _self.get('sendMessageQueue');

        if(sendMessageQueue.length > 1)
            setTimeout(playQueue, 50);

        send(_self, sendMessageQueue.shift());
    }

    function addToQueue(_self, message){
        var sendMessageQueue = _self.get('sendMessageQueue');

        sendMessageQueue.push(message);
        if(sendMessageQueue.length === 1){
          setTimeout(playQueue, 50);
        }
    }

    function send(_self, message) {
        var messagingIframe = _self.get('messagingIframe');

        messagingIframe.src = message;
    }

    module.exports = iOS;
})();
