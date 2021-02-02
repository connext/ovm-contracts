"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../constants");
function assert(condition, message) {
    if (!condition) {
        throw new Error(message || 'Assertion failed');
    }
}
exports.assert = assert;
function isScalar(x) {
    return Buffer.isBuffer(x) && x.length === 32;
}
exports.isScalar = isScalar;
function isValidPrivateKey(privateKey) {
    if (!isScalar(privateKey)) {
        return false;
    }
    return (privateKey.compare(constants_1.ZERO32) > 0 && privateKey.compare(constants_1.EC_GROUP_ORDER) < 0);
}
exports.isValidPrivateKey = isValidPrivateKey;
function equalConstTime(b1, b2) {
    if (b1.length !== b2.length) {
        return false;
    }
    let res = 0;
    for (let i = 0; i < b1.length; i++) {
        res |= b1[i] ^ b2[i];
    }
    return res === 0;
}
exports.equalConstTime = equalConstTime;
function isValidKeyLength(length) {
    return !(length <= constants_1.LENGTH_0 ||
        length > constants_1.MAX_KEY_LENGTH ||
        parseInt(String(length)) !== length);
}
exports.isValidKeyLength = isValidKeyLength;
function checkPrivateKey(privateKey) {
    assert(privateKey.length === constants_1.KEY_LENGTH, constants_1.ERROR_BAD_PRIVATE_KEY);
    assert(isValidPrivateKey(privateKey), constants_1.ERROR_BAD_PRIVATE_KEY);
}
exports.checkPrivateKey = checkPrivateKey;
function checkPublicKey(publicKey) {
    assert(publicKey.length === constants_1.PREFIXED_DECOMPRESSED_LENGTH ||
        publicKey.length === constants_1.PREFIXED_KEY_LENGTH, constants_1.ERROR_BAD_PUBLIC_KEY);
    if (publicKey.length === constants_1.PREFIXED_DECOMPRESSED_LENGTH) {
        assert(publicKey[0] === 4, constants_1.ERROR_BAD_PUBLIC_KEY);
    }
    if (publicKey.length === constants_1.PREFIXED_KEY_LENGTH) {
        assert(publicKey[0] === 2 || publicKey[0] === 3, constants_1.ERROR_BAD_PUBLIC_KEY);
    }
}
exports.checkPublicKey = checkPublicKey;
function checkMessage(msg) {
    assert(msg.length > 0, constants_1.ERROR_EMPTY_MESSAGE);
    assert(msg.length <= constants_1.MAX_MSG_LENGTH, constants_1.ERROR_MESSAGE_TOO_LONG);
}
exports.checkMessage = checkMessage;
//# sourceMappingURL=validators.js.map