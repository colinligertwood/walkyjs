"use strict";

function WalkyExecRequest( obj, method, args, kwargs ) {
    this.obj = obj;
    this.method = method;
    this.args = args;

    // FIXME: kwargs have no meaning in JS
    // this.kwargs = kwargs;

    this.exec = function() {
    // --------------------------------------------------
        var that = this;
        var result = that.obj[that.method].apply(that.obj,that.args);
        return result;
    };
}

module.exports = WalkyExecRequest;
