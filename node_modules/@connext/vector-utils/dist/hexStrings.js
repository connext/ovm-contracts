"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRandomBytes32 = exports.getRandomAddress = exports.isValidBytes32 = exports.getBytes32Error = exports.isValidAddress = exports.getAddressError = exports.isValidHexString = exports.getHexStringError = void 0;
const address_1 = require("@ethersproject/address");
const bytes_1 = require("@ethersproject/bytes");
const random_1 = require("@ethersproject/random");
exports.getHexStringError = (value, length) => {
    if (typeof value !== "string") {
        return `Invalid hex string: ${value} is a ${typeof value}, expected a string`;
    }
    if (!value.startsWith("0x")) {
        return `Invalid hex string: ${value} doesn't start with 0x`;
    }
    if (!bytes_1.isHexString(value)) {
        return `Invalid hex string: ${value}`;
    }
    if (length && bytes_1.hexDataLength(value) !== length) {
        return `Invalid hex string of length ${length}: ${value} is ${bytes_1.hexDataLength(value)} bytes long`;
    }
    return undefined;
};
exports.isValidHexString = (value) => !exports.getHexStringError(value);
exports.getAddressError = (value) => {
    try {
        const hexError = exports.getHexStringError(value, 20);
        if (hexError)
            return hexError;
        address_1.getAddress(value);
        return undefined;
    }
    catch (e) {
        return e.message;
    }
};
exports.isValidAddress = (value) => !exports.getAddressError(value);
exports.getBytes32Error = (value) => {
    const hexStringError = exports.getHexStringError(value, 32);
    if (hexStringError)
        return hexStringError;
    return undefined;
};
exports.isValidBytes32 = (value) => !exports.getBytes32Error(value);
exports.getRandomAddress = () => address_1.getAddress(bytes_1.hexlify(random_1.randomBytes(20)));
exports.getRandomBytes32 = () => bytes_1.hexlify(random_1.randomBytes(32));
//# sourceMappingURL=hexStrings.js.map