"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.keyify = exports.safeJsonParse = exports.safeJsonStringify = exports.stringify = exports.deBigNumberifyJson = exports.bigNumberifyJson = void 0;
const bignumber_1 = require("@ethersproject/bignumber");
const bigNumbers_1 = require("./bigNumbers");
const strings_1 = require("./strings");
function bigNumberifyJson(json) {
    return typeof json === "string"
        ? json
        : JSON.parse(JSON.stringify(json), (key, value) => value && value._hex && value._isBigNumber
            ? bigNumbers_1.toBN(value._hex)
            : value && value.hex && value.type === "BigNumber"
                ? bigNumbers_1.toBN(value.hex)
                : value);
}
exports.bigNumberifyJson = bigNumberifyJson;
function deBigNumberifyJson(json) {
    return JSON.parse(JSON.stringify(json), (key, value) => value && bigNumbers_1.isBN(value) && value.toHexString ? value.toHexString() : value);
}
exports.deBigNumberifyJson = deBigNumberifyJson;
exports.stringify = (value, abrv = false, spaces = 2) => JSON.stringify(value, (key, value) => value && value._hex
    ? bignumber_1.BigNumber.from(value).toString()
    : abrv && value && typeof value === "string" && value.startsWith("vector")
        ? strings_1.abbreviate(value)
        : abrv && value && typeof value === "string" && value.startsWith("0x") && value.length > 12
            ? strings_1.abbreviate(value)
            : value, spaces);
const nullify = (key, value) => (typeof value === "undefined" ? null : value);
exports.safeJsonStringify = (value) => {
    try {
        return typeof value === "string" ? value : JSON.stringify(value, nullify);
    }
    catch (e) {
        return value;
    }
};
function safeJsonParse(value) {
    try {
        return typeof value === "string" ? JSON.parse(value, nullify) : value;
    }
    catch (e) {
        return value;
    }
}
exports.safeJsonParse = safeJsonParse;
exports.keyify = (templateObj, dataObj, key) => {
    const template = key ? templateObj[key] : templateObj;
    const data = key ? dataObj[key] : dataObj;
    let output;
    if (bigNumbers_1.isBN(template) || typeof template !== "object") {
        output = data;
    }
    else if (typeof template === "object" && typeof template.length === "number") {
        output = [];
        for (const index in template) {
            output.push(exports.keyify(template, data, index));
        }
    }
    else if (typeof template === "object" && typeof template.length !== "number") {
        output = {};
        for (const subkey in template) {
            output[subkey] = exports.keyify(template, data, subkey);
        }
    }
    else {
        throw new Error(`Couldn't keyify, unrecogized key/value: ${key}/${data}`);
    }
    return output;
};
//# sourceMappingURL=json.js.map