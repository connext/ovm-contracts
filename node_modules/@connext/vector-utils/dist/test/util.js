"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mkSig = exports.mkBytes32 = exports.mkHash = exports.mkPublicIdentifier = exports.mkAddress = void 0;
exports.mkAddress = (prefix = "0x0") => {
    return prefix.padEnd(42, "0");
};
exports.mkPublicIdentifier = (prefix = "vectorA") => {
    return prefix.padEnd(56, "0");
};
exports.mkHash = (prefix = "0x") => {
    return prefix.padEnd(66, "0");
};
exports.mkBytes32 = (prefix = "0xa") => {
    return prefix.padEnd(66, "0");
};
exports.mkSig = (prefix = "0xa") => {
    return prefix.padEnd(132, "0");
};
//# sourceMappingURL=util.js.map