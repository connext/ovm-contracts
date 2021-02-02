"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidPublicIdentifier = exports.getPublicIdentifierError = exports.getRandomIdentifier = exports.getAddressFromAssetId = exports.getSignerAddressFromPublicIdentifier = exports.getPublicKeyFromPublicIdentifier = exports.getPublicIdentifierFromPublicKey = exports.VECTOR_PUB_ID_PREFIX = void 0;
const address_1 = require("@ethersproject/address");
const bs58check_1 = __importDefault(require("bs58check"));
const eccrypto_js_1 = require("eccrypto-js");
const hexStrings_1 = require("./hexStrings");
const limitedCache_1 = require("./limitedCache");
const crypto_1 = require("./crypto");
exports.VECTOR_PUB_ID_PREFIX = "vector";
const cache = new limitedCache_1.LimitedCache(200);
exports.getPublicIdentifierFromPublicKey = (publicKey) => exports.VECTOR_PUB_ID_PREFIX + bs58check_1.default.encode(eccrypto_js_1.compress(eccrypto_js_1.hexToBuffer(publicKey)));
exports.getPublicKeyFromPublicIdentifier = (publicIdentifier) => `0x${eccrypto_js_1.bufferToHex(eccrypto_js_1.decompress(bs58check_1.default.decode(publicIdentifier.replace(exports.VECTOR_PUB_ID_PREFIX, ""))))}`;
exports.getSignerAddressFromPublicIdentifier = (publicIdentifier) => {
    const key = `signer-address:${publicIdentifier}`;
    const cached = cache.get(key);
    if (cached) {
        return cached;
    }
    const res = crypto_1.getAddressFromPublicKey(exports.getPublicKeyFromPublicIdentifier(publicIdentifier));
    cache.set(key, res);
    return res;
};
exports.getAddressFromAssetId = (assetId) => address_1.getAddress(assetId.toLowerCase());
exports.getRandomIdentifier = () => exports.getPublicIdentifierFromPublicKey(crypto_1.getRandomPublicKey());
exports.getPublicIdentifierError = (value) => {
    try {
        if (typeof value !== "string") {
            return `Invalid public identifier. Expected a string, got ${typeof value}`;
        }
        else if (!value.startsWith(exports.VECTOR_PUB_ID_PREFIX)) {
            return `Invalid public identifier. Expected ${value} to start with ${exports.VECTOR_PUB_ID_PREFIX}`;
        }
        const addressError = hexStrings_1.getAddressError(exports.getSignerAddressFromPublicIdentifier(value));
        return addressError
            ? `Invalid public identifier. Got errors recovering address from ${value}: ${addressError}`
            : undefined;
    }
    catch (e) {
        return e.message;
    }
};
exports.isValidPublicIdentifier = (value) => !exports.getPublicIdentifierError(value);
//# sourceMappingURL=identifiers.js.map