"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBigNumberishError = exports.getBigNumberError = exports.toBNJson = exports.toBN = exports.isBNJson = exports.isBN = void 0;
const bignumber_1 = require("@ethersproject/bignumber");
exports.isBN = bignumber_1.BigNumber.isBigNumber;
exports.isBNJson = (value) => !exports.isBN(value) && !!value._hex;
exports.toBN = (n) => bignumber_1.BigNumber.from(n && typeof n._hex === "string"
    ? n._hex
    : typeof n.toString === "function"
        ? n.toString()
        : "0");
exports.toBNJson = (n) => ({
    _hex: exports.toBN(n).toHexString(),
    _isBigNumber: true,
});
exports.getBigNumberError = (value) => exports.isBN(value) ? undefined : `Value "${value}" is not a BigNumber`;
exports.getBigNumberishError = (value) => {
    try {
        exports.toBN(value);
    }
    catch (e) {
        return `Value "${value}" is not BigNumberish: ${e.message}`;
    }
    return undefined;
};
//# sourceMappingURL=bigNumbers.js.map