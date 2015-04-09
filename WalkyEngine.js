"use strict";

var Walky = require('./');
var WalkySerializer = require('./WalkySerializer');
var WalkyRegistry = require('./WalkyRegistry');

function WalkyEngine(){
    this.serializer = new WalkySerializer();
    this.registry = new WalkyRegistry();
}

module.exports = WalkyEngine;
