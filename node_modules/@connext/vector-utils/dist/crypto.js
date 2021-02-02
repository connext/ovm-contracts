"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.recoverAddressFroUtilityMessage = exports.signUtilityMessage = exports.recoverAddressFromChannelMessage = exports.signChannelMessage = exports.decrypt = exports.encrypt = exports.hashUtilityMessage = exports.hashChannelMessage = exports.getRandomSignature = exports.getRandomPublicKey = exports.getRandomPrivateKey = exports.getAddressFromPrivateKey = exports.getAddressFromPublicKey = exports.getPublicKeyFromPrivateKey = exports.isValidEthSignature = exports.getEthSignatureError = exports.isValidPrivateKey = exports.getPrivateKeyError = exports.isValidPublicKey = exports.getPublicKeyError = exports.bufferify = exports.UTILITY_SIGN_PREFIX = exports.VECTOR_SIGN_PREFIX = void 0;
const address_1 = require("@ethersproject/address");
const bytes_1 = require("@ethersproject/bytes");
const random_1 = require("@ethersproject/random");
const strings_1 = require("@ethersproject/strings");
const eccrypto_js_1 = require("eccrypto-js");
const hexStrings_1 = require("./hexStrings");
exports.VECTOR_SIGN_PREFIX = "\x16Vector Signed Message:\n";
exports.UTILITY_SIGN_PREFIX = "\x17Utility Signed Message:\n";
exports.bufferify = (input) => typeof input === "string"
    ? hexStrings_1.isValidHexString(input)
        ? eccrypto_js_1.hexToBuffer(input)
        : eccrypto_js_1.utf8ToBuffer(input)
    : !Buffer.isBuffer(input)
        ? eccrypto_js_1.arrayToBuffer(bytes_1.arrayify(input))
        : input;
exports.getPublicKeyError = (value) => {
    try {
        const hexStringError = hexStrings_1.getHexStringError(value, 65);
        if (hexStringError)
            return hexStringError;
        const addressError = hexStrings_1.getAddressError(exports.getAddressFromPublicKey(value));
        return addressError ? `Got invalid address from public key ${value}: ${addressError}` : undefined;
    }
    catch (e) {
        return e.message;
    }
};
exports.isValidPublicKey = (value) => !exports.getPublicKeyError(value);
exports.getPrivateKeyError = (value) => {
    try {
        const hexStringError = hexStrings_1.getHexStringError(value, 32);
        if (hexStringError)
            return hexStringError;
        const addressError = hexStrings_1.getAddressError(exports.getAddressFromPrivateKey(value));
        return addressError ? `Got invalid address from private key: ${addressError}` : undefined;
    }
    catch (e) {
        return e.message;
    }
};
exports.isValidPrivateKey = (value) => !exports.getPrivateKeyError(value);
exports.getEthSignatureError = (value) => {
    const hexStringError = hexStrings_1.getHexStringError(value, 65);
    if (hexStringError)
        return hexStringError;
    return undefined;
};
exports.isValidEthSignature = (value) => !exports.getEthSignatureError(value);
exports.getPublicKeyFromPrivateKey = (privateKey) => bytes_1.hexlify(eccrypto_js_1.getPublic(exports.bufferify(privateKey)));
exports.getAddressFromPublicKey = (publicKey) => {
    const buf = exports.bufferify(publicKey);
    return address_1.getAddress(bytes_1.hexlify(eccrypto_js_1.keccak256((eccrypto_js_1.isDecompressed(buf) ? buf : eccrypto_js_1.decompress(buf)).slice(1)).slice(12)));
};
exports.getAddressFromPrivateKey = (privateKey) => exports.getAddressFromPublicKey(exports.getPublicKeyFromPrivateKey(privateKey));
exports.getRandomPrivateKey = () => bytes_1.hexlify(random_1.randomBytes(32));
exports.getRandomPublicKey = () => exports.getPublicKeyFromPrivateKey(exports.getRandomPrivateKey());
exports.getRandomSignature = exports.getRandomPublicKey;
exports.hashChannelMessage = (message) => bytes_1.hexlify(eccrypto_js_1.keccak256(eccrypto_js_1.concatBuffers(exports.bufferify(exports.VECTOR_SIGN_PREFIX), exports.bufferify(`${exports.bufferify(message).length}`), exports.bufferify(message))));
exports.hashUtilityMessage = (message) => bytes_1.hexlify(eccrypto_js_1.keccak256(eccrypto_js_1.concatBuffers(exports.bufferify(exports.UTILITY_SIGN_PREFIX), exports.bufferify(`${exports.bufferify(message).length}`), exports.bufferify(message))));
exports.encrypt = (message, publicKey) => __awaiter(void 0, void 0, void 0, function* () { return bytes_1.hexlify(eccrypto_js_1.serialize(yield eccrypto_js_1.encrypt(exports.bufferify(publicKey), eccrypto_js_1.utf8ToBuffer(message)))); });
exports.decrypt = (encrypted, privateKey) => __awaiter(void 0, void 0, void 0, function* () { return strings_1.toUtf8String(yield eccrypto_js_1.decrypt(exports.bufferify(privateKey), eccrypto_js_1.deserialize(exports.bufferify(`0x${encrypted.replace(/^0x/, "")}`)))); });
exports.signChannelMessage = (message, privateKey) => __awaiter(void 0, void 0, void 0, function* () { return bytes_1.hexlify(eccrypto_js_1.sign(exports.bufferify(privateKey), exports.bufferify(exports.hashChannelMessage(message)), true)); });
exports.recoverAddressFromChannelMessage = (message, sig) => __awaiter(void 0, void 0, void 0, function* () { return exports.getAddressFromPublicKey(bytes_1.hexlify(eccrypto_js_1.recover(exports.bufferify(exports.hashChannelMessage(message)), exports.bufferify(sig)))); });
exports.signUtilityMessage = (message, privateKey) => __awaiter(void 0, void 0, void 0, function* () { return bytes_1.hexlify(eccrypto_js_1.sign(exports.bufferify(privateKey), exports.bufferify(exports.hashUtilityMessage(message)), true)); });
exports.recoverAddressFroUtilityMessage = (message, sig) => __awaiter(void 0, void 0, void 0, function* () { return exports.getAddressFromPublicKey(bytes_1.hexlify(eccrypto_js_1.recover(exports.bufferify(exports.hashUtilityMessage(message)), exports.bufferify(sig)))); });
//# sourceMappingURL=crypto.js.map