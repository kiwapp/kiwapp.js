'use strict';
(function () {
    // Require Driver interface
    var Driver = require('./driver');

    // Memorize the last offline entry ids to earn performances
    var lastId = Object.create(null);

    //Driver interface implementation
    IOS.prototype = Object.create(Driver.prototype);

    /**
     * IOS Driver constructor
     * @constructor
     */
    function IOS() {
        var _self = this;
        Driver.call(_self);

        createBridge(_self);
        playQueue = playQueue.bind(_self);
    }

    /**
     * Method which prepare native call sending on ios
     * This method will override the driver/driver.js method
     * @param {string} url url describing the call
     */
    IOS.prototype.exec = function execIOS(url) {
        var _self = this;

        addToQueue(_self, url);
    };

    /**
     * Method used by native to get stored offline entries in local storage
     * if the given id is false, return a bad entry with error code 404
     * @param {string} id the entry id to find in local storage
     * @return {*} offline entry
     */
    IOS.prototype.entry = function entryIOS(id) {
        var entry = window.localStorage[id];
        if (entry === undefined) {
            return JSON.stringify({
                error: 404,
                data: ''
            });
        }
        entry = JSON.parse(entry);
        entry.error = 200;
        delete window.localStorage[id];
        return JSON.stringify(entry);
    };

    /**
     * Send offline entry call to native, saving it in local storage
     * Post method used to post offline entries
     *
     * @param {*} data data to send
     * @param {string} type define the entry type
     * @param {string} url if type is custom, define the url destination
     * @param {*} options if type is custom, define the send options
     *
     * @override
     */
    IOS.prototype.post = function postIOS(data, type, url, options) {
        var id = findLastId(window.Kiwapp.session().getIdentifier());
        window.localStorage[id] = JSON.stringify({
            data: data
        });

        window.Kiwapp.driver().trigger('callApp', {
            call: 'store_offline_entry',
            data: {
                id: id,
                type: type,
                url: url,
                options: options
            }
        });
    };

    /**
     * Set the print string to local storage
     * @param {string} The string is stock in local storage with a generate key
     * @param {string} The identifier id for the print (this identifier will be send in the callback method and you can identify the cart what you trying to print)
     * @return {Driver} The driver object
     *
     * @override
     */
    IOS.prototype.print = function (cardText, cardId) {

        if (!cardText) {
            console.warn('No text to print');

            return this;
        }

        if (!cardId) {
            cardId = Kiwapp.driver().generateKey();
        }

        var key = Kiwapp.driver().generateKey();

        localStorage.setItem(key, cardText);

        window.Kiwapp.driver().trigger('callApp', {
            call: 'print_card',
            data: {
                card_id: cardId,
                card_id_localStorage: key
            }
        });

        return this;
    };

    /**
     * This method is for allow the iOS driver to retrieve the local storage content of this application,
     * Is used when we use the bridge with many params (more than 1024 characters)
     * @param {number} id
     * @return {*}
     */
    IOS.prototype.getLocalStorageValue = function (id) {
        var storage = localStorage.getItem(id);

        if (storage === undefined) {
            return JSON.stringify({
                error: 404,
                data: ''
            });
        }

        delete window.localStorage[id];
        return JSON.stringify({
            error: 200,
            data: storage
        });
    };

    /**
     * Get the print string in the local storage (the card can be very long)
     * @param  {number} id the string is get with the key
     * @return {string} the string of the card
     */
    IOS.prototype.getPrintCard = function (id) {
        return IOS().getLocalStorageValue(id);
    };

    /**
     * Open the photo picker (gallery)
     * @param {number} limit the number limit of you want pick photo, beyond 15 a log warn is displayed
     * @param {Array<string>} alreadySendName the photo what you have already selected with a previous call, they will be already selected in the gallery
     * @param {number} callbackId
     * @return {Driver} The driver object
     *
     * @override
     */
    IOS.prototype.openPhotoPicker = function openPhotoPicker(limit, alreadySendName, callbackId) {

        if (!limit) {
            limit = 5;
        } else if (limit > 15) {
            console.warn('Your limit of photo to send is very high you must be careful with this. Especialy if you want send them');
        }

        var data = {};
        if (callbackId) {
            data = {
                limit: limit,
                already_used: alreadySendName,
                kw_photo_picker_id: callbackId
            };
        } else {
            data = {
                limit: limit,
                already_used: alreadySendName
            };
        }

        var key = Kiwapp.driver().generateKey();

        localStorage.setItem(key, JSON.stringify(data));

        window.Kiwapp.driver().trigger('callApp', {
            call: 'kw_open_photo_picker',
            data: {
                local_storage_key: key
            }
        });
        return this;
    };

    /**
     * Open the Kiwapp drawer (draw and signature)
     * @param {String} backgroundImage The background image what you want display on the background of your drawing
     * @param {boolean} isSignature Put this boolean to true and the driver will display a special view designed for the signature
     * @param {String} title This title will be displayed on the modal for the drawing
     * @param {number} the callback Id this picker, this callback is useful when you have many drawer in your application, the response will contained this id
     * @return {Driver} The driver object
     */
    IOS.prototype.openDrawer = function openDrawer(backgroundImage, isSignature, title, callbackId) {

        var data = {};
        if (callbackId) {
            data = {
                background_image: backgroundImage,
                is_signature: isSignature,
                title: title,
                kw_drawer_id: callbackId
            };
        } else {
            data = {
                background_image: backgroundImage,
                is_signature: isSignature,
                title: title,
                kw_drawer_id: Kiwapp.driver().generateKey()
            };
        }

        var key = Kiwapp.driver().generateKey();

        localStorage.setItem(key, JSON.stringify(data));

        window.Kiwapp.driver().trigger('callApp', {
            call: 'kw_open_drawer',
            data: {
                local_storage_key: key
            }
        });
        return this;
    };

    /**
     * Send a file to the storage Kiwapp
     * @param data
     * @return {IOS}
     *
     * @override
     */
    IOS.prototype.sendFile = function sendFile(data) {

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

    /**
     * @param {string} applicationIdentifier, the sharing key of the application you want open
     * @param {Object} urlQueryParams this params are injected as query string in the application you want open
     * @returns {IOS}
     */
    IOS.prototype.openHTML5Application = function openHTML5Application(applicationIdentifier, urlQueryParams) {

        if(applicationIdentifier === undefined) {
            Kiwapp.log('The applicationIdentifier params is required');
        }

        // Build the data to send in the localStorage
        var data =  {};
        if(urlQueryParams === undefined) {
            data = {
                'sharing_key': applicationIdentifier
            };
        } else {
            data = {
                'sharing_key': applicationIdentifier,
                'params': urlQueryParams
            };
        }

        var key = Kiwapp.driver().generateKey();
        localStorage.setItem(key, JSON.stringify(data));

        window.Kiwapp.driver().trigger('callApp', {
            call: 'open_html5_app_webview',
            data: {
                local_storage_key: key
            }
        });

        return this;
    };

    /**
     * Open a document in Kiwapp (work with PDF)
     * @param {string} url The document relative url
     * @returns {Driver}
     */
    IOS.prototype.openPDF = function openPDF(url) {
        if (url === undefined) {
            Kiwapp.log('The url params is required');
        }

        var data =  {
            file_path: url
        };
        var key = Kiwapp.driver().generateKey();
        localStorage.setItem(key, JSON.stringify(data));

        window.Kiwapp.driver().trigger('callApp', {
            call: 'open_document_reader',
            data: {
                local_storage_key: key
            }
        });

        return this;
    };

    /*******************
     * PRIVATES METHODS
     ******************/

    function findLastId(identifier) {
        var id = (lastId[identifier] === undefined) ? 1 : lastId[identifier];
        while (window.localStorage[identifier + id] !== undefined) {
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

        _self.set({messagingIframe: iframe});
        _self.set({sendMessageQueue: []});
    }

    //play the last member of the call app queue
    function playQueue() {
        /*jshint validthis:true */
        var _self = this;
        var sendMessageQueue = _self.get('sendMessageQueue');

        if (sendMessageQueue.length > 1)
            setTimeout(playQueue, 50);

        send(_self, sendMessageQueue.shift());
    }

    function addToQueue(_self, message) {
        var sendMessageQueue = _self.get('sendMessageQueue');

        sendMessageQueue.push(message);
        if (sendMessageQueue.length === 1) {
            setTimeout(playQueue, 50);
        }
    }

    function send(_self, message) {
        var messagingIframe = _self.get('messagingIframe');

        messagingIframe.src = message;
    }

    module.exports = IOS;
})();
