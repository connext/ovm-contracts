"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTestFullHashlockTransferState = exports.createCoreTransferState = exports.createTestHashlockTransferStates = exports.createTestHashlockTransferState = void 0;
const vector_types_1 = require("@connext/vector-types");
const solidity_1 = require("@ethersproject/solidity");
const hexStrings_1 = require("../hexStrings");
const transfers_1 = require("../transfers");
const util_1 = require("./util");
exports.createTestHashlockTransferState = (overrides = {}) => {
    return Object.assign({ lockHash: util_1.mkHash("0xeee"), expiry: "0" }, overrides);
};
exports.createTestHashlockTransferStates = (count = 2, overrides = []) => {
    return Array(count)
        .fill(0)
        .map((val, idx) => {
        var _a;
        return exports.createTestHashlockTransferState(Object.assign({}, ((_a = overrides[idx]) !== null && _a !== void 0 ? _a : {})));
    });
};
exports.createCoreTransferState = (overrides = {}) => {
    return Object.assign({ balance: { to: [util_1.mkAddress("0xaa"), util_1.mkAddress("0xbbb")], amount: ["1", "0"] }, assetId: util_1.mkAddress(), channelAddress: util_1.mkAddress("0xccc"), transferId: util_1.mkBytes32("0xeeefff"), transferDefinition: util_1.mkAddress("0xdef"), initialStateHash: util_1.mkBytes32("0xabcdef"), transferTimeout: "1", initiator: util_1.mkAddress("0xaa"), responder: util_1.mkAddress("0xbbb") }, overrides);
};
function createTestFullHashlockTransferState(overrides = {}, channel) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
    const { assetId, preImage, expiry, meta } = overrides, core = __rest(overrides, ["assetId", "preImage", "expiry", "meta"]);
    const transferEncodings = [vector_types_1.HashlockTransferStateEncoding, vector_types_1.HashlockTransferResolverEncoding];
    const transferResolver = { preImage: preImage !== null && preImage !== void 0 ? preImage : hexStrings_1.getRandomBytes32() };
    const transferState = exports.createTestHashlockTransferState({
        lockHash: solidity_1.sha256(["bytes32"], [transferResolver.preImage]),
        expiry: expiry !== null && expiry !== void 0 ? expiry : "0",
    });
    const defaults = {
        assetId: assetId !== null && assetId !== void 0 ? assetId : util_1.mkAddress(),
        chainId: 2,
        channelAddress: util_1.mkAddress("0xccc"),
        channelFactoryAddress: util_1.mkAddress("0xaaaaddddffff"),
        balance: (_a = overrides.balance) !== null && _a !== void 0 ? _a : { to: [util_1.mkAddress("0x111"), util_1.mkAddress("0x222")], amount: ["13", "0"] },
        initialStateHash: transfers_1.hashTransferState(transferState, transferEncodings[0]),
        meta: meta !== null && meta !== void 0 ? meta : { super: "cool stuff", routingId: util_1.mkHash("0xaabb") },
        transferDefinition: util_1.mkAddress("0xdef"),
        transferEncodings,
        transferId: hexStrings_1.getRandomBytes32(),
        transferResolver,
        transferState,
        transferTimeout: vector_types_1.DEFAULT_TRANSFER_TIMEOUT.toString(),
        initiator: (_c = (_b = overrides.balance) === null || _b === void 0 ? void 0 : _b.to[0]) !== null && _c !== void 0 ? _c : util_1.mkAddress("0x111"),
        responder: (_e = (_d = overrides.balance) === null || _d === void 0 ? void 0 : _d.to[1]) !== null && _e !== void 0 ? _e : util_1.mkAddress("0x222"),
        inDispute: false,
        initiatorIdentifier: (_g = (_f = overrides.initiatorIdentifier) !== null && _f !== void 0 ? _f : channel === null || channel === void 0 ? void 0 : channel.aliceIdentifier) !== null && _g !== void 0 ? _g : util_1.mkPublicIdentifier("vector111"),
        responderIdentifier: (_j = (_h = overrides.responderIdentifier) !== null && _h !== void 0 ? _h : channel === null || channel === void 0 ? void 0 : channel.bobIdentifier) !== null && _j !== void 0 ? _j : util_1.mkPublicIdentifier("vector222"),
        channelNonce: (_k = channel === null || channel === void 0 ? void 0 : channel.nonce) !== null && _k !== void 0 ? _k : 9,
    };
    const channelOverrides = channel
        ? Object.assign(Object.assign({ inDispute: channel.inDispute, aliceIdentifier: defaults.initiatorIdentifier, bobIdentifier: defaults.responderIdentifier }, channel.networkContext), channel.latestUpdate) : {};
    return Object.assign(Object.assign(Object.assign({}, defaults), core), channelOverrides);
}
exports.createTestFullHashlockTransferState = createTestFullHashlockTransferState;
//# sourceMappingURL=transfers.js.map