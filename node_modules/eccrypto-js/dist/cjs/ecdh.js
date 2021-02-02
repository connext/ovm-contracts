"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const env_1 = require("./lib/env");
const secp256k1_1 = require("./lib/secp256k1");
const elliptic_1 = require("./lib/elliptic");
const helpers_1 = require("./helpers");
function derive(privateKeyA, publicKeyB) {
    helpers_1.checkPrivateKey(privateKeyA);
    helpers_1.checkPublicKey(publicKeyB);
    return env_1.isNode()
        ? secp256k1_1.secp256k1Derive(publicKeyB, privateKeyA)
        : elliptic_1.ellipticDerive(publicKeyB, privateKeyA);
}
exports.derive = derive;
//# sourceMappingURL=ecdh.js.map