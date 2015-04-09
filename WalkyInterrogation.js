"use strict";

var Walky = require('./');
var WalkyEnveloped = require('./WalkyEnveloped');

function WalkyInterrogation( walkyConnection ) {
    this.walkyConnection = walkyConnection;

    this['?'] = function ( regObjID, attribute ) {
    // --------------------------------------------------
        var that = this;
        var registry = that.walkyConnection.engine.registry;
        var obj = registry.getObject(regObjID);
        if ( !obj ) return undefined;
        if ( !attribute in obj ) return undefined;
        var attr = obj[attribute];
        // FIXME: This is dirty
        return new WalkyEnveloped([
                        Walky.PAYLOAD_ATTRIBUTE_METHOD,
                        [regObjID,attribute]
                    ]);
    };

    this['del'] = function ( regObjID ) {
        var that = this;
        var registry = that.walkyConnection.engine.registry;
        registry.delObject(regObjID);
        console.log("Deleted object:",regObjID);
        return true;
    };
}

module.exports = WalkyInterrogation;
