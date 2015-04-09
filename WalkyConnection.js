"use strict";

var Walky = require('./');
var WalkyEngine = require('./WalkyEngine');
var WalkyInterrogation = require('./WalkyInterrogation');
var WalkyObjectStub = require('./WalkyObjectStub');

var RSVP = require('rsvp');
var WebSocket = require('websocket').w3cwebsocket;

function WalkyConnection() {

    this.engine = new WalkyEngine();
    this.engine.registry.putObject(new WalkyInterrogation(this),'?');
    this.messageCount = 0;
    this.messageWaiting = {};

    this.open = function(wsUri){
    // --------------------------------------------------
        var that = this;
        var promise = new RSVP.Promise(function(resolve,reject){
            that.ws = new WebSocket( wsUri );
            that.ws.onmessage = function (ev) { 
                if (Walky.DEBUG) console.log("<---------",ev.data);
                that.onmessage(ev);
            };
            that.ws.onopen = function (ev) { 
                that.onopen(ev);
                resolve(ev);
            };
        });
        return promise;
    };

    this.getObject = function(regObjID){
    // --------------------------------------------------
        var that = this;
        return new WalkyObjectStub(that,regObjID);
    };

    this.nextID = function(){
    // --------------------------------------------------
        var that = this;
        var messageID = "c"+(that.messageCount++).toString();
        return messageID;
    };

    this.messageWaitForMessageID = function(messageID, resolve, reject){
    // --------------------------------------------------
        var that = this;
        that.messageWaiting[messageID] = [resolve,reject];
    };

    this.exec = function( objectID, methodName, argsList, keywordDict ) {
    // --------------------------------------------------
        var that = this;
        var promise = new RSVP.Promise(function(resolve,reject){
            var jsonRequest = "";
            var messageID = that.nextID();
            that.messageWaitForMessageID(messageID,resolve,reject);

            // Normalize outgoing data
            var serializer = that.engine.serializer;
            var registry = that.engine.registry;

            if ( !argsList ) argsList = [];
            argsList = that.engine.serializer.normalizeData(argsList,registry)

            if ( !keywordDict ) keywordDict = {};
            keywordDict = that.engine.serializer.normalizeData(keywordDict,registry)

            // Encode into transport stream
            var wsLine = JSON.stringify([
                                  Walky.PAYLOAD_METHOD_EXECUTE,
                                  objectID,
                                  methodName,
                                  argsList,
                                  keywordDict,
                                  messageID
                              ]);

            // Then send it off
            that.sendLine(wsLine);
        });
        return promise;
    };

    this.execRequest = function( execRequest, respMessageID ) {
    // --------------------------------------------------
        var that = this;
        var result = execRequest.exec();
        var envelopedData = that.engine.serializer.envelopeWrap(
                                                        result,
                                                        that.engine.registry,
                                                        respMessageID
                                                    );

        // Encode into transport stream
        var wsLine = JSON.stringify(envelopedData);

        // Then send it off
        that.sendLine(wsLine);
    };

    this.sendLine = function( wsLine ) {
    // --------------------------------------------------
        var that = this;
        if (Walky.DEBUG) console.log("-->",wsLine);
        that.ws.send(wsLine+"\r\n");
    };

    this.close = function() {
    // --------------------------------------------------
        var that = this;
        that.ws.close();
    };

    this.onopen = function(ev) {
    // --------------------------------------------------
    // FIXME: Do I need to do anything here?
    //
    };

    this.receiveLine = function(line) {
    // --------------------------------------------------
        var that = this;
        var envelopedData = JSON.parse(line);
        var respMessageID = envelopedData[envelopedData.length-1];
        var respType = envelopedData[that.TYPE];

        // Parse incoming data
        var serializer = that.engine.serializer;
        var denormalizedData = serializer.envelopeUnwrap(
                                              envelopedData,
                                              that,
                                              that.engine.registry
                                          );

        // We got a request to execute an object method,
        // let's do so.
        if ( respType == Walky.PAYLOAD_METHOD_EXECUTE ) {
            that.execRequest(denormalizedData,respMessageID);
        }

        // If something's waiting on it, resolve it.
        else if ( respMessageID in that.messageWaiting ) {
            var waiting = that.messageWaiting[respMessageID];
            delete that.messageWaiting[respMessageID];
            // FIXME: The following is _ugly_
            waiting[0](denormalizedData);
        }

    };

    this.onmessage = function(ev) {
    // --------------------------------------------------
    // FIXME: needs exception support for failed parses
        var that = this;
        var lines = ev.data.split('\n');
        for ( var i = 0; i < lines.length; i++ ) {
            var line = lines[i];
            if ( line ) that.receiveLine(lines[i]);
        };
    };
}

module.exports = WalkyConnection;
