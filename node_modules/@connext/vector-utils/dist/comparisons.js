"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notNegative = exports.notPositive = exports.notLessThanOrEqualTo = exports.notLessThan = exports.notGreaterThanOrEqualTo = exports.notGreaterThan = exports.notBigNumberish = void 0;
const bignumber_1 = require("@ethersproject/bignumber");
const bigNumbers_1 = require("./bigNumbers");
exports.notBigNumberish = bigNumbers_1.getBigNumberishError;
exports.notGreaterThan = (value, ceil) => {
    if (exports.notBigNumberish(value)) {
        return exports.notBigNumberish(value);
    }
    return bignumber_1.BigNumber.from(value).gt(bignumber_1.BigNumber.from(ceil))
        ? undefined
        : `Value (${value.toString()}) is not greater than ${ceil.toString()}`;
};
exports.notGreaterThanOrEqualTo = (value, ceil) => {
    if (exports.notBigNumberish(value)) {
        return exports.notBigNumberish(value);
    }
    return bignumber_1.BigNumber.from(value).gte(ceil)
        ? undefined
        : `Value (${value.toString()}) is not greater than or equal to ${ceil.toString()}`;
};
exports.notLessThan = (value, floor) => {
    if (exports.notBigNumberish(value)) {
        return exports.notBigNumberish(value);
    }
    return bignumber_1.BigNumber.from(value).lt(floor)
        ? undefined
        : `Value (${value.toString()}) is not less than ${floor.toString()}`;
};
exports.notLessThanOrEqualTo = (value, floor) => {
    if (exports.notBigNumberish(value)) {
        return exports.notBigNumberish(value);
    }
    return bignumber_1.BigNumber.from(value).lte(floor)
        ? undefined
        : `Value (${value.toString()}) is not less than or equal to ${floor.toString()}`;
};
exports.notPositive = (value) => {
    return exports.notGreaterThanOrEqualTo(value, 0);
};
exports.notNegative = (value) => {
    if (exports.notLessThan(0, value)) {
        return `Value ${value.toString()} is negative.`;
    }
    return undefined;
};
//# sourceMappingURL=comparisons.js.map