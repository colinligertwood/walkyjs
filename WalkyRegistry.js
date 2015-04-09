"use strict";

var Walky = require('./');

function WalkyRegistry() {
    this.objRegistry = {};
    this.objIDPrefix = "C";
    this.objIDCount = 0;

    this.regObjIDGenerator = function() {
    // --------------------------------------------------
        var that = this;
        var regObjID;
        do {
            regObjID = that.objIDPrefix+that.objIDCount.toString(36);
            that.objIDCount++;
        } while ( regObjID in that.objRegistry );
        return regObjID;
    };

    this.putObject = function( obj,regObjID ) {
    // --------------------------------------------------
        var that = this;
        if ( !regObjID ) {
            regObjID = that.regObjIDGenerator();
        }
        that.objRegistry[regObjID] = obj;
        return regObjID;
    };

    this.getObject = function( regObjID ) {
    // --------------------------------------------------
        var that = this;
        if ( regObjID in that.objRegistry ) 
            return that.objRegistry[regObjID];
        if (Walky.DEBUG) console.log("Could not find object:", regObjID);
        return;
    };

    this.delObject = function( regObjID ) {
    // --------------------------------------------------
        var that = this;
        if ( regObjID in that.objRegistry ) 
            delete that.objRegistry[regObjID];
    };
}

module.exports = WalkyRegistry;
