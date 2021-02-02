"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatDisplayAmount = exports.calculateExchangeWad = exports.calculateExchangeAmount = exports.removeDecimals = exports.sanitizeDecimals = exports.inverse = exports.minBN = exports.maxBN = exports.fromWad = exports.toWad = void 0;
const constants_1 = require("@ethersproject/constants");
const units_1 = require("@ethersproject/units");
exports.toWad = (amount, decimals = 18) => {
    return units_1.parseUnits(exports.sanitizeDecimals(amount, decimals), decimals);
};
exports.fromWad = (wad, decimals = 18) => {
    return exports.sanitizeDecimals(units_1.formatUnits(wad, decimals), decimals);
};
exports.maxBN = (lobn) => lobn.reduce((max, current) => (max.gt(current) ? max : current), constants_1.Zero);
exports.minBN = (lobn) => lobn.reduce((min, current) => (min.lt(current) ? min : current), constants_1.MaxUint256);
exports.inverse = (value, precision = 18) => exports.fromWad(exports.toWad("1", precision * 2).div(exports.toWad(value, precision)), precision);
exports.sanitizeDecimals = (value, decimals = 18) => {
    const [integer, fractional] = value.split(".");
    const _fractional = fractional ? fractional.substring(0, decimals).replace(/0+$/gi, "") : undefined;
    return _fractional ? [integer, _fractional].join(".") : integer;
};
exports.removeDecimals = (value) => {
    const [integer] = value.split(".");
    return integer;
};
exports.calculateExchangeAmount = (inputAmount, swapRate, precision = 18) => {
    const swapRateWad = exports.toWad(swapRate, precision);
    const inputWad = exports.toWad(inputAmount, precision * 2);
    const outputWad = inputWad.mul(swapRateWad);
    const outputAmount = exports.fromWad(outputWad, precision * 3);
    return outputAmount;
};
exports.calculateExchangeWad = (inputWad, inputDecimals, swapRate, outputDecimals) => {
    const inputAmount = exports.fromWad(inputWad, inputDecimals);
    const outputAmount = exports.calculateExchangeAmount(inputAmount, swapRate);
    const outputWad = exports.toWad(outputAmount, outputDecimals);
    return outputWad;
};
const roundFractional = (fractional, precision = 2) => {
    return String(Math.round(Number(fractional.substring(0, precision) + "." + fractional.substring(precision, precision + 1))));
};
function padString(str, length, left, padding = "0") {
    const diff = length - str.length;
    let result = str;
    if (diff > 0) {
        const pad = padding.repeat(diff);
        result = left ? pad + str : str + pad;
    }
    return result;
}
function padRight(str, length, padding = "0") {
    return padString(str, length, false, padding);
}
exports.formatDisplayAmount = (amount, precision = 2, symbol = "") => {
    const _symbol = symbol.trim() ? `${symbol.trim()} ` : "";
    const [integer, fractional] = amount.split(".");
    let _fractional = fractional
        ? fractional.length < precision
            ? fractional
            : roundFractional(fractional, precision)
        : "";
    let _integer = integer;
    if (_fractional.length > precision) {
        _fractional = _fractional.substring(_fractional.length - precision, _fractional.length);
        _integer = String(Number(integer) + 1);
    }
    _fractional = padRight(_fractional, precision);
    const _amount = [_integer, _fractional].join(".");
    return `${_symbol}${_amount}`;
};
//# sourceMappingURL=math.js.map