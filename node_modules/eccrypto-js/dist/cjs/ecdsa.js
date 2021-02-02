"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const env_1 = require("./lib/env");
const secp256k1_1 = require("./lib/secp256k1");
const elliptic_1 = require("./lib/elliptic");
const helpers_1 = require("./helpers");
function generatePrivate() {
    return env_1.isNode() ? secp256k1_1.secp256k1GeneratePrivate() : elliptic_1.ellipticGeneratePrivate();
}
exports.generatePrivate = generatePrivate;
function compress(publicKey) {
    if (helpers_1.isCompressed(publicKey)) {
        return publicKey;
    }
    return env_1.isNode() ? secp256k1_1.secp256k1Compress(publicKey) : elliptic_1.ellipticCompress(publicKey);
}
exports.compress = compress;
function decompress(publicKey) {
    if (helpers_1.isDecompressed(publicKey)) {
        return publicKey;
    }
    return env_1.isNode()
        ? secp256k1_1.secp256k1Decompress(publicKey)
        : elliptic_1.ellipticDecompress(publicKey);
}
exports.decompress = decompress;
function getPublic(privateKey) {
    helpers_1.checkPrivateKey(privateKey);
    return env_1.isNode()
        ? secp256k1_1.secp256k1GetPublic(privateKey)
        : elliptic_1.ellipticGetPublic(privateKey);
}
exports.getPublic = getPublic;
function getPublicCompressed(privateKey) {
    helpers_1.checkPrivateKey(privateKey);
    return env_1.isNode()
        ? secp256k1_1.secp256k1GetPublicCompressed(privateKey)
        : elliptic_1.ellipticGetPublicCompressed(privateKey);
}
exports.getPublicCompressed = getPublicCompressed;
function generateKeyPair() {
    const privateKey = generatePrivate();
    const publicKey = getPublic(privateKey);
    return { privateKey, publicKey };
}
exports.generateKeyPair = generateKeyPair;
function signatureExport(sig) {
    return env_1.isNode()
        ? secp256k1_1.secp256k1SignatureExport(sig)
        : elliptic_1.ellipticSignatureExport(sig);
}
exports.signatureExport = signatureExport;
function sign(privateKey, msg, rsvSig = false) {
    helpers_1.checkPrivateKey(privateKey);
    helpers_1.checkMessage(msg);
    return env_1.isNode()
        ? secp256k1_1.secp256k1Sign(msg, privateKey, rsvSig)
        : elliptic_1.ellipticSign(msg, privateKey, rsvSig);
}
exports.sign = sign;
function recover(msg, sig, compressed = false) {
    helpers_1.checkMessage(msg);
    return env_1.isNode()
        ? secp256k1_1.secp256k1Recover(sig, msg, compressed)
        : elliptic_1.ellipticRecover(sig, msg, compressed);
}
exports.recover = recover;
function verify(publicKey, msg, sig) {
    helpers_1.checkPublicKey(publicKey);
    helpers_1.checkMessage(msg);
    const sigGood = env_1.isNode()
        ? secp256k1_1.secp256k1Verify(sig, msg, publicKey)
        : elliptic_1.ellipticVerify(sig, msg, publicKey);
    if (sigGood) {
        return null;
    }
    else {
        throw new Error('Bad signature');
    }
}
exports.verify = verify;
//# sourceMappingURL=ecdsa.js.map