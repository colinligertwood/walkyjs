"use strict";

function WalkyObjectStub( walkyConnection, regObjID ) {
    this.walkyConnection = walkyConnection;
    this.regObjID = regObjID;
}

WalkyObjectStub.prototype.exec = function ( methodName, argsList, keywordDict ) {
        var that = this;
        return that.walkyConnection.exec(
                                  that.regObjID,
                                  methodName, 
                                  argsList, 
                                  keywordDict
                              )
    };

module.exports = WalkyObjectStub;
