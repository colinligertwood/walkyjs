"use strict";

var Walky = require('./');
var WalkyEnveloped = require('./WalkyEnveloped');
var WalkyExecRequest = require('./WalkyExecRequest');

function WalkySerializer(){
}

WalkySerializer.prototype.isComplexObject = function ( obj ) {
    // --------------------------------------------------
    // FIXME: Need a better way to determine if an object is
    // a dict or an object
    //
        for ( var k in obj ) {
            var v = obj[k];
            if ( typeof(v) == "function" ) {
                return true;
            };
        };
        return false;
    };

WalkySerializer.prototype.envelopeWrap = function ( denormalizedData, registry, messageID ) {
    // --------------------------------------------------
        var that = this;

        if ( denormalizedData && denormalizedData.constructor == WalkyEnveloped ) {
            var envelopedData = denormalizedData.data;
            envelopedData.push(messageID);
            return envelopedData;
        }

        var normalizedData = that.normalizeData( denormalizedData, registry );
        var envelopedData = [ Walky.PAYLOAD_DATA, normalizedData, messageID ];
        return envelopedData;
    };

WalkySerializer.prototype.normalizeData = function ( denormalizedData, registry ) {
    // --------------------------------------------------
        var that = this;
        if (typeof(denormalizedData) == "number") {
            return denormalizedData;
        }
        else if (typeof(denormalizedData) == "boolean") {
            return denormalizedData;
        }
        else if (typeof(denormalizedData) == "string") {
            var firstChar = denormalizedData.charAt(0);
            if (firstChar == '!' ) {
                return '!'+denormalizedData;
            }
            return denormalizedData;
        }
        else if (typeof(denormalizedData) == "function") {
            // FIXME: Allow direct calls of functions?
            console.log("?????????????????????????????",denormalizedData);
            return [Walky.PAYLOAD_ATTRIBUTE_METHOD,denormalizedData];
        }

        else if (typeof(denormalizedData) == "undefined") {
            return denormalizedData;
        }

        else if ( denormalizedData.constructor === WalkyEnveloped ) {
            return denormalizedData.data;
        }
        else if ( 
            denormalizedData.constructor === Array 
                && !that.isComplexObject(denormalizedData)
        ) {
            var data = [];
            for ( var i=0; i<denormalizedData.length; i++ ) {
                var dv = denormalizedData[i];
                var v = that.normalizeData(dv,registry);
                data.push(v);
            };
            return data;
        }
        else if ( 
            denormalizedData.constructor === Object 
                && !that.isComplexObject(denormalizedData)
        ) {
            var data = {};
            for ( var k in denormalizedData ) {
                var dv = denormalizedData[k];
                var v = that.normalizeData(dv,registry);
                data[k] = v;
            };
            return data;
        }

        // Oops, this is going to be a complex object.
        else {
            var regObjID = registry.putObject(denormalizedData);
            return "!O"+regObjID;
        }
    };

WalkySerializer.prototype.envelopeUnwrap = function ( normalizedData, walkyConnection, registry ) {
    // --------------------------------------------------
        var that = this;
        var respType = normalizedData[Walky.TYPE]
        var respPayload = normalizedData[Walky.PAYLOAD]
        var denormalizedData;

        switch (respType) {

            case Walky.PAYLOAD_DATA:
                return that.denormalizeData(respPayload, walkyConnection, registry)

            case Walky.PAYLOAD_EVENT:
                // FIXME Need to handle this still
                console.log("NOT SURE HOW TO HANDLE THIS");
                break;

            case Walky.PAYLOAD_SYSTEM:
                // FIXME Need to handle this still
                console.log("NOT SURE HOW TO HANDLE THIS");
                break;

            case Walky.PAYLOAD_ATTRIBUTE_METHOD:
                // FIXME Need to handle this still
                break

            case Walky.that.PAYLOAD_METHOD_EXECUTE:
                // In the case of an execute request things are a bit
                // different. So let's just structure it.
                // FIXME Need to handle this properly
                var registry = walkyConnection.engine.registry;
                var obj = registry.getObject(respPayload);

                if ( !obj ) {
                    return new WalkyEnveloped([
                                    PAYLOAD_ERROR,
                                    "Unknown Object"
                                ]);
                }

                // Note that we need to double check that the args
                // actually exists. We don't want to accidentally use
                // the message ID as the argument
                // [ type, object, function, args, kwargs, message ].length == 6
                // [ type, object, function, message ].length == 4
                // So length needs to be greater than 4
                var args = normalizedData.length > 4
                                ? normalizedData[REQUEST_ARGS]
                                : [];
                if (Walky.DEBUG) console.log("USING ARGS:", args, normalizedData.length);
                var result = new WalkyExecRequest(
                                        obj,
                                        normalizedData[REQUEST_METHOD],
                                        that.denormalizeData(
                                            args,
                                            walkyConnection,
                                            registry
                                        )
                                        // FIXME: kwargs have no meaning in JS
                                        // normalizedData[REQUEST_KWARGS],
                                    );
                return result;
        };


    },

WalkySerializer.prototype.denormalizeData = function ( normalizedData, walkyConnection, registry ) {
    // --------------------------------------------------
    // FIXME: This doesn't mirror the python code yet. (It returns the
    //        payload type when it doesn't need to)
    //
        var that = this;
        var denormalizedData;

        if (typeof(normalizedData) == "number") {
            return normalizedData;
        }
        else if (typeof(normalizedData) == "boolean") {
            return normalizedData;
        }
        else if (typeof(normalizedData) == "string") {
            if ( !normalizedData.length ) 
                return normalizedData;
            var firstChar = normalizedData.charAt(0);
            if ( firstChar != '!' )
                return normalizedData;
            if ( normalizedData.length == 1 )
                return normalizedData; // FIXME: Should throw an error
            var secondChar = normalizedData.charAt(1);
            switch (secondChar) {
                case '!':
                    return normalizedData.substring(1);

                case 'd':
                    return new Date(normalizedData.substring(2));

                case 'D':
                    return new Date(normalizedData.substring(2));

                case 'O':
                    // FIXME: handle metadata information
                    return new WalkyObjectStub(
                                          walkyConnection,
                                          normalizedData.substring(2)
                                      );

                default:
                    // FIXME: Should throw an error
            };
            return;
        }
        else if (typeof(normalizedData) == "function") {
            // FIXME: Allow direct calls of functions?
            if (Walky.DEBUG) console.log("BUSTED FOR FUNCTIONS SO FAR");
        }
        else if ( 
            normalizedData.constructor === Array 
                && !that.isComplexObject(normalizedData)
        ) {
            var data = [];
            for ( var i=0; i<normalizedData.length; i++ ) {
                var dv = normalizedData[i];
                var v = that.denormalizeData(dv,walkyConnection,registry);
                data.push(v);
            };
            return data;
        }
        else if ( 
            normalizedData.constructor === Object 
                && !that.isComplexObject(normalizedData)
        ) {
            var data = {};
            for ( var k in normalizedData ) {
                var dv = normalizedData[k];
                var v = that.denormalizeData(dv,walkyConnection,registry);
                data[k] = v;
            };
            return data;
        };
    };

module.exports = WalkySerializer;

