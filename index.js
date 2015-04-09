"use strict";

var Walky = {
/***************************************************
 CONSTANTS
 ***************************************************/

    WALKY_SOCKET_PORT: 8663,
    WALKY_WEBSOCK_PORT: 8662,

    REQ_OBJID: 0,
    REQ_METHOD: 1,
    REQ_ARGS: 2,
    REQ_KWARGS: 3,
    REQ_MESSAGE_ID: -1,

    TYPE: 0,
    PAYLOAD: 1,

    PAYLOAD_ERROR: -1,

    PAYLOAD_METHOD_EXECUTE: 0,
    PAYLOAD_DATA: 1,
    PAYLOAD_OBJECT_DELETED: 8,
    PAYLOAD_ATTRIBUTE_METHOD: 9,

    PAYLOAD_EVENT: 11,
    PAYLOAD_SYSTEM: 12,

    REQUEST_OBJECT: 1,
    REQUEST_METHOD: 2,
    REQUEST_ARGS: 3,
    REQUEST_KWARGS: 4,

    SYS_INTERROGATION_OBJ_ID: '?',
    SYS_INTERROGATION_ATTR_METHOD: '?',
    SYS_INTERROGATION_SET_METHOD: '=',
    SYS_INTERROGATION_DIR_METHOD: 'dir',
    SYS_INTERROGATION_DEL_METHOD: 'del',

    TARGET_GROUP: 0,
    SOURCE_CLASS: 1,
    MAPPED_CLASS: 2,

    DEBUG: true
}

module.exports = Walky;

